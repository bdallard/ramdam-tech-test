# ===== BUILD STAGE =====
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ENV NODE_ENV=production

RUN npm run build
RUN npm ci --only=production

# ===== RUNTIME STAGE =====
FROM node:18-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

#non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Note: In production, consider using secrets manager
COPY ./google-cloud-vision-credentials-52ae90fa194e.json ./google-cloud-vision-credentials-52ae90fa194e.json 

USER appuser

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]