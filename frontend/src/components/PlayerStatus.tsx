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
  return (
    <div className="w-full max-w-md mb-4 bg-serika-dark--sub-alt-color rounded-lg p-4">
      <h3 className="text-serika-dark--text-color font-bold mb-3 text-center">Players</h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-2 rounded transition-colors
              ${player.isCurrentTurn
                ? 'bg-serika-dark--main-color text-black'
                : 'bg-serika-dark--bg-color text-serika-dark--text-color'
              }`}
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium">{player.name}</span>
              {player.isCurrentTurn && (
                <i className="fas fa-arrow-right text-xs"></i>
              )}
            </div>

            {/* Visual failure indicators */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: player.maxFailures }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border-2
                    ${i < player.failures
                      ? 'bg-serika-dark--error-color border-serika-dark--error-color'
                      : 'bg-transparent border-serika-dark--sub-color'
                    }`}
                />
              ))}
              <span className="ml-2 text-xs">
                {player.maxFailures - player.failures} left
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
