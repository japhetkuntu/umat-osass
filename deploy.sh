#!/usr/bin/env bash
# =============================================================================
# UMaT OSASS – Production Deployment Script
# =============================================================================
# Usage:
#   ./deploy.sh              Full deploy: validate → build → start → health check
#   ./deploy.sh --ssl        Provision Let's Encrypt SSL (run after first deploy)
#   ./deploy.sh --update     Rebuild changed images and restart services
#   ./deploy.sh --status     Print live service status and routing map
# =============================================================================
set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
readonly COMPOSE_FILE="docker-compose.prod.yml"
readonly ENV_FILE=".env.production"
readonly DOMAIN_BASE="osass.umat.edu.gh"
readonly SUBDOMAINS=(auth-api academic-api nonacademic-api nonacademic nonacademic-assessment assessment admin admin-api)
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@umat.edu.gh}"

# ── Colours ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

log()   { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[ OK ]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERR ]${NC}  $*" >&2; }
die()   { err "$*"; exit 1; }
banner(){ echo -e "\n${BOLD}=== $* ===${NC}"; }

# ── Argument parsing ───────────────────────────────────────────────────────────
MODE="deploy"
for arg in "$@"; do
  case "$arg" in
    --ssl)    MODE="ssl"    ;;
    --update) MODE="update" ;;
    --status) MODE="status" ;;
    --help|-h)
      sed -n '/^# Usage/,/^# ===/p' "$0" | head -n 8 | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) die "Unknown argument: $arg. Use --help for usage." ;;
  esac
done

# ── 1. Prerequisites ───────────────────────────────────────────────────────────
check_prerequisites() {
  banner "Prerequisites"
  command -v docker >/dev/null 2>&1 \
    || die "Docker not installed. Install with: curl -fsSL https://get.docker.com | sh"
  docker compose version >/dev/null 2>&1 \
    || die "Docker Compose plugin not found. Install docker-compose-plugin."
  docker info >/dev/null 2>&1 \
    || die "Docker daemon not running. Run: sudo systemctl start docker"
  ok "Docker       $(docker --version | grep -oP 'version \K[^,]+')"
  ok "Compose      $(docker compose version --short)"
}

