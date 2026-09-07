# =========================
# Stage 1 - Builder
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma

# Generate prisma client
RUN npx prisma generate



# Copy source code
COPY . .

# Build TypeScript
RUN npm run build



# =========================
# Stage 2 - Production
# =========================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy build files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/default_uploads ./default_uploads

# Expose backend port
EXPOSE 5004

# Start application
CMD ["sh", "-c", "npx prisma migrate deploy && mkdir -p /app/uploads/quotations && cp -n /app/default_uploads/quotations/* /app/uploads/quotations/ || true && node dist/index.js"]
