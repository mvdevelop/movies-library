# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source files
COPY . .

# Build the frontend
RUN npm run build

# Build the server
RUN npm run server:build

# Production stage
FROM node:20-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001 -g "nodejs"

# Copy only necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/server/package*.json ./server/
COPY --from=builder --chown=nextjs:nodejs /app/server/dist/ ./server/dist/
COPY --from=builder --chown=nextjs:nodejs /app/dist/ ./dist/

# Install only production dependencies
USER root
RUN npm ci --omit=dev --legacy-peer-deps
USER nextjs

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "server/dist/index.js"]
