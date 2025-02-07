package util

import (
	"crypto/rand"
	"encoding/hex"
)

// GenerateGameID creates a unique ID for a new game session.
func GenerateGameID() string {
	// Generate a random 8-byte ID and convert it to a hex string.
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}
