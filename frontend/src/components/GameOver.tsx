interface GameOverProps {
  isOpen: boolean;
  isDefeat: boolean;
  onClose: () => void;
  onPlayAgain?: () => void;
}

export default function GameOver({ isOpen, isDefeat, onClose, onPlayAgain }: GameOverProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-serika-dark--bg-color bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-serika-dark--sub-color p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
        <div className={`text-6xl mb-4 ${isDefeat ? 'text-serika-dark--error-color' : 'text-serika-dark--main-color'}`}>
          {isDefeat ? '💀': '🎉'}
        </div>

        <h2 className={`text-3xl font-bold mb-4 ${isDefeat ? 'text-serika-dark--error-color' : 'text-serika-dark--main-color'}`}>
          {isDefeat ? 'Defeat!': 'Victory!'}
        </h2>

        <p className="text-serika-dark--main-color mb-6">
          {isDefeat
            ?  'Game over! Better luck next time.'
            : 'Congratulations! You won the game!'
          }
        </p>

        <div className="flex flex-col space-y-3">
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="px-6 py-3 bg-serika-dark--sub-alt-color text-serika-dark--main-color font-bold rounded-lg hover:opacity-80 transition-opacity"
            >
              Play Again
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-serika-dark--caret-color text-serika-dark--sub-alt-color font-bold rounded-lg hover:opacity-80 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
