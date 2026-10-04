import { render } from "@testing-library/react";
import { HtmlContent } from "@/components/common/HtmlContent";
import { buildTimelineSteps } from "@/lib/status";
import { performanceRank } from "@/lib/performance";
import { getEvidenceFileName, validateUploadFiles } from "@osass/frontend-core/files";
import { isValidNewPassword } from "@osass/frontend-core/password";

describe("frontend audit regressions", () => {
  it("removes executable stored HTML while preserving formatting", () => {
    const { container } = render(<HtmlContent html={'<p><strong>Evidence</strong></p><img src="x" onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">link</a>'} />);
    expect(container.querySelector("strong")?.textContent).toBe("Evidence");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")?.hasAttribute("onerror")).toBe(false);
    expect(container.querySelector("a")?.hasAttribute("href")).toBe(false);
  });

  it("reads signed evidence names from the URL path", () => {
    expect(getEvidenceFileName("https://storage.example/evidence/My%20Paper.pdf?X-Amz-Signature=secret&response-content-disposition=attachment")).toBe("My Paper.pdf");
  });

  it("accepts the allowlist and rejects unsupported or oversized uploads", () => {
    for (const extension of ["pdf", "png", "jpg", "jpeg", "docx", "xlsx"]) {
      expect(validateUploadFiles([new File(["evidence"], `file.${extension}`)])).toBeNull();
    }
    expect(validateUploadFiles([new File(["old document"], "file.doc")])).toContain("Unsupported file");
    const file = new File(["evidence"], "file.pdf");
    Object.defineProperty(file, "size", { value: 20 * 1024 * 1024, configurable: true });
    expect(validateUploadFiles([file])).toBeNull();
    Object.defineProperty(file, "size", { value: 20 * 1024 * 1024 + 1 });
    expect(validateUploadFiles([file])).toContain("20 MB");
  });

  it("validates new password boundaries", () => {
    expect(isValidNewPassword("a".repeat(11))).toBe(false);
    expect(isValidNewPassword("a".repeat(12))).toBe(true);
    expect(isValidNewPassword("a".repeat(72))).toBe(true);
    expect(isValidNewPassword("a".repeat(73))).toBe(false);
  });

  it("matches API review labels and terminal decisions", () => {
    const steps = buildTimelineSteps("Faculty Review", "Under Review");
    expect(steps[1].status).toBe("completed");
    expect(steps[2].status).toBe("current");
    expect(buildTimelineSteps("Draft", "Draft").every(step => step.status === "upcoming")).toBe(true);
    expect(buildTimelineSteps("Council Decision", "Approved").every(step => step.status === "completed")).toBe(true);
    expect(buildTimelineSteps("External Assessment", "Under Review")[3].status).toBe("current");
  });

  it("does not classify inadequate as adequate", () => {
    expect(performanceRank("In Adequate")).toBe(0);
    expect(performanceRank("Adequate")).toBe(1);
  });
});
