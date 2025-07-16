const API_BASE_URL = import.meta.env.VITE_KMIG_API_URL || "http://localhost:8000";

export async function startGame(
    mode: 'solo' | 'multi',
    guessCount: number,
    timerDuration: number,
) {
    if (mode === 'solo') {
        const res = await fetch(`${API_BASE_URL}/kmig/v1/game/single`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "player_name": 'tim',
                'player_id': 'timboex',
                'guess_count': guessCount,
                'max_time': timerDuration,
            })
        });
        if (!res.ok) throw new Error("Failed to start single player game");
        return res.json();
    }
}
