import { useRef, useState, useEffect } from 'react';
import Toolbar from './Toolbar'
import Popup from './Popup';
import { startGame, submitWord, getBotTurn } from '../services/game';

export default function GamePage() {
    const [mode, setMode] = useState<'solo' | 'multi'>('solo');
    const [toolbarMode, setToolbarMode] = useState<'guesses' | 'timer'>('guesses');
    const [guessCount, setGuessCount] = useState<number>(5);
    const [timerDuration, setTimerDuration] = useState<number>(30);
    const [gameData, setGameData] = useState<any>(null);
    const [popup, setPopup] = useState<{ open: boolean; message: string; type?: 'success' | 'error' | 'info' | 'defeat' }>({ open: false, message: '' });

    // New state for the chain and input
    const [chain, setChain] = useState<{ sender: 'bot' | 'user', text: string }[]>([]);
    const [userInput, setUserInput] = useState('');
    const chainRef = useRef<HTMLDivElement>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);

    async function handleStartGame() {
        try {
            const data = await startGame(mode, guessCount, timerDuration);
            setGameData(data);
            if (data.hasOwnProperty('word')) {
                setChain([{ sender: 'bot', text: data.word.korean }]);
            }
        } catch (err) {
            console.log(err);
            alert("Failed to start game");
        }
    }

    // Call handleStartGame on mount and whenever settings change
    useEffect(() => {
        setChain([])
        handleStartGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, toolbarMode, guessCount, timerDuration]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userInput.trim() || !gameData?.game_id) return;

        setChain([...chain, { sender: 'user', text: userInput }]);
        const submittedWord = userInput;
        setUserInput('');

        try {
            // POST user's word
            const submitRes = await submitWord(gameData.game_id, submittedWord);

            if (submitRes.status.status === 'VICTORY') {
                setPopup({ open: true, message: 'Victory!', type: 'success' });
            } else if (submitRes.status.status === 'INVALID') {
                setPopup({ open: true, message: 'Invalid entry!', type: 'error' });
            }

            // If single mode, get bot's turn
            if (gameData.mode === 'single') {
                const botRes = await getBotTurn(gameData.game_id);
                setChain(current => [
                    ...current,
                    { sender: 'bot', text: botRes.word?.korean || '봇의 응답 없음' }
                ]);
            }
        } catch (err) {
            alert('제출에 실패했습니다.');
        }
    }

    function handleChainScroll() {
        const el = chainRef.current;
        if (!el) return;
        // If at the bottom (allowing a small threshold)
        const atBottom = el.scrollTop <= 5;
        setIsScrolledUp(!atBottom);
    }

    useEffect(() => {
        if (!isScrolledUp && chainRef.current) {
            chainRef.current.scrollTop = 0;
        }
    }, [chain, isScrolledUp]);

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
                <div 
                    ref={chainRef}
                    onScroll={handleChainScroll}
                    className="w-full max-w-md mb-4 h-96 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2"
                >
                        {[...chain].reverse().map((msg, idx) => {
                            const fadeSteps = 5;
                            const opacity = isScrolledUp ? 1 : Math.max(1 - idx * (0.7 / fadeSteps), 0.3);

                            return (
                                <div
                                    key={chain.length - 1 - idx}
                                    style={{ opacity }}
                                    className={`px-4 py-2 rounded-lg transition-opacity duration-500 ${
                                        msg.sender === 'bot'
                                            ? 'bg-serika-dark--sub-alt-color text-serika-dark--main-color self-start'
                                            : 'bg-serika-dark--main-color text-black self-end'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            );
                        })}
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
