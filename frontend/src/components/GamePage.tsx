import { useState } from 'react';
import Toolbar from './Toolbar'
import { startGame } from '../services/game';

export default function GamePage() {
    const [mode, setMode] = useState<'solo' | 'multi'>('solo');
    const [toolbarMode, setToolbarMode] = useState<'guesses' | 'timer'>('guesses');
    const [guessCount, setGuessCount] = useState<number>(5);
    const [timerDuration, setTimerDuration] = useState<number>(30);
    const [gameData, setGameData] = useState<any>(null);

    async function handleStartGame() {
        try {
            const data = await startGame(mode, guessCount, timerDuration);
            setGameData(data);
            // Do something with the game data (e.g., navigate, update UI)
        } catch (err) {
            alert("Failed to start game");
        }
    }

    return (
        <main className="game-page w-full flex-1 flex flex-col  bg-serika-dark--bg-color">
            <Toolbar
                mode={mode}
                setMode={setMode}
                toolbarMode={toolbarMode}
                setToolbarMode={setToolbarMode}
                guessCount={guessCount}
                setGuessCount={setGuessCount}
                timerDuration={timerDuration}
                setTimerDuration={setTimerDuration}
            />
            <div className="game-bar flex-1 flex items-center justify-center">
                <h1 className="text-serika-dark--text-color text-3xl font-bold">
                    {mode === 'solo' ? 'Solo Game' : 'Multiplayer Game'}
                </h1>
                <button
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={handleStartGame}
                >
                    Start Single Player Game
                </button>
            </div>
            {gameData && (
                <pre className="text-white">{JSON.stringify(gameData, null, 2)}</pre>
            )}
        </main>
    );
}
