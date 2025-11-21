# Use Debian-based image instead of alpine to avoid Prisma/OpenSSL issues
FROM node:20

WORKDIR /app

# Install deps (including dev) but skip optional (no fsevents)
COPY package.json ./
RUN npm install --omit=optional

# Copy Prisma schema & source
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma client and build TS -> JS
RUN npx prisma generate && npm run build

EXPOSE 4000

# Run migrations then start API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]