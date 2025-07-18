import { useParams } from "react-router-dom";

export default function GamePageMultiplayer() {
  const { gameId } = useParams<{ gameId: string }>();

  return (
    <div>
      {/* Multiplayer game UI */}
    </div>
  );
}
