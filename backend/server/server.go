package main

import (
	"net"
	"sync"

	"github.com/go-redis/redis"
	"github.com/jmoiron/sqlx"
	proto "github.com/tboex/kmig/api/proto"
	"github.com/tboex/kmig/util"
	"go.uber.org/zap"

	"google.golang.org/grpc"
)

type kmigServer struct {
	proto.UnimplementedKmigServer
	mu     sync.Mutex
	db     *sqlx.DB
	cache  *redis.Client
	logger *zap.SugaredLogger
}

func main() {
	// Create Logger
	logger := util.CreateLogger()
	defer logger.Sync() // flushes buffer, if any
	sugar := logger.Sugar()

	listener, err := net.Listen("tcp", ":50051")
	if err != nil {
		sugar.Errorf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	// proto.RegisterKmigServer(grpcServer, &kmigServer{db: db, cache: cache, logger: sugar})
	proto.RegisterKmigServer(grpcServer, &kmigServer{logger: sugar})

	sugar.Info(util.GenerateGameID())
	sugar.Infoln("KMIG RPC service running on :50051")
	if err := grpcServer.Serve(listener); err != nil {
		sugar.Errorf("Failed to serve: %v", err)
	}
}
