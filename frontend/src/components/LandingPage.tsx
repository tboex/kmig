import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startGame } from '../services/game';
import logo from '../assets/logo.svg';

export default function LandingPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => localStorage.getItem('kmig_username') || '');

  async function handleSolo() {
    if (!username.trim()) return;
    localStorage.setItem('kmig_username', username.trim());
    const data = await startGame('solo', username.trim());
    navigate('/solo', { state: { gameData: data } });
  }

  async function handleMulti() {
    if (!username.trim()) return;
    localStorage.setItem('kmig_username', username.trim());
    const data = await startGame('multi', username.trim());
    navigate(`/game/${data.game_id}`, { state: { gameData: data } });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-serika-dark--bg-color">
    <img
      src={logo}
      alt="KMIG Logo"
      className="mb-8 w-100 h-30"
    />
    <input
      className="mb-15 px-4 py-2 rounded bg-serika-dark--sub-alt-color text-serika-dark--text-color text-lg"
      placeholder="Enter your username"
      value={username}
      onChange={e => setUsername(e.target.value)}
    />
    <div className="flex flex-row space-x-4 mb-4">
      <button
        className="px-8 py-4 rounded bg-serika-dark--sub-alt-color text-xl font-bold disabled:opacity-50 flex items-center space-x-2 transition-colors duration-150 text-serika-dark--main-color hover:text-serika-dark--text-color  disabled:text-serika-dark--sub-color"
        onClick={handleSolo}
        disabled={!username.trim()}
      >
        <i className="fas fa-fw fa-user"></i>
        <span>Solo Game</span>
      </button>
      <button
        className="px-8 py-4 rounded bg-serika-dark--sub-alt-color text-xl font-bold disabled:opacity-50 flex items-center space-x-2 transition-colors duration-150 text-serika-dark--main-color hover:text-serika-dark--text-color disabled:text-serika-dark--sub-color"
        onClick={handleMulti}
        disabled={!username.trim()}
      >
        <i className="fas fa-fw fa-users"></i>
        <span>Multiplayer Game</span>
      </button>
    </div>
  </div>
  );
}
