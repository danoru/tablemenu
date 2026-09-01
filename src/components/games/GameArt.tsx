import { gameColor, initials } from "@/lib/helpers";
import { FONT_SERIF, INK } from "@/styles/theme";
import { Box, Typography } from "@mui/material";
import React from "react";

/** Everything this component actually reads — any game-shaped object will do,
 *  not just a full LibraryGame. */
export interface GameArtGame {
  name: string;
  imageUrl: string | null;
}

// flush: rendered inside a bordered card frame that supplies its own border/radius
// fullWidth: fill the parent's width as a square (grid-card art) instead of a fixed pixel size
export default function GameArt({
  game,
  size = 120,
  flush = false,
  fullWidth = false,
}: {
  game: GameArtGame;
  size?: number;
  flush?: boolean;
  fullWidth?: boolean;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);

  const frameSx = flush
    ? {}
    : { border: `2px solid ${INK}`, borderRadius: "10px", overflow: "hidden" };
  const sizeSx = fullWidth
    ? { width: "100%", aspectRatio: "1 / 1", height: "auto" }
    : { width: size, height: size };

  if (game.imageUrl && !imageFailed) {
    return (
      <Box
        component="img"
        src={game.imageUrl}
        alt={game.name}
        sx={{ ...sizeSx, objectFit: "cover", display: "block", ...frameSx }}
        onError={() => setImageFailed(true)}
      />
    );
  }
  return (
    <Box
      sx={{
        ...sizeSx,
        background: gameColor(game.name),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...frameSx,
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT_SERIF,
          fontSize: size > 80 ? "28px" : "18px",
          fontWeight: 900,
          color: "rgba(255,251,240,0.9)",
          userSelect: "none",
        }}
      >
        {initials(game.name)}
      </Typography>
    </Box>
  );
}
