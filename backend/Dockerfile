FROM golang:1.23.5-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

ENV REDIS_ADDR=10.23.93.67:6379

RUN go build -o kmig-server ./main.go

FROM debian:bullseye-slim

COPY --from=builder /app/kmig-server /kmig-server

EXPOSE 50051

CMD ["/kmig-server"]