<<<<<<< Updated upstream
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
=======
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
>>>>>>> Stashed changes
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import { startGame } from '../services/game';
import Toggle from './Toggle';
import PressableButton from './PressableButton';
import FloatingInput from './FloatingInput';

type Mode = 'solo' | 'multi';

export default function GameSetupPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  // username may be passed from landing page via location.state
  const locState = location.state as { username?: string } | null;
  const initialUsername = locState?.username || '';
  const [username, setUsername] = useState(initialUsername);
  const [allowVerbs, setAllowVerbs] = useState(true);
  const [allowAdjectives, setAllowAdjectives] = useState(true);
  const [allowAdverbs, setAllowAdverbs] = useState(true);
  const [guessCount, setGuessCount] = useState<number | ''>(3);
  const [timerDuration, setTimerDuration] = useState<number | ''>(20);

  // measure the settings content to animate height from 0 -> measuredHeight
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const [settingsHeight, setSettingsHeight] = useState<number>(0);

  useEffect(() => {
    const measure = () => {
      if (settingsRef.current) setSettingsHeight(settingsRef.current.scrollHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [allowVerbs, allowAdjectives, allowAdverbs, guessCount, timerDuration]);

  // infer mode from the URL path (/setup/solo or /setup/multi)
  const path = location.pathname;
  const mode: Mode = path.includes('/multi') ? 'multi' : 'solo';

  async function handleStart() {
    if (!username.trim()) return;
    localStorage.setItem('kmig_username', username.trim());
    const data = await startGame(
        mode,
        username.trim(),
        typeof guessCount === 'number' ? guessCount : undefined,
        typeof timerDuration === 'number' ? timerDuration : undefined,
        undefined,
        allowVerbs,
        allowAdjectives,
        allowAdverbs,
    );
    if (mode === 'solo') {
        navigate('/solo', { state: { gameData: data } });
    } else {
        navigate(`/game/${data.game_id}`, { state: { gameData: data } });
    }
  }

  return (
    <div className="flex-1 bg-theme-bg">
      <div className="flex flex-col items-center justify-center h-full" style={{ height: 'calc(100vh - 200px)'}}>
        <Logo width={300} height={90} className="mb-6" />
        <div className="w-full max-w-md bg-theme-sub-alt p-6 rounded">
          <h2 className="text-2xl font-bold mb-14 text-theme-main">{t('setup.title') || 'Game Setup'}</h2>
          <FloatingInput
            id="setup-username"
            label={t('landing.username.placeholder') || 'Username'}
            value={username}
            onChange={e => setUsername(e.target.value)}
          />

          {/* Hide the rest of the settings until a username is provided */}
          <AnimatePresence>
            {username.trim() === '' ? (
              <motion.div key="setup-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
              </motion.div>
            ) : (
              <motion.div
                key="setup-settings"
                initial={{ height: 0, opacity: 0, y: -8 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                className="mt-4 overflow-hidden"
              >
                <div className="mb-4 mt-8">
                  <div className="flex items-center justify-between">
                    <span className="text-theme-sub">{t('setup.allowVerbs') || 'Allow Verbs'}</span>
                    <Toggle
                      checked={allowVerbs}
                      onChange={v => setAllowVerbs(v)}
                      ariaLabel={t('setup.allowVerbs') || 'Allow Verbs'}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-1 text-theme-sub"></label>
                  <FloatingInput
                    id="guess-count"
                    label={t('setup.guessCount') || 'Guesses'}
                    type="number"
                    value={guessCount === '' ? '' : String(guessCount)}
                    onChange={e => setGuessCount(e.target.value === '' ? '' : Number(e.target.value))}
                    required={false}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm mb-1 text-theme-sub"></label>
                  <FloatingInput
                    id="timer-duration"
                    label={t('setup.timer') || 'Timer (seconds)'}
                    type="number"
                    min={0}
                    value={timerDuration === '' ? '' : String(timerDuration)}
                    onChange={e => setTimerDuration(e.target.value === '' ? '' : Number(e.target.value))}
                    required={false}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex space-x-4">
            <PressableButton onClick={handleStart} disabled={!username.trim()} className="flex-1 px-4 py-2">
              {t('setup.start') || 'Start Game'}
            </PressableButton>
            <PressableButton onClick={() => navigate(-1)} className="px-4 py-2 bg-[var(--color-sub)] border-[var(--color-caret)] text-[var(--color-text)]">
              {t('setup.back') || 'Back'}
            </PressableButton>
          </div>
        </div>
      </div>
    </div>
  );
}
