FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY src ./src
COPY index.html tsconfig.json eslint.config.js ./
RUN npm run build

FROM node:22-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
