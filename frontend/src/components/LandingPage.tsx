import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startGame } from '../services/game';
import { useLanguage } from '../contexts/LanguageContext';
import logo from '../assets/logo.svg';

export default function LandingPage() {
  const { t } = useLanguage();
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
    <div className="flex flex-col items-center justify-center bg-theme-bg"
       style={{ height: 'calc(100vh - 200px)'}}>
    <img
      src={logo}
      alt="KMIG Logo"
      className="mb-8 w-100 h-30"
    />
    <input
      className="mb-15 px-4 py-2 rounded bg-theme-sub-alt text-theme-text text-lg"
      placeholder={t('landing.username.placeholder')}
      value={username}
      onChange={e => setUsername(e.target.value)}
    />
    <div className="flex flex-row space-x-4 mb-4">
      <button
        className="px-8 py-4 rounded bg-theme-sub-alt text-xl font-bold disabled:opacity-50 flex items-center space-x-2 transitions duration-150 text-theme-main hover:text-theme-text  disabled:text-theme-sub"
        onClick={handleSolo}
        disabled={!username.trim()}
      >
        <i className="fas fa-fw fa-user"></i>
        <span>{t('landing.solo')}</span>
      </button>
      <button
        className="px-8 py-4 rounded bg-theme-sub-alt text-xl font-bold disabled:opacity-50 flex items-center space-x-2 transitions duration-150 text-theme-main hover:text-theme-text disabled:text-theme-sub"
        onClick={handleMulti}
        disabled={!username.trim()}
      >
        <i className="fas fa-fw fa-users"></i>
        <span>{t('landing.multiplayer')}</span>
      </button>
    </div>
  </div>
  );
}
