# ================================
# Stage 1: Build
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# ================================
# Stage 2: Production
# ================================
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app ./

RUN mkdir -p uploads

EXPOSE 5007

CMD ["node", "server.js"]
