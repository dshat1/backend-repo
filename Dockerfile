# Use official Node LTS image
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install build tools needed to compile native modules (bcrypt)
RUN apk add --no-cache python3 make g++ build-base

# Install dependencies (will compile native addons)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Final image (runtime only)
FROM node:20-alpine
WORKDIR /usr/src/app
# Copy built app and node_modules from builder stage
COPY --from=builder /usr/src/app .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "app.js"]
