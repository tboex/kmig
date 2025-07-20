import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Username from './Username';

export default function GamePageMultiplayer() {
    const { gameId } = useParams();
    const [chain, setChain] = useState<{ sender: string; text: string }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [username, setUsername] = useState(() => localStorage.getItem('kmig_username') || '');
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(!username);
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
            console.log('WebSocket connected');
            ws.send(JSON.stringify({
                type: 'join',
                player_id: username,
                player_name: username, // differentiate account name once made
            }));
        };
        ws.onmessage = (event) => {
        // Expecting { sender: string, text: string }
            try {
                const msg = JSON.parse(event.data);
                setChain(prev => [...prev, msg]);
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
        wsRef.current.send(JSON.stringify({ text: userInput }));
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

    return (
        <main className="game-page w-full flex-1 flex flex-col bg-serika-dark--bg-color items-center justify-center min-h-screen">
            <div className="game-play-space w-full max-w-md mb-4 h-96 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2">
                {[...chain].reverse().map((msg, idx) => (
                    <div
                        key={idx}
                        className="px-4 py-2 rounded-lg bg-serika-dark--main-color text-black mb-2"
                    >
                        <span className="font-bold mr-2">{msg.sender}:</span>
                        {msg.text}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-md flex space-x-2">
                <input
                    className="flex-1 px-3 py-2 rounded bg-serika-dark--sub-alt-color text-serika-dark--text-color outline-none"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder="Enter a word…"
                />
                <button
                    type="submit"
                    className="px-4 py-2 rounded bg-serika-dark--main-color text-black font-bold"
                >
                    Submit
                </button>
            </form>
        </main>
    );
}