import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Player {
    id: string;
    name: string;
    failures: number;
    maxFailures: number;
    isCurrentTurn: boolean;
}

interface PlayerStatusProps {
    players: Player[];
}

export default function PlayerStatus({ players }: PlayerStatusProps) {
    const { t } = useLanguage();

    // read local player id from storage if present
    const localId = typeof window !== 'undefined' ? localStorage.getItem('kmig_username') : null;
    const isLocalTurn = localId ? players.some(p => p.id === localId && p.isCurrentTurn) : false;

        return (
            // add bottom padding to reserve space for the absolutely-positioned turn banner
            <div className="relative w-full max-w-md mb-16 bg-theme-sub-alt rounded-lg p-4 pb-12 overflow-visible">
            <h3 className="text-theme-text font-bold mb-3 text-center">{t('player.players')}</h3>

            <div className="space-y-2">
                {players.map((player) => (
                    <div key={player.id} className="relative">
                        {player.isCurrentTurn && (
                            <i className="fas fa-arrow-right text-xs absolute left-[-20px] top-1/2 transform -translate-y-1/2 text-theme-main" />
                        )}

                        <div
                            className={`flex items-center justify-between p-2 rounded transition-colors ${
                                player.isCurrentTurn ? 'bg-theme-main text-black' : 'bg-theme-bg text-theme-text'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">{player.isCurrentTurn ? player.name + t('player.possessive_turn') : player.name}</span>
                            </div>

                            <div className="flex items-center space-x-1">
                                {Array.from({ length: player.maxFailures }, (_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full border-2 ${
                                            i < player.failures ? 'bg-theme-error border-theme-error' : 'bg-transparent border-theme-sub'
                                        }`}
                                    />
                                ))}
                                <span className="ml-2 text-xs">
                                    {player.maxFailures - player.failures} {t('player.left')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* absolutely positioned banner that overlays below component so it doesn't shift layout */}
            <AnimatePresence>
                {isLocalTurn && (
                    <motion.div
                        key="player-turn-banner"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: '0%', opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="absolute left-0 w-full flex justify-center pointer-events-none"
                        style={{ bottom: '-2.5rem' }}
                    >
                        <div role="status" aria-live="polite" className="w-full max-w-md px-4 py-2 rounded bg-[var(--color-main)] text-[var(--color-text)] text-center font-semibold shadow-sm pointer-events-auto">
                            {t('game.yourTurn') || 'Your turn'}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
