import re
import json
import subprocess
import sys
from pathlib import Path


PLACEHOLDER = re.compile(
    r"^(?:\$\{[^}]+\}|<[^>]+>|(?:your|replace|change|example|placeholder|dummy|test-only)[-_ ].*|x{3,})$",
    re.IGNORECASE,
)
SENSITIVE = re.compile(
    r"(?:password|passwd|secret|token|signingkey|privatekey|apikey|accesskey|"
    r"jwt.*key|bootstrap.*email|minio_root_user)", re.IGNORECASE
)
PATTERNS = [
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}\b"),
    re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b"),
    re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"),
    re.compile(r"\b(?:postgres(?:ql)?|redis|https?)://[^\s/:]+:[^\s/@]+@"),
]


def violations(path, contents):
    findings = []
    if path.name.startswith("appsettings") and path.suffix == ".json":
        configuration = json.loads(contents)
        def inspect(value, ancestors=()):
            if isinstance(value, dict):
                for key, child in value.items():
                    inspect(child, (*ancestors, key))
            elif isinstance(value, list):
                for child in value:
                    inspect(child, ancestors)
            elif isinstance(value, str) and value and ancestors:
                if ancestors[:2] == ("EmailConfig", "Templates"):
                    return
                if SENSITIVE.search(ancestors[-1]) and not PLACEHOLDER.fullmatch(value):
                    key_pattern = re.escape(json.dumps(ancestors[-1]))
                    value_pattern = re.escape(json.dumps(value))
                    match = re.search(key_pattern + r"\s*:\s*" + value_pattern, contents)
                    number = contents.count("\n", 0, match.start()) + 1 if match else 1
                    findings.append((number, "non-placeholder secret configuration"))
        inspect(configuration)
    for number, line in enumerate(contents.splitlines(), 1):
        if any(pattern.search(line) for pattern in PATTERNS):
            findings.append((number, "credential pattern"))
        if path.name.startswith(".env"):
            match = re.match(r"\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)", line)
            if match and SENSITIVE.search(match[1]):
                value = match[2].split(" #", 1)[0].strip().strip("\"'")
                if value and not PLACEHOLDER.fullmatch(value):
                    findings.append((number, "non-placeholder secret assignment"))
    return findings


def main():
    paths = subprocess.check_output(["git", "ls-files", "-z"]).decode().split("\0")
    failed = False
    for relative in filter(None, paths):
        path = Path(relative)
        if not path.is_file():
            continue
        raw = path.read_bytes()
        if b"\0" in raw:
            continue
        for number, reason in violations(path, raw.decode("utf-8", errors="replace")):
            print(f"{relative}:{number}: {reason}; value suppressed")
            failed = True
    if failed:
        print("Secret scan failed. Replace committed credentials and rotate exposed values externally.")
    else:
        print("Secret scan passed for tracked working-tree files.")
    return int(failed)


if __name__ == "__main__":
    sys.exit(main())
