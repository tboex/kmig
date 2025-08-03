import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Popup from './Popup';
import WordTooltip from './WordTooltip';
import GameOver from './GameOver';
import PlayerStatus from './PlayerStatus';
import Invite from './Invite';
import { submitWord, getBotTurn } from '../services/game';
import { useSettings } from '../contexts/SettingsContext';

export default function GamePage() {
    const location = useLocation();
    const initialGameData = location.state?.gameData;
    const [gameData, setGameData] = useState<any>(initialGameData);
    const [username, setUsername] = useState(() => localStorage.getItem('kmig_username') || '');
    const [popup, setPopup] = useState<{
        open: boolean;
        message: string;
        word?: string;
        type?: 'success' | 'error' | 'info' | 'defeat'
    }>({ open: false, message: '', type: 'info' });
    const [gameOver, setGameOver] = useState<{ isOpen: boolean; isDefeat: boolean }>({
        isOpen: false,
        isDefeat: false
    });
    const [currentTurn, setCurrentTurn] = useState<'user' | 'bot'>('user');
    const [chain, setChain] = useState<{
        sender: 'other' | 'user',
        text: string,
        name: string,
        pronunciation?: string,
        hanja?: string,
        part_of_speech?: string,
        definition?: string,
        english?: string,
        valid?: boolean,
    }[]>([]);

    const [userInput, setUserInput] = useState('');
    const chainRef = useRef<HTMLDivElement>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);

    const [botFailures, setBotFailures] = useState(0);
    const [userFailures, setUserFailures] = useState(0);
    const { botDelay, botDelayMs } = useSettings();

    const isUserTurn = currentTurn === 'user';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userInput.trim() || !gameData?.game_id || !isUserTurn) return;

        const submittedWord = userInput;
        setUserInput('');

        try {
            const submitRes = await submitWord(gameData.game_id, submittedWord, username);

            if (submitRes.status.status === 'GAME OVER') {
                setGameOver({ isOpen: true, isDefeat: true });
                setChain(prev => [...prev, {
                    sender: 'user',
                    text: submitRes.word.korean,
                    name: username,
                    pronunciation: submitRes.word.pronunciation,
                    hanja: submitRes.word.hanja,
                    part_of_speech: submitRes.word.part_of_speech,
                    definition: submitRes.word.definition,
                    english: submitRes.word.english,
                    valid: true,
                }]);
            } else if (submitRes.status.status === 'INVALID') {
                setUserFailures(prev => prev + 1);
                setChain(prev => [...prev, {
                    sender: 'user',
                    text: submittedWord,
                    name: username,
                    valid: false,
                }]);
                setPopup({
                    open: true,
                    message: submitRes.status.message || 'Invalid word.',
                    word: submittedWord,
                    type: 'error'
                });
            } else {
                setChain(prev => [...prev, {
                    sender: 'user',
                    text: submitRes.word.korean,
                    name: username,
                    pronunciation: submitRes.word.pronunciation,
                    hanja: submitRes.word.hanja,
                    part_of_speech: submitRes.word.part_of_speech,
                    definition: submitRes.word.definition,
                    english: submitRes.word.english,
                    valid: true,
                }]);

                setCurrentTurn('bot');

                // bot turn
                try {
                    if (botDelay) {
                        setChain(current => [
                            ...current,
                            {
                                sender: 'other',
                                text: "i'm thinking...",
                                name: 'kmig',
                                valid: true,
                            }
                        ]);

                        await new Promise(resolve => setTimeout(resolve, botDelayMs));

                        setChain(current => current.slice(0, -1));
                    }

                    const botRes = await getBotTurn(gameData.game_id);
                    if (botRes.status?.status === 'VICTORY') {
                        setGameOver({ isOpen: true, isDefeat: true });
                    } else if (botRes.status?.status === 'DEFEAT') {
                        setGameOver({ isOpen: true, isDefeat: false });
                    }

                    setChain(current => [
                        ...current,
                        {
                            sender: 'other',
                            text: botRes.word?.korean || '봇의 응답 없음',
                            name: botRes.player?.name || 'Bot',
                            pronunciation: botRes.word?.pronunciation,
                            hanja: botRes.word?.hanja,
                            part_of_speech: botRes.word?.part_of_speech,
                            definition: botRes.word?.definition,
                            english: botRes.word?.english,
                            valid: botRes.word ? true : false,
                        }
                    ]);

                    setCurrentTurn('user');
                } catch (botErr) {
                    console.error('Bot turn failed:', botErr);

                    setCurrentTurn('user');
                }
            }
        } catch (err) {
            console.error('Submit failed:', err);
            setPopup({
                open: true,
                message: '제출에 실패했습니다.',
                type: 'error'
            });
        }
    }

    function handlePlayAgain() {
        // TODO this is still NTI
        setGameOver({ isOpen: false, isDefeat: false });
        setChain([]);
        setUserFailures(0);
        setBotFailures(0);
        setCurrentTurn('user');
        window.location.href = '/';
    }

    function handleChainScroll() {
        const el = chainRef.current;
        if (!el) return;
        const atBottom = el.scrollTop <= 5;
        setIsScrolledUp(!atBottom);
    }

    useEffect(() => {
        if (!isScrolledUp && chainRef.current) {
            chainRef.current.scrollTop = 0;
        }
    }, [chain, isScrolledUp]);

    useEffect(() => {
        setGameData(initialGameData);
        setGameData(initialGameData);
        setUsername(localStorage.getItem('kmig_username') || '');

        if (initialGameData && initialGameData.word) {
            setChain([{
                sender: 'other',
                text: initialGameData.word.korean,
                name: initialGameData.player?.name || 'Bot',
                pronunciation: initialGameData.word.pronunciation,
                hanja: initialGameData.word.hanja,
                part_of_speech: initialGameData.word.part_of_speech,
                definition: initialGameData.word.definition,
                english: initialGameData.word.english,
                valid: true,
            }]);
        }
    }, [initialGameData]);

    const players = [
        {
            id: username,
            name: username,
            failures: userFailures,
            maxFailures: 3,
            isCurrentTurn: isUserTurn
        },
        {
            id: 'kmig bot',
            name: 'kmig bot',
            failures: botFailures,
            maxFailures: 3,
            isCurrentTurn: !isUserTurn
        }
    ];

    return (
        <main className="game-page w-full flex-1 flex flex-col bg-serika-dark--bg-color items-center justify-center min-h-screen">
            {/* Player Status */}
            <PlayerStatus players={players} />

            {/* Chat Area */}
            <div className="w-full max-w-md mb-4">
                <div
                    ref={chainRef}
                    onScroll={handleChainScroll}
                    className="game-play-space w-full h-96 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2"
                >
                    {[...chain].reverse().map((msg, idx) => {
                        const fadeSteps = 5;
                        const opacity = isScrolledUp ? 1 : Math.max(1 - idx * (0.7 / fadeSteps), 0.3);

                        return (
                            <div
                                key={chain.length - 1 - idx}
                                style={{ opacity }}
                                className={`relative px-4 py-2 rounded-lg transition-opacity duration-500 mb-2
                                    ${msg.valid === false
                                        ? 'bg-serika-dark--error-color text-serika-dark--text-color'
                                        : msg.sender === 'other'
                                            ? 'bg-serika-dark--sub-alt-color text-serika-dark--main-color self-start'
                                            : 'bg-serika-dark--main-color text-black self-end'
                                    }`
                                }
                            >
                                <div className="text-xs text-serika-dark--sub-color mb-1">{msg.name}</div>
                                <WordTooltip
                                    tooltip={
                                        <>
                                        {msg.english && <div><b>English:</b> {msg.english}</div>}
                                        {msg.definition && <div><b>Definition:</b> {msg.definition}</div>}
                                        {msg.pronunciation && <div><b>Pronunciation:</b> {msg.pronunciation}</div>}
                                        {msg.hanja && <div><b>Hanja:</b> {msg.hanja}</div>}
                                        </>
                                    }
                                >
                                    {msg.text}
                                </WordTooltip>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center justify-center space-x-2 mt-2">
                <input
                    className="flex-1 px-3 py-2 rounded bg-serika-dark--sub-alt-color text-serika-dark--text-color outline-none"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder="Enter a word…"
                    style={{ maxWidth: '300px' }}
                />
                <button
                    type="submit"
                    className="px-4 py-2 rounded bg-serika-dark--main-color text-black font-bold
                        hover:text-serika-dark--text-color
                        disabled:opacity-50
                        disabled:text-serika-dark--sub-color
                        disabled:hover:text-serika-dark--sub-color"
                    disabled={!isUserTurn}
                >
                    Submit
                </button>
            </form>

            {/* Don't show Invite for single player */}
            {gameData?.mode !== 'single' && <Invite />}

            {/* Popup and GameOver */}
            <Popup
                open={popup.open}
                message={popup.message}
                type={popup.type}
                word={popup.word}
                onClose={() => setPopup({ ...popup, open: false })}
            />
            <GameOver
                isOpen={gameOver.isOpen}
                isDefeat={gameOver.isDefeat}
                onClose={() => setGameOver({ isOpen: false, isDefeat: false })}
                onPlayAgain={handlePlayAgain}
            />
        </main>
    );
}
