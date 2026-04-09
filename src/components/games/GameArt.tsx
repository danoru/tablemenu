import { gameColor, initials } from "@/lib/helpers";
import { FONT_SERIF } from "@/styles/theme";
import { Box, Typography } from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";

export default function GameArt({ game, size = 120 }: { game: LibraryGame; size?: number }) {
  if (game.imageUrl) {
    return (
      <Box
        component="img"
        src={game.imageUrl}
        alt={game.name}
        sx={{ width: size, height: size, objectFit: "cover", borderRadius: "8px 8px 0 0" }}
      />
    );
  }
  return (
    <Box
      sx={{
        width: size,
        height: size,
        background: gameColor(game.name),
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid",
        borderColor: "divider",
        borderBottom: "none",
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT_SERIF,
          fontSize: size > 80 ? "28px" : "18px",
          fontWeight: 700,
          color: "rgba(232,223,200,0.5)",
          userSelect: "none",
        }}
      >
        {initials(game.name)}
      </Typography>
    </Box>
  );
}
