import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Popup from './Popup';
import WordTooltip from './WordTooltip';
import TurnIndicator from './TurnIndicator';
import { submitWord, getBotTurn } from '../services/game';


export default function GamePage() {
    const location = useLocation();
    const initialGameData = location.state?.gameData;
    const [gameData, setGameData] = useState<any>(initialGameData);
    const [username, setUsername] = useState(() => localStorage.getItem('kmig_username') || '');
    const [usernameInput] = useState('');
    const [popup, setPopup] = useState<{
        open: boolean;
        message: string;
        type?: 'success' | 'error' | 'info' | 'defeat'
    }>({ open: false, message: '', type: 'info' });
    const [chain, setChain] = useState<{
        sender: 'other' | 'user',
        text: string,
        name: string,
        pronunciation?: string,
        hanja?: string,
        part_of_speech?: string,
        definition?: string,
        english?: string,
    }[]>([]);

    const [userInput, setUserInput] = useState('');
    const chainRef = useRef<HTMLDivElement>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);
    const isUserTurn = chain.length === 0 || chain[chain.length - 1].sender !== 'user';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userInput.trim() || !gameData?.game_id) return;

        const submittedWord = userInput;
        setUserInput('');

        try {
            const submitRes = await submitWord(gameData.game_id, submittedWord, username);

            if (submitRes.status.status === 'VICTORY') {
                setPopup({ open: true, message: submitRes.status.message, type: 'success' });
            } else if (submitRes.status.status === 'INVALID') {
                setChain([...chain, {
                    sender: 'user',
                    text: userInput,
                    name: usernameInput
                }]);
                setPopup({ open: true, message: submitRes.status.message, type: 'error' });
            }
            else {
                setChain([...chain, {
                    sender: 'user',
                    text: submitRes.word.korean,
                    name: submitRes.player.name,
                    pronunciation: submitRes.word.pronunciation,
                    hanja: submitRes.word.hanja,
                    part_of_speech: submitRes.word.part_of_speech,
                    definition: submitRes.word.definition,
                    english: submitRes.word.english,
                }]);
            }

            // If single mode, get bot's turn
            if (gameData.mode === 'single' && submitRes.status.status != 'INVALID') {
                const botRes = await getBotTurn(gameData.game_id);
                setChain(current => [
                    ...current,
                    {
                        sender: 'other',
                        text: botRes.word?.korean || '봇의 응답 없음',
                        name: botRes.player.name,
                        pronunciation: botRes.word?.pronunciation,
                        hanja: botRes.word?.hanja,
                        part_of_speech: botRes.word?.part_of_speech,
                        definition: botRes.word?.definition,
                        english: botRes.word?.english,
                    }
                ]);
            }
        } catch (err) {
            alert('제출에 실패했습니다.');
        }
    }


    useEffect(() => {
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
            }]);
        }
    }, [initialGameData]);

    function handleChainScroll() {
        const el = chainRef.current;
        if (!el) return;

        // if at the bottom (allowing a small threshold)
        const atBottom = el.scrollTop <= 5;
        setIsScrolledUp(!atBottom);
    }

    useEffect(() => {
        if (!isScrolledUp && chainRef.current) {
            chainRef.current.scrollTop = 0;
        }
    }, [chain, isScrolledUp]);

    return (
        <main className="game-page w-full flex-1 flex flex-col  bg-serika-dark--bg-color"
            style={{ height: 'calc(100vh - 200px)'}}>
            <div className="game-bar flex-1 flex flex-col items-center justify-center">
                <div
                    ref={chainRef}
                    onScroll={handleChainScroll}
                    className="game-play-space w-full max-w-md mb-4 h-96 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2"
                >
                        {[...chain].reverse().map((msg, idx) => {
                            const fadeSteps = 5;
                            const opacity = isScrolledUp ? 1 : Math.max(1 - idx * (0.7 / fadeSteps), 0.3);

                            return (
                                <div
                                    key={chain.length - 1 - idx}
                                    style={{ opacity }}
                                    className={`relative px-4 py-2 rounded-lg transition-opacity duration-500 mb-2 ${
                                        msg.sender === 'other'
                                            ? 'bg-serika-dark--sub-alt-color text-serika-dark--main-color self-start'
                                            : 'bg-serika-dark--main-color text-black self-end'
                                    }`}
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
                <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center space-x-2">
                    {isUserTurn && (
                        <TurnIndicator isUserTurn={true} currentTurn={username} />
                    )}
                    <input
                        className="flex-1 px-3 py-2 rounded bg-serika-dark--sub-alt-color text-serika-dark--text-color outline-none"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder="Enter a word…"
                    />
                    {!isUserTurn && (
                        <TurnIndicator isUserTurn={false} currentTurn={'kmig_bot'} />
                    )}
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-serika-dark--main-color text-black font-bold"
                        disabled={!isUserTurn}
                    >
                        submit
                    </button>
                </form>
            </div>
            <Popup
                open={popup.open}
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup({ ...popup, open: false })}
            />
        </main>
    );
}
