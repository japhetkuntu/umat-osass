# ── Stage 1: Build (Bun) ─────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS build
WORKDIR /app

# Install dependencies using the lockfile for reproducible builds
COPY bun.lockb package.json ./
RUN bun install

# Copy source
COPY . .

# Vite bakes VITE_* variables into the static bundle at build time
ARG VITE_IDENTITY_API_URL
ARG VITE_ACADEMIC_API_URL
ENV VITE_IDENTITY_API_URL=$VITE_IDENTITY_API_URL
ENV VITE_ACADEMIC_API_URL=$VITE_ACADEMIC_API_URL

# Landing-page links to sibling OSASS portals
ARG VITE_ACADEMIC_PORTAL_URL
ARG VITE_NON_ACADEMIC_PORTAL_URL
ARG VITE_ACADEMIC_ASSESSMENT_PORTAL_URL
ARG VITE_NON_ACADEMIC_ASSESSMENT_PORTAL_URL
ARG VITE_ADMIN_PORTAL_URL
ENV VITE_ACADEMIC_PORTAL_URL=$VITE_ACADEMIC_PORTAL_URL
ENV VITE_NON_ACADEMIC_PORTAL_URL=$VITE_NON_ACADEMIC_PORTAL_URL
ENV VITE_ACADEMIC_ASSESSMENT_PORTAL_URL=$VITE_ACADEMIC_ASSESSMENT_PORTAL_URL
ENV VITE_NON_ACADEMIC_ASSESSMENT_PORTAL_URL=$VITE_NON_ACADEMIC_ASSESSMENT_PORTAL_URL
ENV VITE_ADMIN_PORTAL_URL=$VITE_ADMIN_PORTAL_URL

RUN bun run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

# SPA config: let React Router handle all client-side routes
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
