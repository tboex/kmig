interface GameOverProps {
  isOpen: boolean;
  isDefeat: boolean;
  onClose: () => void;
  onPlayAgain?: () => void;
}

export default function GameOver({ isOpen, isDefeat, onClose, onPlayAgain }: GameOverProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-theme-bg bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-sub p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
        <div className={`text-6xl mb-4 ${isDefeat ? 'text-theme-error' : 'text-theme-main'}`}>
          {isDefeat ? '💀': '🎉'}
        </div>

        <h2 className={`text-3xl font-bold mb-4 ${isDefeat ? 'text-theme-error' : 'text-theme-main'}`}>
          {isDefeat ? '패배!': '승리!'}
        </h2>

        <p className="text-theme-main mb-6">
          {isDefeat
            ?  'Game over! Better luck next time.'
            : 'Congratulations! You won the game!'
          }
        </p>

        <div className="flex flex-col space-y-3">
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="px-6 py-3 bg-theme-sub-alt text-theme-main font-bold rounded-lg hover:opacity-80 transition-opacity"
            >
              Play Again
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-theme-caret text-theme-sub-alt font-bold rounded-lg hover:opacity-80 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
