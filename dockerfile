# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

RUN npx prisma generate --no-engine
RUN npm run build

# Imagen de producción
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./dist/generated
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "start"]