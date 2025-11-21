# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source + Prisma schema
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client and build TS -> JS
RUN npx prisma generate && npm run build

EXPOSE 4000

# On container start: run migrations (safe for SQLite) and then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]