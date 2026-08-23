import { Box } from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";

import GameCard from "./GameCard";

export default function GameGrid({
  games,
  onRemove,
}: {
  games: LibraryGame[];
  onRemove?: (game: LibraryGame) => void;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(auto-fill, minmax(130px, 1fr))",
          sm: "repeat(auto-fill, minmax(150px, 1fr))",
          md: "repeat(auto-fill, minmax(160px, 1fr))",
        },
        gridAutoRows: "1fr",
        gap: "14px",
      }}
    >
      {games.map((game) => (
        <GameCard key={game.gameId} game={game} onRemove={onRemove} />
      ))}
    </Box>
  );
}
