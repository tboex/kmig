import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startGame } from '../services/game';

export default function LandingPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => localStorage.getItem('kmig_username') || '');
  const [gameData, setGameData] = useState<any>(null);

  async function handleSolo() {
    if (!username.trim()) return;
    localStorage.setItem('kmig_username', username.trim());
    const data = await startGame('solo', username.trim());
    setGameData(data);
    navigate('/solo', { state: { gameData: data } });
  }

  async function handleMulti() {
    if (!username.trim()) return;
    localStorage.setItem('kmig_username', username.trim());
    const data = await startGame('multi', username.trim());
    setGameData(data);
    navigate(`/game/${data.game_id}`, { state: { gameData: data } });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-serika-dark--bg-color">
      <h1 className="text-5xl mb-8">끝말잇기</h1>
      <input
        className="mb-6 px-4 py-2 rounded bg-serika-dark--sub-alt-color text-serika-dark--text-color text-lg"
        placeholder="Enter your username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <button
        className="mb-4 px-8 py-4 rounded bg-serika-dark--main-color text-black text-xl font-bold disabled:opacity-50"
        onClick={handleSolo}
        disabled={!username.trim()}
      >
        Start Solo Game
      </button>
      <button
        className="px-8 py-4 rounded bg-serika-dark--sub-alt-color text-serika-dark--text-color text-xl font-bold disabled:opacity-50"
        onClick={handleMulti}
        disabled={!username.trim()}
      >
        Start Multiplayer Game
      </button>
    </div>
  );
}
