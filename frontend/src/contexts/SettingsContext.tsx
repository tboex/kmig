// src/contexts/SettingsContext.tsx
import { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  botDelay: boolean;
  setBotDelay: (delay: boolean) => void;
  botDelayMs: number;
  setBotDelayMs: (ms: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [botDelay, setBotDelayState] = useState(() => {
    return localStorage.getItem('kmig_bot_delay') === 'true';
  });

  const [botDelayMs, setBotDelayMsState] = useState(() => {
    return parseInt(localStorage.getItem('kmig_bot_delay_ms') || '1500');
  });

  const setBotDelay = (delay: boolean) => {
    setBotDelayState(delay);
    localStorage.setItem('kmig_bot_delay', delay.toString());
  };

  const setBotDelayMs = (ms: number) => {
    setBotDelayMsState(ms);
    localStorage.setItem('kmig_bot_delay_ms', ms.toString());
  };

  return (
    <SettingsContext.Provider value={{
      botDelay,
      setBotDelay,
      botDelayMs,
      setBotDelayMs
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
