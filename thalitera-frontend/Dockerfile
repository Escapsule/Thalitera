# frontend/Dockerfile
FROM node:20 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_BACKEND_URL=http://backend:8080
EXPOSE 3000
CMD ["npm", "start"]