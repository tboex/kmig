package util

import (
	"encoding/csv"
	"fmt"
	"os"
	"path/filepath"

	"go.uber.org/zap"
)

// Dictionary struct
type Word struct {
	Korean         string
	Pronounciation string
	Hanja          string
	PartofSpeech   string
	Descripton     string
	English        string
}

func LoadDictionary(logger *zap.SugaredLogger) map[string]Word {
	// Loads the dictionary from a file.
	absPath, err := filepath.Abs("../backend/dictionary/dictionary.csv")
	if err != nil {
		fmt.Println("Error getting absolute path:", err)
		return nil
	}

	logger.Debug("Loading dictionary")
	file, err := os.Open(absPath)
	if err != nil {
		logger.Errorw("Error opening file",
			"error", err,
		)
	}
	defer file.Close()

	// Create a CSV reader
	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1

	// Read all records from the CSV
	logger.Debug("Reading CSV")
	records, err := reader.ReadAll()
	if err != nil {
		logger.Errorw("Error reading CSV",
			"error", err,
		)
	}

	// Slice to store the CSV
	var dictionary = make(map[string]Word)

	logger.Info("Loading dictionary")
	for _, record := range records {
		word := Word{
			Korean:         record[0],
			Pronounciation: record[1],
			Hanja:          record[2],
			PartofSpeech:   record[3],
			Descripton:     record[4],
			English:        record[5],
		}
		dictionary[word.Korean] = word
	}

	return dictionary
}
