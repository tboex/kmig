import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startGame } from '../services/game';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';

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
    <div className="flex-1 bg-theme-bg">
      <div className="flex flex-col items-center justify-center h-full"
         style={{ height: 'calc(100vh - 200px)'}}>
        <Logo width={400} height={120} className="mb-8" />
        <input
          id="username"
          type="text"
          autoComplete="off"
          autoCorrect='off'
          spellCheck="false"
          data-lpignore="true"
          data-form-type="other"
          className="mb-15 px-4 py-2 rounded bg-theme-sub-alt text-theme-text text-lg focus:outline-none"
          placeholder={t('landing.username.placeholder')}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <div className="flex flex-row space-x-4 mb-4">
          <button
            className={`px-8 py-4 rounded bg-theme-sub-alt text-xl font-bold flex items-center space-x-2 transition duration-150 ${
              !username.trim()
                ? 'opacity-50 text-theme-sub cursor-not-allowed'
                : 'text-theme-main hover-text-theme-text hover-bg-theme-main hover-bg-opacity-20'
            }`}
            onClick={handleSolo}
            disabled={!username.trim()}
          >
            <i className="fas fa-fw fa-user"></i>
            <span>{t('landing.solo')}</span>
          </button>
          <button
            className={`px-8 py-4 rounded bg-theme-sub-alt text-xl font-bold flex items-center space-x-2 transition duration-150 ${
              !username.trim()
                ? 'opacity-50 text-theme-sub cursor-not-allowed'
                : 'text-theme-main hover-text-theme-text hover-bg-theme-main hover-bg-opacity-20'
            }`}
            onClick={handleMulti}
            disabled={!username.trim()}
          >
            <i className="fas fa-fw fa-users"></i>
            <span>{t('landing.multiplayer')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
