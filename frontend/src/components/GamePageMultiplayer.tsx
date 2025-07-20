import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Username from './Username';
import Invite from './Invite';
import TurnIndicator from './TurnIndicator';
import WordTooltip from './WordTooltip';
import Popup from './Popup';

export default function GamePageMultiplayer() {
    const { gameId } = useParams();
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
    const [username, setUsername] = useState(() => localStorage.getItem('kmig_username') || '');
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(!username);
    const [popup, setPopup] = useState<{
        open: boolean;
        message: string;
        word?: string;
        type?: 'success' | 'error' | 'info' | 'defeat'
    }>({ open: false, message: '', type: 'info' });
    const chainRef = useRef<HTMLDivElement>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);
    const [currentTurn, setCurrentTurn] = useState<string>('');
    const wsRef = useRef<WebSocket | null>(null);

    // Prompt for username if not set
    function handleUsernameSubmit(name: string) {
        setUsername(name);
        localStorage.setItem('kmig_username', name);
        setShowUsernamePrompt(false);
    }

    // Connect to WebSocket on mount
    useEffect(() => {
        if (!gameId || !username) return;
        const apiBase = import.meta.env.VITE_KMIG_API_URL;
        const wsBase = apiBase.replace(/^http/, 'ws');
        const wsUrl = `${wsBase}/kmig/v1/game/ws/${gameId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'join',
                player_id: username,
                player_name: username, // differentiate account name once made
            }));
        };
        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                // If message is player_joined and has current_turn, update turn state
                console.log('WebSocket message:', msg);
                if (msg.type === 'player_joined' && msg.current_turn !== 'n/a') {
                    setCurrentTurn(msg.current_turn);
                } else if (msg.type === 'word_submitted' && msg.current_turn !== 'n/a' && msg.status === 'VALID') {
                    // Handle word submission
                    setCurrentTurn(msg.current_turn);
                    setChain(prev => [...prev, {
                        sender: msg.player_name === username ? 'user' : 'other',
                        text: msg.word.korean,
                        name: msg.player_name,
                        pronunciation: msg.word.pronunciation,
                        hanja: msg.word.hanja,
                        part_of_speech: msg.word.part_of_speech,
                        definition: msg.word.definition,
                        english: msg.word.english,
                    }]);
                } else if (msg.type === 'word_submitted' && msg.status === 'INVALID') {
                    setPopup({
                        open: true,
                        message: msg.message || 'Invalid word.',
                        word: msg.word.korean,
                        type: 'error'
                    });
                }
                // Add all messages to chat chain except player_joined (optional)
                if (msg.text && msg.sender) {
                    setChain(prev => [...prev, msg]);
                }
            } catch (e) {
                console.error('Invalid message:', event.data);
            }
        };
        ws.onclose = () => {
            console.log('WebSocket closed');
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [gameId, showUsernamePrompt]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userInput.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;
        // Send message to server
        console.log('Submitting word:', userInput);
        wsRef.current.send(JSON.stringify({
            type: 'submit',
            player_id: username,
            player_name: username,
            word: userInput.trim(),
         }));
        setUserInput('');
    }

    if (showUsernamePrompt) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-serika-dark--bg-color">
                <Username
                    open={showUsernamePrompt}
                    usernameInput={username}
                    setUsernameInput={setUsername}
                    onSubmit={() => handleUsernameSubmit(username)}
                />
            </div>
        );
    }

    useEffect(() => {
        if (!isScrolledUp && chainRef.current) {
            chainRef.current.scrollTop = 0;
        }
    }, [chain, isScrolledUp]);

    function handleChainScroll() {
        const el = chainRef.current;
        if (!el) return;
        // If at the bottom (allowing a small threshold)
        const atBottom = el.scrollTop <= 5;
        setIsScrolledUp(!atBottom);
    }

    return (
        <main className="game-page w-full flex-1 flex flex-col bg-serika-dark--bg-color items-center justify-center min-h-screen">
            <div className="w-full max-w-md flex flex-row items-start mb-4">
                {/* Chat area */}
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

            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-row items-center justify-between space-x-2 mt-2">
                {/* Left: Always render, show indicator only if it's user's turn */}
                <div className="flex-shrink-0 mr-4" style={{ width: 150 }}>
                    {currentTurn === username && currentTurn !== '' && (
                        <TurnIndicator isUserTurn={true} currentTurn={currentTurn} />
                    )}
                </div>
                {/* Input and button */}
                <div className="flex-1 flex flex-row items-center space-x-2">
                    <input
                        className="flex-1 px-3 py-2 rounded bg-serika-dark--sub-alt-color text-serika-dark--text-color outline-none"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder="Enter a word…"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-serika-dark--main-color text-black font-bold
                            hover:text-serika-dark--text-color
                            disabled:opacity-50
                            disabled:text-serika-dark--sub-color
                            disabled:hover:text-serika-dark--sub-color"
                        disabled={currentTurn !== username}
                    >
                        Submit
                    </button>
                </div>
                {/* Right: Always render, show indicator only if it's NOT user's turn */}
                <div className="flex-shrink-0 ml-4" style={{ width: 150 }}>
                    {currentTurn !== username && currentTurn !== '' && (
                        <TurnIndicator isUserTurn={false} currentTurn={currentTurn} />
                    )}
                </div>
            </form>
            <Invite />
            <Popup
                open={popup.open}
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup({ ...popup, open: false })}
            />
        </main>
    );
}
