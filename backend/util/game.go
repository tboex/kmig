package util

import (
	"math/rand"

	"github.com/tboex/kmig/dictionary"
	"github.com/tboex/kmig/settings"
)

var activeGames = make(map[string]GameSession)

type GameSession struct {
	ID      string
	Players []string
}

type Word = dictionary.Word

// Generates a new game ID and creates a new game session.
func CreateGame() string {
	gameId := GenerateGameID()

	// TODO create game and keep it in memory
	activeGames[gameId] = GameSession{
		ID: gameId,
	}

	return gameId
}

// Gets the game URL for the given game ID.
func GetGameURL(gameId string) string {
	return settings.BaseGameURL + gameId
}

func FindValidMatch(submittedWord string, dictionary map[string]dictionary.Word) dictionary.Word {
	// Finds a valid match for the given word in the dictionary.
	// This assumes that the word that was requested exists in the dictionary so is a valid word.

	// See if any words in the dictionary start with the final character
	var matchList = make([]Word, 0)
	for _, word := range dictionary {
		if DoesFinalCharMatch(submittedWord, word.Korean) {
			matchList = append(matchList, word)
		}
	}

	// Return a random word from the match list
	if len(matchList) == 0 {
		return Word{}
	}

	return matchList[rand.Intn(len(matchList))]
}

func DoesFinalCharMatch(submittedWord, lastWord string) bool {
	// Convert the word to a slice of runes so that the Korean character can be preserved
	runes := []rune(submittedWord)
	finalChar := runes[len(runes)-1]

	// Get the first chracter of the Previous word
	runes = []rune(lastWord)
	firstChar := runes[0]

	return firstChar == finalChar
}

func GetRandomWord(dictionary map[string]dictionary.Word) dictionary.Word {
	// Convert map keys to a slice
	keys := make([]string, 0, len(dictionary))
	for key := range dictionary {
		keys = append(keys, key)
	}

	// Select a random key from the slice
	randomKey := keys[rand.Intn(len(keys))]

	// Return the corresponding Word from the map
	return dictionary[randomKey]
}
