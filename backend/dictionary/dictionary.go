package dictionary

import (
	"encoding/csv"
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

func pickLoadPath(logger *zap.SugaredLogger) string {
	// Loads the dictionary from a file.
	path := os.Getenv("DICT_PATH")
	if path == "" {
		return "dictionary/dictionary.csv"
	}
	absPath, err := filepath.Abs(path)
	if err != nil {
		logger.Errorf("Error getting absolute path: %v", err)
	}
	return absPath
}

func LoadDictionary(logger *zap.SugaredLogger) map[string]Word {
	// Loads the dictionary from a file.
	logger.Debug("Loading dictionary")
	file, err := os.Open(pickLoadPath(logger))
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
