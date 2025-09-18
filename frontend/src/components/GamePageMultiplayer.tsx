import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Username from './Username';
import Invite from './Invite';
import WordTooltip from './WordTooltip';
import Popup from './Popup';
import GameOver from './GameOver';
import PlayerStatus from './PlayerStatus';
import { motion, AnimatePresence } from 'framer-motion';

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
        valid?: boolean,
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
    const [gameOver, setGameOver] = useState<{ isOpen: boolean; isDefeat: boolean }>({
        isOpen: false,
        isDefeat: false
    });
    const [playerIds, setPlayerIds] = useState<string[]>([]);
    const [playerFailures, setPlayerFailures] = useState<Record<string, number>>({});

    // Prompt for username if not set
    function handleUsernameSubmit(name: string) {
        setUsername(name);
        localStorage.setItem('kmig_username', name);
        setShowUsernamePrompt(false);
    }

    useEffect(() => {
        if (!isScrolledUp && chainRef.current) {
            chainRef.current.scrollTop = 0;
        }
    }, [chain, isScrolledUp]);

    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    // Connect to WebSocket on mount
    useEffect(() => {
        if (!gameId || !username) return;
        let ws: WebSocket;
        let shouldReconnect = true;

        const connect = () => {
            const apiBase = import.meta.env.VITE_KMIG_API_URL;
            const wsBase = apiBase.replace(/^http/, 'ws');
            const wsUrl = `${wsBase}/kmig/v1/game/ws/${gameId}`;
            ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                ws.send(JSON.stringify({
                    type: 'join',
                    player_id: username,
                    player_name: username, // TODO: differentiate account name once made
                }));
            };
            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    if (msg.type === 'player_joined' && msg.current_turn !== 'n/a') {
                        setCurrentTurn(msg.current_turn);
                        if (msg.players) {
                            setPlayerIds(msg.players);
                            setPlayerFailures(prev => {
                                const updated = { ...prev };
                                msg.players.forEach((playerId: string) => {
                                    if (!(playerId in updated)) {
                                        updated[playerId] = 0;
                                    }
                                });
                                return updated;
                            });
                        }
                    } else if (msg.type === 'word_submitted' && msg.status === 'GAME OVER') {
                        const isDefeat = msg.current_turn === username;
                        setGameOver({ isOpen: true, isDefeat });
                    } else if (msg.type === 'word_submitted' && msg.current_turn !== 'n/a' && msg.status === 'VALID') {
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
                            valid: true,
                        }]);
                    } else if (msg.type === 'word_submitted' && msg.status === 'INVALID') {
                        setCurrentTurn(msg.current_turn);

                        if (msg.player_name) {
                            setPlayerFailures(prev => ({
                                ...prev,
                                [msg.player_name]: (prev[msg.player_name] || 0) + 1
                            }));
                        }

                        setChain(prev => [...prev, {
                            sender: msg.player_name === username ? 'user' : 'other',
                            text: msg.word.korean,
                            name: msg.player_name,
                            pronunciation: msg.word.pronunciation,
                            hanja: msg.word.hanja,
                            part_of_speech: msg.word.part_of_speech,
                            definition: msg.word.definition,
                            english: msg.word.english,
                            valid: false,
                        }]);
                        if (username === msg.player_name) {
                            setPopup({
                                open: true,
                                message: msg.message || 'Invalid word.',
                                word: msg.word.korean,
                                type: 'error'
                            });
                        }
                    } else if (msg.type === 'game_restarted') {
                        setCurrentTurn(msg.current_turn);
                        if (msg.players) {
                            setPlayerIds(msg.players);
                            setPlayerFailures(() => {
                                const updated: Record<string, number> = {};
                                msg.players.forEach((playerId: string) => {
                                    updated[playerId] = 0;
                                });
                                return updated;
                            });
                        }
                    }
                } catch (e) {
                    console.error('Invalid message:', event.data);
                }
            };
            ws.onclose = () => {
                if (shouldReconnect) {
                    // Try to reconnect after 1 second
                    reconnectTimeout.current = setTimeout(connect, 1000);
                }
            };
            ws.onerror = () => {
                ws.close();
            };
        };

        connect();

        return () => {
            shouldReconnect = false;
            ws.close();
            wsRef.current = null;
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        };
    }, [gameId, showUsernamePrompt, username]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userInput.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;

        // Send message to server
        wsRef.current.send(JSON.stringify({
            type: 'submit',
            player_id: username,
            player_name: username,
            word: userInput.trim(),
         }));
        setUserInput('');
    }

    function handlePlayAgain() {
        setGameOver({ isOpen: false, isDefeat: false });
        setChain([]);
        setCurrentTurn('');

        if (!wsRef.current || wsRef.current.readyState !== 1) return;

        wsRef.current.send(JSON.stringify({
            type: 'restart',
            player_id: username,
            player_name: username,
            word: userInput.trim(),
         }));
        setUserInput('');

    }

    if (showUsernamePrompt) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-theme-bg">
                <Username
                    open={showUsernamePrompt}
                    usernameInput={username}
                    setUsernameInput={setUsername}
                    onSubmit={() => handleUsernameSubmit(username)}
                />
            </div>
        );
    }

    function handleChainScroll() {
        const el = chainRef.current;
        if (!el) return;
        // if at the bottom (allowing a small threshold)
        const atBottom = el.scrollTop <= 5;
        setIsScrolledUp(!atBottom);
    }

    return (
        <main className="game-page w-full flex-1 flex flex-col bg-theme-bg items-center justify-center"
            style={{ height: 'calc(100vh - 200px)'}}>
            <PlayerStatus
                players={playerIds.map(playerId => ({
                    id: playerId,
                    name: playerId,
                    failures: playerFailures[playerId] || 0,
                    maxFailures: 3, // You can make this configurable
                    isCurrentTurn: playerId === currentTurn
                }))}
            />
            <div className="w-full max-w-md flex flex-row items-start mb-4">
                <div
                    ref={chainRef}
                    onScroll={handleChainScroll}
                    className="game-play-space w-full max-w-md mb-4 h-96 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2 scrollbar-hide"
                >
                    <AnimatePresence>
                        {[...chain].reverse().map((msg, idx) => {
                            const originalIndex = chain.length - 1 - idx;

                            return (
                                <motion.div
                                    key={originalIndex}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.9, height: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className={`relative px-4 py-2 rounded-lg mb-2 text-xl
                                        ${msg.valid === false
                                            ? 'bg-theme-error text-theme-text'
                                            : msg.sender === 'other'
                                                ? 'bg-theme-sub-alt text-theme-sub self-start'
                                                : 'bg-theme-sub text-theme-bg self-end'
                                        }`
                                    }
                                >
                                    <div className={`text-xs mb-1 ${msg.valid === false ? 'text-theme-text' : 'text-theme-main '}`}>{msg.name}</div>
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
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center justify-center space-x-2 mt-2">
                <input
                    className="flex-1 px-3 py-2 rounded bg-theme-sub-alt text-theme-text outline-none"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder="Enter a word…"
                    style={{ maxWidth: '300px' }} // Equal width from center
                />
                <button
                    type="submit"
                    className="px-4 py-2 rounded bg-theme-main text-black font-bold
                    hover-text-theme-text
                    disabled:opacity-50
                    disabled:text-theme-sub
                    disabled:hover-text-theme-sub"
                    disabled={currentTurn !== username}
                >
                    Submit
                </button>
            </form>
            <Invite />
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
