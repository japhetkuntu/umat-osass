# ── Stage 1: Build (Bun) ─────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS build
WORKDIR /app

COPY bun.lockb package.json ./
RUN bun install

COPY . .

ARG VITE_IDENTITY_API_URL
ARG VITE_NON_ACADEMIC_API_URL
ENV VITE_IDENTITY_API_URL=$VITE_IDENTITY_API_URL
ENV VITE_NON_ACADEMIC_API_URL=$VITE_NON_ACADEMIC_API_URL

RUN bun run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
