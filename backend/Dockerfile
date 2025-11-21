FROM node:20-alpine

WORKDIR /app

# Install only production + Prisma deps (no dev, no optional like fsevents)
COPY package*.json ./
RUN npm ci --omit=dev --omit=optional

# Copy Prisma schema & source
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma client and build TS → JS
RUN npx prisma generate && npm run build

EXPOSE 4000

# Run migrations then start API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]