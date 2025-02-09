package server

import (
	"context"
	"sync"

	"github.com/go-redis/redis"
	"github.com/jmoiron/sqlx"
	"github.com/tboex/kmig/api/proto"
	"github.com/tboex/kmig/dictionary"
	"github.com/tboex/kmig/util"
	"go.uber.org/zap"
)

type KmigServer struct {
	proto.UnimplementedKmigServer
	Dictionary map[string]dictionary.Word
	Mu         sync.Mutex
	Db         *sqlx.DB
	Cache      *redis.Client
	Logger     *zap.SugaredLogger
}

func (s *KmigServer) StartSinglePlayerGame(ctx context.Context, req *proto.SinglePlayerRequest) (*proto.WordSubmissionResponse, error) {
	var userId = req.UserId
	var gameId = util.GenerateGameID()

	word := util.GetRandomWord(s.Dictionary)

	StoreGuess(s, gameId, word.Korean)

	return &proto.WordSubmissionResponse{
		UserId:         userId,
		GameId:         gameId,
		Korean:         word.Korean,
		Pronounciation: word.Pronounciation,
		Hanja:          word.Hanja,
		PartOfSpeech:   word.PartofSpeech,
		Description:    word.Descripton,
		English:        word.English,
	}, nil
}

func (s *KmigServer) StartMultiplayerGame(ctx context.Context, req *proto.MultiplayerRequest) (*proto.MultiplayerResponse, error) {
	var gameId = util.GenerateGameID()
	var InviteUrl = util.GetGameURL(gameId)

	return &proto.MultiplayerResponse{
		UserId:    req.UserId,
		GameId:    gameId,
		InviteUrl: InviteUrl,
	}, nil
}

func (s *KmigServer) SubmitWord(ctx context.Context, req *proto.WordSubmission) (*proto.WordSubmissionResponse, error) {
	// Takes a submitted word, checks if it is valid, and returns a response.
	var word = req.Word

	s.Mu.Lock()
	defer s.Mu.Unlock()

	validGuess, msg := VerifyGuess(s, req.GameId, word)

	if !validGuess {
		return &proto.WordSubmissionResponse{
			Accepted: false,
			Victory:  false,
			GameId:   req.GameId,
			Error:    msg,
		}, nil
	}

	if _, exists := s.Dictionary[word]; exists {
		s.Logger.Info("Word exists in dictionary")
		matchedWord := util.FindValidMatch(word, s.Dictionary)
		if matchedWord != (dictionary.Word{}) {
			err := StoreGuess(s, req.GameId, word)
			if err != nil {
				s.Logger.Errorw("Error storing guess",
					"error", err,
				)
			}

			return &proto.WordSubmissionResponse{
				Accepted:       true,
				Victory:        false,
				GameId:         req.GameId,
				Korean:         matchedWord.Korean,
				Pronounciation: matchedWord.Pronounciation,
				Hanja:          matchedWord.Hanja,
				PartOfSpeech:   matchedWord.PartofSpeech,
				Description:    matchedWord.Descripton,
				English:        matchedWord.English,
			}, nil
		}

		// No word was able to be matched, player is victorious
		return &proto.WordSubmissionResponse{
			Accepted: true,
			Victory:  true,
			GameId:   req.GameId,
		}, nil
	}

	// Word not found in dictionary
	return &proto.WordSubmissionResponse{
		Accepted: false,
		Victory:  false,
		GameId:   req.GameId,
		Error:    "Word not found in dictionary",
	}, nil
}
