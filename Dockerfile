# Multi-stage build for production deployment
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production server with nginx
FROM nginx:alpine AS production

# Install nodejs and curl for health checks
RUN apk add --no-cache nodejs npm curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy PWA assets to nginx html directory
COPY --from=builder /app/public/manifest.json /usr/share/nginx/html/
COPY --from=builder /app/public/sw.js /usr/share/nginx/html/
COPY --from=builder /app/public/icons /usr/share/nginx/html/icons

# Create a startup script
RUN echo '#!/bin/sh' > /startup.sh && \
    echo 'nginx -g "daemon off;"' >> /startup.sh && \
    chmod +x /startup.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["/startup.sh"]