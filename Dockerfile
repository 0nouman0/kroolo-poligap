# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Optional: for native modules like sharps
RUN apk add --no-cache libc6-compat

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# ⬇️ Copy the .env file explicitly before build
COPY .env .env

# Copy all remaining app code
COPY . .

# Build Next.js app (uses .env here)
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Optional: secure image with non-root user
RUN addgroup -g 1001 -S nodegroup && adduser -S nodeuser -u 1001 -G nodegroup

# Copy only production assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# ⬇️ Fix permission issue by pre-creating the image cache directory
RUN mkdir -p .next/cache/images && chown -R nodeuser:nodegroup .next

# Set the non-root user AFTER fixing permissions
USER nodeuser

EXPOSE 3000

CMD ["npm", "run", "start"]
