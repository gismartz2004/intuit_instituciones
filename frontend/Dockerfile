# ================================
# Stage 1: Dependencies
# ================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# ================================
# Stage 2: Builder
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and config files
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=https://arg-academy-be-dev-591566273209.europe-west1.run.app
# imprimir variable para debug
RUN echo "VITE_API_BASE_URL is set to: $VITE_API_BASE_URL"

# Build the application
RUN npm run build

# ================================
# Stage 3: Production with Nginx
# ================================
FROM nginx:1.25-alpine AS runner

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user and prepare temp directories
RUN addgroup -g 1001 -S nginx-group && \
  adduser -S nginx-user -u 1001 -G nginx-group && \
  mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
  chown -R nginx-user:nginx-group /usr/share/nginx/html && \
  chmod -R 755 /usr/share/nginx/html && \
  chown -R nginx-user:nginx-group /var/cache/nginx && \
  chown -R nginx-user:nginx-group /var/log/nginx && \
  chown -R nginx-user:nginx-group /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
  touch /var/run/nginx.pid && \
  chown -R nginx-user:nginx-group /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
