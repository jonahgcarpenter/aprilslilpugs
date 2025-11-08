FROM node:20-alpine AS builder

WORKDIR /app

COPY client/package*.json ./

RUN npm install

COPY client/ ./

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./ 

RUN npm ci --only=production

COPY server/ .

COPY --from=builder /server/build ./build

EXPOSE 3000

CMD ["npm", "start"]

