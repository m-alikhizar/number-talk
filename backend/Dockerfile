FROM node:20-alpine

WORKDIR /app

# Only copy package.json (no lockfile) and install prod deps
COPY package.json ./
RUN npm install --omit=dev --omit=optional

# Copy Prisma schema & source
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma client and build TS -> JS
RUN npx prisma generate && npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]