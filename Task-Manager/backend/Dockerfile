# Production-grade Node.js Alpine image
FROM node:20-alpine AS base

# Install dumb-init for proper PID 1 signal forwarding (SIGTERM / SIGINT)
RUN apk add --no-cache dumb-init curl wget

WORKDIR /usr/src/app

# Copy package manifests first for optimal layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code
COPY . .

# Ensure app runs as unprivileged 'node' user for security
RUN chown -R node:node /usr/src/app
USER node

# Default environment variables
ENV NODE_ENV=production \
    PORT=5000

# Expose backend REST API port
EXPOSE 5000

# Container healthcheck querying API health probe
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start server with graceful signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
