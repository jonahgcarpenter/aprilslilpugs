FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY client/package*.json ./

RUN npm install

COPY client/ ./

RUN npm run build

FROM golang:1.25-alpine AS backend-builder

WORKDIR /app

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api/main.go

FROM alpine:3.23.2

LABEL org.opencontainers.image.source="https://github.com/jonahgcarpenter/aprilslilpugs"

WORKDIR /app

RUN apk --no-cache add ca-certificates \
  && addgroup -S aprilslilpugs \
  && adduser -S aprilslilpugs -G aprilslilpugs

COPY --from=backend-builder /app/server .

COPY --from=frontend-builder /app/dist ./public/dist

RUN mkdir -p ./public/uploads \
  && chown -R aprilslilpugs:aprilslilpugs /app

EXPOSE 4000

USER aprilslilpugs

CMD ["./server"]
