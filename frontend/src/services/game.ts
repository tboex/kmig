const API_BASE_URL = import.meta.env.VITE_KMIG_API_URL || "http://localhost:8000";

export async function startGame(
    mode: 'solo' | 'multi',
    username: string,
    guessCount?: number,
    timerDuration?: number,
    word?: string,
) {
    if (mode === 'solo') {
        const res = await fetch(`${API_BASE_URL}/kmig/v1/game/single`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'player_name': username, // TODO: use actual player name
                'player_id': username,
                'guess_count': guessCount,
                'max_time': timerDuration,
                'word': word,
            })
        });
        if (!res.ok) throw new Error('Failed to start single player game');
        return res.json();
    }
    else {
        const res = await fetch(`${API_BASE_URL}/kmig/v1/game/multi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'player_name': username,
                'player_id': username,
                'guess_count': guessCount,
                'max_time': timerDuration,
                'word': word,
            })
        });
        if (!res.ok) throw new Error('Failed to start single player game');
        return res.json();
    }
}

export async function submitWord(gameId: string, word: string, username: string) {
    const res = await fetch(`${API_BASE_URL}/kmig/v1/game/${gameId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'player_name': username,
            'player_id': username,
            'word': word,
         }),
    });
    if (!res.ok) throw new Error('Failed to submit word');
    return res.json();
}

export async function getBotTurn(gameId: string) {
    const res = await fetch(`${API_BASE_URL}/kmig/v1/game/${gameId}/bot-turn`);
    if (!res.ok) throw new Error('Failed to get bot turn');
    return res.json();
}


export async function getGameStatus(gameId: string) {
    const res = await fetch(`${API_BASE_URL}/kmig/v1/game/${gameId}`);
    if (!res.ok) throw new Error('Failed to get game status');
    return res.json();
}
