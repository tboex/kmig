FROM golang:1.23.5-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o kmig-server ./main.go

FROM debian:bullseye-slim

# Copy the binary from the builder stage
COPY --from=builder /app/kmig-server /kmig-server

# Copy the dictionary.csv file to the appropriate location
COPY --from=builder /app/backend/dictionary/dictionary.csv /app/backend/dictionary/dictionary.csv

EXPOSE 50051

CMD ["/kmig-server"]