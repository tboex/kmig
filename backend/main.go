package main

import (
	"net"
	"os"

	"github.com/go-redis/redis"
	proto "github.com/tboex/kmig/api/proto"
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
	var dictionary = util.LoadDictionary(sugar)

	// Connect to Redis
	sugar.Info("Connecting to Redis")
	cache := redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_ADDR"),
	})
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

	sugar.Info(util.GenerateGameID())
	sugar.Infoln("KMIG RPC service running on :50051")
	if err := grpcServer.Serve(listener); err != nil {
		sugar.Errorf("Failed to serve: %v", err)
	}
}
