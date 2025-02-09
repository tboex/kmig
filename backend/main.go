package main

import (
	"net"
	"os"

	"github.com/go-redis/redis"
	proto "github.com/tboex/kmig/api/proto"
	"github.com/tboex/kmig/dictionary"
	"github.com/tboex/kmig/server"
	"github.com/tboex/kmig/util"

	"google.golang.org/grpc"
)

func main() {
	// Create Logger
	logger := util.CreateLogger()
	defer logger.Sync() // flushes buffer, if any
	sugar := logger.Sugar()

	// Load Korean dictionary
	var dictionary = dictionary.LoadDictionary(sugar)

	// Connect to Redis
	sugar.Info("Connecting to Redis")
	cache := redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_ADDR"),
	})
	_, err := cache.Ping().Result()
	if err != nil {
		sugar.Debugw("Not connected to Redis",
			"address", os.Getenv("REDIS_ADDR"),
			"error", err,
		)
	}
	defer cache.Close()

	listener, err := net.Listen("tcp", ":50051")
	if err != nil {
		sugar.Errorf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	proto.RegisterKmigServer(grpcServer, &server.KmigServer{
		Logger:     sugar,
		Dictionary: dictionary,
		Cache:      cache,
	})

	sugar.Infoln("KMIG RPC service running on :50051")
	if err := grpcServer.Serve(listener); err != nil {
		sugar.Errorf("Failed to serve: %v", err)
	}

	// TESTING Github Actions
}