# ── 2. Validate .env.production ────────────────────────────────────────────────
validate_env() {
  banner "Environment validation"
  [[ -f "$ENV_FILE" ]] \
    || die "$ENV_FILE not found. Copy .env.production.example and fill in secrets."

  local required_vars=(
    POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB
    MINIO_ROOT_USER MINIO_ROOT_PASSWORD MINIO_BUCKET_NAME
    JWT_ISSUER JWT_AUDIENCE JWT_APPLICANT_KEY JWT_ADMIN_KEY
    EMAIL_PROVIDER
    STORAGE_ACCESS_KEY STORAGE_SECRET_KEY STORAGE_BUCKET STORAGE_REGION
    STORAGE_ENDPOINT STORAGE_CDN_ENDPOINT
    VITE_IDENTITY_API_URL VITE_ACADEMIC_API_URL VITE_NON_ACADEMIC_API_URL
    VITE_ADMIN_API_URL
    VITE_ACADEMIC_PORTAL_URL VITE_NON_ACADEMIC_PORTAL_URL
    VITE_ACADEMIC_ASSESSMENT_PORTAL_URL VITE_NON_ACADEMIC_ASSESSMENT_PORTAL_URL
    VITE_ADMIN_PORTAL_URL
  )

  local missing=()
  for var in "${required_vars[@]}"; do
    local val
    val=$(grep -E "^${var}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- | tr -d '"'"'" || true)
    [[ -z "$val" ]] && missing+=("$var")
  done

  if (( ${#missing[@]} > 0 )); then
    err "Missing or empty variables in $ENV_FILE:"
    printf '  - %s\n' "${missing[@]}"
    die "Fix the variables above and re-run."
  fi

  if grep -q "replace_with_secure_random_key" "$ENV_FILE" 2>/dev/null; then
    warn "Placeholder JWT keys detected in $ENV_FILE – replace before going live!"
  fi
  ok "$ENV_FILE validated (${#required_vars[@]} variables checked)."
}

# ── 3. Validate compose syntax ─────────────────────────────────────────────────
validate_compose() {
  banner "Compose file validation"
  # Set ENV_FILE so compose can read it during config check
  set -a; source "$ENV_FILE"; set +a
  docker compose -f "$COMPOSE_FILE" config --quiet \
    || die "$COMPOSE_FILE has syntax errors. Run: docker compose -f $COMPOSE_FILE config"
  ok "$COMPOSE_FILE syntax OK."

  # Warn if nginx config is missing
  [[ -f "docker/nginx/nginx.conf" ]] \
    || die "docker/nginx/nginx.conf not found. Nginx gateway cannot start."
  ok "docker/nginx/nginx.conf present."
}

# ── 4. Prepare directories ─────────────────────────────────────────────────────
prepare_dirs() {
  banner "Directory setup"
  mkdir -p docker/nginx docker/postgres Osass/EmailTemplates
  ok "Required directories ready."
}

# ── 5. Firewall (ufw) ──────────────────────────────────────────────────────────
configure_firewall() {
  banner "Firewall"
  if ! command -v ufw >/dev/null 2>&1; then
    warn "ufw not found – skipping firewall configuration."
    return
  fi

  sudo ufw allow 22/tcp   comment "SSH"    2>/dev/null
  sudo ufw allow 80/tcp   comment "HTTP"   2>/dev/null
  sudo ufw allow 443/tcp  comment "HTTPS"  2>/dev/null

  # IP mode: open per-service ports when using nginx.ip.conf.
  local nginx_conf="${NGINX_CONF_FILE:-}"
  if [[ "$nginx_conf" == *nginx.ip.conf* ]]; then
    for port in 8001 8002 8003 8004 8081 8082 8083 8084; do
      sudo ufw allow "$port"/tcp comment "OSASS IP-mode service port" 2>/dev/null || true
    done
    ok "Firewall: IP-mode ports 8001-8004, 8081-8084 opened."
  fi

  # Defence-in-depth: block direct access to internal infra ports
  # (they already bind to 127.0.0.1 in prod compose)
  for port in 5432 6379 9000 9001; do
    sudo ufw deny "$port"/tcp comment "Block direct service port" 2>/dev/null || true
  done

  sudo ufw --force enable 2>/dev/null || true
  ok "Firewall: 22 (SSH), 80 (HTTP), 443 (HTTPS) allowed."
}

# ── 6. Pull base images ─────────────────────────────────────────────────────────
pull_images() {
  banner "Pulling base images"
  docker compose -f "$COMPOSE_FILE" pull --ignore-buildable --quiet
  ok "Base images pulled."
}

# ── 7. Build application images ────────────────────────────────────────────────
build_images() {
  banner "Building application images"
  log "This may take 5-15 minutes on first run…"
  # Source env so VITE_* build args are available
  set -a; source "$ENV_FILE"; set +a
  docker compose -f "$COMPOSE_FILE" build --parallel
  ok "All images built."
}

# ── 8. Start / update services ─────────────────────────────────────────────────
start_services() {
  banner "Starting services"
  set -a; source "$ENV_FILE"; set +a
  docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
  ok "Services started."
}

# ── 9. Health checks ───────────────────────────────────────────────────────────
health_checks() {
  banner "Health checks"
  log "Waiting 20 s for containers to initialise…"
  sleep 20

  local containers=(
    osass-postgres osass-redis osass-minio
    osass-identity-api osass-admin-api
    osass-academic-promotion-api osass-non-academic-promotion-api
    osass-academic-portal osass-admin-portal osass-non-academic-portal
    osass-academic-assessment-portal osass-non-academic-assessment-portal
    osass-nginx
  )

  local failed=0
  for c in "${containers[@]}"; do
    local state
    state=$(docker inspect --format='{{.State.Status}}' "$c" 2>/dev/null || echo "missing")
    if [[ "$state" == "running" ]]; then
      ok "$c → running"
    else
      err "$c → $state"
      (( failed++ )) || true
    fi
  done

  # HTTP smoke test
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost/ 2>/dev/null || echo "000")
  if [[ "$http_code" =~ ^[23] ]]; then
    ok "HTTP http://localhost/ → $http_code"
  else
    warn "HTTP http://localhost/ → $http_code (nginx may still be initialising)"
  fi

  (( failed == 0 )) && ok "All health checks passed." \
    || warn "$failed container(s) not running – check logs with: docker logs <name>"
}

# ── 10. SSL provisioning ───────────────────────────────────────────────────────
provision_ssl() {
  banner "SSL – Let's Encrypt"

  # Ensure nginx (and the certbot_www volume) is running
  set -a; source "$ENV_FILE"; set +a
  docker compose -f "$COMPOSE_FILE" up -d nginx certbot
  log "Waiting 5 s for nginx to accept connections…"
  sleep 5

  local domain_flags=(-d "${DOMAIN_BASE}" -d "www.${DOMAIN_BASE}")
  for sub in "${SUBDOMAINS[@]}"; do
    domain_flags+=(-d "${sub}.${DOMAIN_BASE}")
  done

  log "Requesting certificates for: ${DOMAIN_BASE} www.${DOMAIN_BASE} ${SUBDOMAINS[*]/%/.${DOMAIN_BASE}}"
  log "ACME e-mail: $CERTBOT_EMAIL"

  # certbot runs inside the container, shares volumes with nginx
  docker compose -f "$COMPOSE_FILE" run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --non-interactive \
    --agree-tos \
    --email "$CERTBOT_EMAIL" \
    "${domain_flags[@]}" \
    --expand

  ok "Certificates issued to certbot_conf volume (/etc/letsencrypt)."
  warn "Next step: add HTTPS server blocks to docker/nginx/nginx.conf"
  warn "  ssl_certificate /etc/letsencrypt/live/<domain>/fullchain.pem;"
  warn "  ssl_certificate_key /etc/letsencrypt/live/<domain>/privkey.pem;"
  warn "  include /etc/nginx/ssl-params.conf;"
  warn "Then: docker compose -f $COMPOSE_FILE restart nginx"
}

# ── 11. Status / summary ───────────────────────────────────────────────────────
print_summary() {
  local server_ip
  server_ip=$(curl -s --max-time 5 https://ipv4.icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}')

  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║          UMaT OSASS – Platform Deployment Summary           ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${BOLD}Server IP:${NC}   $server_ip"
  echo ""

  echo -e "  ${BOLD}SERVICES:${NC}"
  docker compose -f "$COMPOSE_FILE" ps --format \
    "table {{.Name}}\t{{.Status}}" 2>/dev/null \
    | sed 's/^/    /' \
    || docker ps --filter "name=osass-" --format "    {{.Names}}\t{{.Status}}"

  echo ""
  echo -e "  ${BOLD}ROUTING MAP:${NC}"
  echo "  ┌──────────────────────────────────────────────────────────────────┐"
  printf "  │  %-40s → %-22s│\n" "http://${DOMAIN_BASE}"                       "academic-portal:80"
  printf "  │  %-40s → %-22s│\n" "http://auth-api.${DOMAIN_BASE}"              "identity-api:8080"
  printf "  │  %-40s → %-22s│\n" "http://academic-api.${DOMAIN_BASE}"          "academic-promo-api:8080"
  printf "  │  %-40s → %-22s│\n" "http://nonacademic.${DOMAIN_BASE}"           "non-academic-portal:80"
  printf "  │  %-40s → %-22s│\n" "http://nonacademic-api.${DOMAIN_BASE}"       "non-acad-promo-api:8080"
  printf "  │  %-40s → %-22s│\n" "http://assessment.${DOMAIN_BASE}"            "acad-assessment:80"
  printf "  │  %-40s → %-22s│\n" "http://nonacademic-assessment.${DOMAIN_BASE}" "non-acad-assessment:80"
  printf "  │  %-40s → %-22s│\n" "http://admin.${DOMAIN_BASE}"                 "admin-portal:80"
  printf "  │  %-40s → %-22s│\n" "http://admin-api.${DOMAIN_BASE}"             "admin-api:8080"
  printf "  │  %-40s → %-22s│\n" "http://$server_ip/"                          "→ 301 osass.umat.edu.gh"
  echo "  └──────────────────────────────────────────────────────────────────┘"

  echo ""
  echo -e "  ${BOLD}PUBLIC ACCESS:${NC}"
  echo "    http://osass.umat.edu.gh  (canonical)"
  echo "    http://$server_ip         → redirects to osass.umat.edu.gh"

  echo ""
  local ssl_status="Not configured. Run: ./deploy.sh --ssl"
  if docker compose -f "$COMPOSE_FILE" exec certbot \
       test -d /etc/letsencrypt/live 2>/dev/null; then
    ssl_status="Certificates present. Verify HTTPS blocks in nginx.conf."
  fi
  echo -e "  ${BOLD}SSL:${NC}  $ssl_status"

  echo ""
  echo -e "  ${BOLD}USEFUL COMMANDS:${NC}"
  echo "    Logs:    docker compose -f $COMPOSE_FILE logs -f <service>"
  echo "    Restart: docker compose -f $COMPOSE_FILE restart <service>"
  echo "    Stop:    docker compose -f $COMPOSE_FILE down"
  echo "    Update:  ./deploy.sh --update"
  echo ""
}

# ── Mode dispatch ──────────────────────────────────────────────────────────────
status_mode() {
  check_prerequisites
  print_summary
}

update_mode() {
  check_prerequisites
  validate_env
  log "Pulling and rebuilding changed services…"
  pull_images
  build_images
  start_services
  health_checks
  print_summary
  ok "Update complete."
}

ssl_mode() {
  check_prerequisites
  validate_env
  provision_ssl
  print_summary
}

deploy_mode() {
  echo ""
  echo -e "${BOLD}UMaT OSASS – Production Deployment${NC}  ($(date '+%Y-%m-%d %H:%M:%S %Z'))"
  echo ""
  check_prerequisites
  validate_env
  validate_compose
  prepare_dirs
  configure_firewall
  pull_images
  build_images
  start_services
  health_checks
  print_summary
  ok "Deployment complete!"
  log "To enable HTTPS, run: ./deploy.sh --ssl"
}

case "$MODE" in
  deploy) deploy_mode ;;
  ssl)    ssl_mode    ;;
  update) update_mode ;;
  status) status_mode ;;
esac
