import { useLanguage } from '../contexts/LanguageContext';

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
    return (
        <div className="w-full max-w-md mb-4 bg-theme-sub-alt rounded-lg p-4">
        <h3 className="text-theme-text font-bold mb-3 text-center">{t('player.players')}</h3>
        <div className="space-y-2">
            {players.map((player) => (
                <div key={player.id} className="relative"> {/* Add relative positioning */}
                {/* Arrow positioned absolutely to the left */}
                {player.isCurrentTurn && (
                    <i className="fas fa-arrow-right text-xs absolute left-[-20px] top-1/2 transform -translate-y-1/2 text-theme-main"></i>
                )}

                <div
                    className={`flex items-center justify-between p-2 rounded transition-colors
                    ${player.isCurrentTurn
                        ? 'bg-theme-main text-black'
                        : 'bg-theme-bg text-theme-text'
                    }`}
                >
                    <div className="flex items-center space-x-2">
                    <span className="font-medium">{player.isCurrentTurn ? player.name + t('player.possessive_turn') : player.name}</span>
                    {/* Remove the arrow from here */}
                    </div>

                    {/* Visual failure indicators */}
                    <div className="flex items-center space-x-1">
                    {Array.from({ length: player.maxFailures }, (_, i) => (
                        <div
                        key={i}
                        className={`w-3 h-3 rounded-full border-2
                            ${i < player.failures
                            ? 'bg-theme-error border-theme-error'
                            : 'bg-transparent border-theme-sub'
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
        </div>
    );
}
