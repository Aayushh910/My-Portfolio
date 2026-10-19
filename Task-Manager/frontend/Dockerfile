# ==========================================
# Stage 1: Build the Vite production bundle
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Cache package manifests
COPY package*.json ./

# Install all dependencies (including devDependencies required for Vite build)
RUN npm ci

# Copy frontend source code
COPY . .

# Build optimized production bundle
RUN npm run build

# ==========================================
# Stage 2: Serve static bundle via Nginx
# ==========================================
FROM nginx:alpine-slim AS runner

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SSE reverse proxy and SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Healthcheck probe
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
