import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Username from './Username';
import Invite from './Invite';
import WordTooltip from './WordTooltip';
import Popup from './Popup';
import GameOver from './GameOver';
import PlayerStatus from './PlayerStatus';
import { motion, AnimatePresence } from 'framer-motion';
import PressableButton from './PressableButton';
import FloatingInput from './FloatingInput';

export default function GamePageMultiplayer() {
    const { gameId } = useParams();
    const [chain, setChain] = useState(() => {
        if (typeof window === "undefined" || !gameId) return [];
        const saved = localStorage.getItem(`kmig_chain_${gameId}`);
        return saved ? JSON.parse(saved) : [];
    });
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

    // Render a string that might be a serialized list (e.g. "['a','b']") as separate lines
    const renderMultiline = (val?: string | null) => {
        if (!val) return null;
        let s = val.trim();
        // Strip surrounding quotes if the entire value is quoted
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
            s = s.slice(1, -1).trim();
        }
        if (s.startsWith('[') && s.endsWith(']')) {
            const inner = s.slice(1, -1).trim();

            // Try JSON.parse directly
            try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) return <>{parsed.map((it, i) => <div key={i}>{String(it)}</div>)}</>;
            } catch (_err) { void _err; }

            // Try converting single-quoted items to double-quoted JSON
            const converted = s.replace(/'([^']*)'/g, '"$1"');
            try {
                const parsed2 = JSON.parse(converted);
                if (Array.isArray(parsed2)) return <>{parsed2.map((it, i) => <div key={i}>{String(it)}</div>)}</>;
            } catch (_err) { void _err; }

            // Fallback: manual top-level split that respects quotes
            const parts: string[] = [];
            let cur = '';
            let inSingle = false;
            let inDouble = false;
            let esc = false;
            for (let i = 0; i < inner.length; i++) {
                const ch = inner[i];
                if (esc) {
                    cur += ch;
                    esc = false;
                    continue;
                }
                if (ch === '\\') { esc = true; cur += ch; continue; }
                if (ch === "'" && !inDouble) { inSingle = !inSingle; cur += ch; continue; }
                if (ch === '"' && !inSingle) { inDouble = !inDouble; cur += ch; continue; }
                if (ch === ',' && !inSingle && !inDouble) {
                    parts.push(cur.trim());
                    cur = '';
                    continue;
                }
                cur += ch;
            }
            if (cur.trim()) parts.push(cur.trim());

            const cleaned = parts.map(p => p.replace(/^['"]|['"]$/g, '').trim()).filter(Boolean);
            return <>{cleaned.map((it, i) => <div key={i}>{it}</div>)}</>;
        }
        return s;
    };

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

    useEffect(() => {
        if (!gameId) return;
        localStorage.setItem(`kmig_chain_${gameId}`, JSON.stringify(chain));
    }, [chain, gameId]);

    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    // Connect to WebSocket on mount — only after we have a username and the username prompt is closed
    useEffect(() => {
        if (!gameId || !username || showUsernamePrompt) return;
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
                ws.send(JSON.stringify({
                    type: 'status',
                    player_id: username,
                    player_name: username,
                }));
            };
            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    if ((msg.type === 'player_joined' || msg.type === 'status') && msg.current_turn !== 'n/a') {
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
                        setChain((prev: typeof chain) => [...prev, {
                            sender: msg.player_name === username ? 'user' : 'other',
                            text: msg.word.korean,
                            name: msg.player_name,
                            korean: msg.word.korean,
                            pronunciation: msg.word.pronunciation,
                            hanja: msg.word.hanja,
                            part_of_speech: msg.word.part_of_speech,
                            definition: msg.word.definition,
                            english: msg.word.english,
                            usages: msg.word.usages,
                            semantic_category: msg.word.semantic_category,
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

                        setChain((prev: typeof chain) => [...prev, {
                            sender: msg.player_name === username ? 'user' : 'other',
                            text: msg.word.korean,
                            name: msg.player_name,
                            korean: msg.word.korean,
                            pronunciation: msg.word.pronunciation,
                            hanja: msg.word.hanja,
                            part_of_speech: msg.word.part_of_speech,
                            definition: msg.word.definition,
                            english: msg.word.english,
                            usages: msg.word.usages,
                            semantic_category: msg.word.semantic_category,
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
                        setChain([]);
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
                } catch (_err) {
                    void _err;
                    console.error('Invalid message:', event.data);
                }
            };
            ws.onclose = () => {
                if (shouldReconnect) {
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
                    onSubmit={(name: string) => handleUsernameSubmit(name)}
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
                    className="game-play-space w-full max-w-md mb-4 h-75 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2 scrollbar-hide"
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
                                                                        { (msg.part_of_speech) && <div><b>Part of speech:</b> {msg.part_of_speech}</div> }
                                                                        { (msg.english) && <div><b>English:</b> {renderMultiline(msg.english)}</div> }
                                                                        { (msg.definition) && <div><b>Definition:</b> {renderMultiline(msg.definition)}</div> }
                                                                        { (msg.usages) && <div><b>Usages:</b> {renderMultiline(msg.usages)}</div> }
                                                                        { (msg.semantic_category) && <div><b>Category:</b> {msg.semantic_category}</div> }
                                                                        { (msg.pronunciation) && <div><b>Pronunciation:</b> {msg.pronunciation}</div> }
                                                                        { (msg.hanja) && <div><b>Hanja:</b> {msg.hanja}</div> }
                                                                    </>
                                                                }
                                                            >
                                                                {msg.korean || msg.text}
                                                            </WordTooltip>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center justify-center space-x-2 mt-2">
                                <div className="flex-1 max-w-[300px]">
                                    <FloatingInput
                                        id="multi-user-input"
                                        label={'Enter a word…'}
                                        value={userInput}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value)}
                                        required={false}
                                    />
                                </div>
                <PressableButton type="submit" disabled={currentTurn !== username} className="px-4 py-2">
                    Submit
                </PressableButton>
            </form>
            <Invite pulse={playerIds.length === 0} />
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
