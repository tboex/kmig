import { useState, useEffect } from 'react';
import Toolbar from './Toolbar'
import { startGame } from '../services/game';

export default function GamePage() {
    const [mode, setMode] = useState<'solo' | 'multi'>('solo');
    const [toolbarMode, setToolbarMode] = useState<'guesses' | 'timer'>('guesses');
    const [guessCount, setGuessCount] = useState<number>(5);
    const [timerDuration, setTimerDuration] = useState<number>(30);
    const [gameData, setGameData] = useState<any>(null);

    // New state for the chain and input
    const [chain, setChain] = useState<{ sender: 'bot' | 'user', text: string }[]>([]);
    const [userInput, setUserInput] = useState('');

    async function handleStartGame() {
        try {
            const data = await startGame(mode, guessCount, timerDuration);
            setGameData(data);

            setChain([{ sender: 'bot', text: data.firstWord || '시작!' }]);
        } catch (err) {
            alert("Failed to start game");
        }
    }

    // Call handleStartGame on mount and whenever settings change
    useEffect(() => {
        handleStartGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, toolbarMode, guessCount, timerDuration]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userInput.trim()) return;
        setChain([...chain, { sender: 'user', text: userInput }]);
        setUserInput('');
        // Simulate bot response (replace with real logic)
        setTimeout(() => {
            setChain(current => [
                ...current,
                { sender: 'bot', text: '봇의 응답: ' + userInput.split('').reverse().join('') }
            ]);
        }, 700);
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
            <div className="game-bar flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-md space-y-2 mb-4">
                    {chain.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`px-4 py-2 rounded-lg ${
                                msg.sender === 'bot'
                                    ? 'bg-serika-dark--sub-alt-color text-serika-dark--main-color self-start'
                                    : 'bg-serika-dark--main-color text-black self-end'
                            }`}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="w-full max-w-md flex space-x-2">
                    <input
                        className="flex-1 px-3 py-2 rounded bg-serika-dark--sub-alt-color text-serika-dark--text-color outline-none"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder="단어를 입력하세요…"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-serika-dark--main-color text-black font-bold"
                    >
                        제출
                    </button>
                </form>
            </div>
        </main>
    );
}
