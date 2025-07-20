export default function TurnIndicator({ isUserTurn }: { isUserTurn: boolean }) {
  return (
    <div
      className={`flex items-center px-3 py-2 rounded font-bold text-lg
        ${isUserTurn
          ? 'bg-serika-dark--sub-alt-color text-serika-dark--text-color'
          : 'bg-serika-dark--sub-alt-color text-serika-dark--text-color'
        }`}
      style={{ minWidth: 80, justifyContent: 'center' }}
    >
      {isUserTurn ? 'Your Turn' : "Bot's Turn"}
    </div>
  );
}
