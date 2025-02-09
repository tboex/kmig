package server

import (
	"fmt"
	"time"

	"github.com/go-redis/redis"
	"github.com/tboex/kmig/util"
)

func StoreGuess(s *KmigServer, gameID, word string) error {
	key := fmt.Sprintf("game:session:%s", gameID)
	return s.Cache.RPush(key, word, 1*time.Hour).Err()
}

func GetGuesses(s *KmigServer, gameID string) ([]string, error) {
	key := fmt.Sprintf("game:session:%s", gameID)
	return s.Cache.LRange(key, 0, -1).Result()
}

func DetermineNonRepeatedGuess(s *KmigServer, gameID, word string) bool {
	guesses, err := GetGuesses(s, gameID)

	if err != nil {
		s.Logger.Errorw("Error getting guesses",
			"error", err,
		)
		return false
	}

	for _, guess := range guesses {
		if guess == word {
			return false
		}
	}

	return true
}

func VerifyGuess(s *KmigServer, gameID, word string) (bool, string) {
	// Checks if the submitted word is valid.
	key := fmt.Sprintf("game:session:%s", gameID)

	if !DetermineNonRepeatedGuess(s, gameID, word) {
		return false, "Word has already been used"
	}

	// Get the most recent word (last word in the list)
	lastWord, err := s.Cache.LIndex(key, -1).Result()
	if err == redis.Nil {
		// If no words exist in session, assume first word is valid
		return true, ""
	} else if err != nil {
		return false, "Error getting last word"
	}

	// Check if the new word starts with the last character of the previous word
	if util.DoesFinalCharMatch(lastWord, word) {
		// Store the new valid guess in Redis
		//err := s.Cache.RPush(key, word).Err()
		return err == nil, ""
	}
	return false, "New word does not start with the last character of the previous word"
}
