import { useState } from 'react';
import Toolbar from './Toolbar'

export default function GamePage() {
    const [mode, setMode] = useState<'solo' | 'multi'>('solo');
    const [toolbarMode, setToolbarMode] = useState<'guesses' | 'timer'>('guesses');
    const [guessCount, setGuessCount] = useState<number>(5);
    const [timerDuration, setTimerDuration] = useState<number>(30);

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
            </div>
        </main>
    );
}
