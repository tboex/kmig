export default function TurnIndicator({ isUserTurn, currentTurn }: { isUserTurn: boolean; currentTurn: string }) {
  return (
        <div
            className={`flex items-center px-3 py-2 rounded font-bold text-lg min-w-[90px] justify-center
                ${isUserTurn
                    ? 'bg-desert-oasis--main-color text-black'
                    : 'bg-desert-oasis--sub-alt-color text-desert-oasis--main-color'
                }`}
        >
            {isUserTurn ? 'Your Turn' : `${currentTurn}'s Turn`}
        </div>
    );
}
