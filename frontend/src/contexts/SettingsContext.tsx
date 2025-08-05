// src/contexts/SettingsContext.tsx
import { createContext, useContext, useState } from 'react';

type BotDifficulty = 'easy' | 'medium' | 'hard';

interface SettingsContextType {
  botDelay: boolean;
  setBotDelay: (delay: boolean) => void;
  botDelayMs: number;
  setBotDelayMs: (ms: number) => void;
  botDifficulty: BotDifficulty;
  setBotDifficulty: (difficulty: BotDifficulty) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [botDelay, setBotDelayState] = useState(() => {
    const saved = localStorage.getItem('kmig_bot_delay');
    // If there's a saved value, use it, otherwise default to true
    return saved !== null ? saved === 'true' : true;
  });

  const [botDelayMs, setBotDelayMsState] = useState(() => {
    const saved = localStorage.getItem('kmig_bot_delay_ms');
    // If there's a saved value, use it, otherwise default to 1500
    return saved !== null ? parseInt(saved) : 1500;
  });

  const [botDifficulty, setBotDifficultyState] = useState<BotDifficulty>(() => {
    return (localStorage.getItem('kmig_bot_difficulty') as BotDifficulty) || 'medium';
  });

  const setBotDelay = (delay: boolean) => {
    setBotDelayState(delay);
    localStorage.setItem('kmig_bot_delay', delay.toString());
  };

  const setBotDelayMs = (ms: number) => {
    setBotDelayMsState(ms);
    localStorage.setItem('kmig_bot_delay_ms', ms.toString());
  };

  const setBotDifficulty = (difficulty: BotDifficulty) => {
    setBotDifficultyState(difficulty);
    localStorage.setItem('kmig_bot_difficulty', difficulty);
  };

  return (
    <SettingsContext.Provider value={{
      botDelay,
      setBotDelay,
      botDelayMs,
      setBotDelayMs,
      botDifficulty,
      setBotDifficulty
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
