package settings

import "os"

var BaseGameURL = getEnv("BaseGameURL", "http://localhost:3000/game/")

// getEnv get key environment variable if exist, otherwise return defaultValue
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return defaultValue
	}
	return value
}
