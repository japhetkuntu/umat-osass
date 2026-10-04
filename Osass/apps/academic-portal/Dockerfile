# ── Stage 1: Build (npm) ─────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json tsconfig.package.json ./
COPY apps/academic-assessment-portal/package.json ./apps/academic-assessment-portal/package.json
COPY apps/academic-portal/package.json ./apps/academic-portal/package.json
COPY apps/admin-portal/package.json ./apps/admin-portal/package.json
COPY apps/non-academic-assessment-portal/package.json ./apps/non-academic-assessment-portal/package.json
COPY apps/non-academic-portal/package.json ./apps/non-academic-portal/package.json
COPY packages ./packages
RUN npm ci

COPY apps ./apps

# Vite bakes VITE_* variables into the static bundle at build time
ARG VITE_IDENTITY_API_URL
ARG VITE_ACADEMIC_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_IDENTITY_API_URL=$VITE_IDENTITY_API_URL
ENV VITE_ACADEMIC_API_URL=$VITE_ACADEMIC_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

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

RUN npm run build --workspace=apps/academic-portal

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/apps/academic-portal/dist /usr/share/nginx/html

# SPA config: let React Router handle all client-side routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
