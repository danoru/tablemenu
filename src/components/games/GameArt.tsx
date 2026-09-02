import { gameColor, initials } from "@/lib/helpers";
import { FONT_SERIF, INK } from "@/styles/theme";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";

/** Everything this component actually reads — any game-shaped object will do,
 *  not just a full LibraryGame. */
export interface GameArtGame {
  name: string;
  imageUrl: string | null;
}

// Grid cards top out around a third of the viewport; below the `sm` breakpoint
// they go full-bleed. Keeps the optimizer from serving a 1200px BGG original
// into a 200px slot.
const FULL_WIDTH_SIZES = "(max-width: 600px) 100vw, 33vw";

// flush: rendered inside a bordered card frame that supplies its own border/radius
// fullWidth: fill the parent's width as a square (grid-card art) instead of a fixed pixel size
export default function GameArt({
  game,
  size = 120,
  flush = false,
  fullWidth = false,
  priority = false,
}: {
  game: GameArtGame;
  size?: number;
  flush?: boolean;
  fullWidth?: boolean;
  /** Set on art that is the page's largest paint — opts out of lazy loading. */
  priority?: boolean;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);

  const frameSx = flush
    ? {}
    : { border: `2px solid ${INK}`, borderRadius: "10px", overflow: "hidden" };
  const sizeSx = fullWidth
    ? { width: "100%", aspectRatio: "1 / 1", height: "auto" }
    : { width: size, height: size };

  if (game.imageUrl && !imageFailed) {
    // Fixed sizes get width/height so Next emits a two-entry 1x/2x srcSet; the
    // `fill` path needs the full candidate list, which is ~4kB of markup each.
    const image = fullWidth ? (
      <Image
        alt={game.name}
        fill
        priority={priority}
        sizes={FULL_WIDTH_SIZES}
        src={game.imageUrl}
        style={{ objectFit: "cover" }}
        onError={() => setImageFailed(true)}
      />
    ) : (
      <Image
        alt={game.name}
        height={size}
        priority={priority}
        src={game.imageUrl}
        style={{ objectFit: "cover" }}
        width={size}
        onError={() => setImageFailed(true)}
      />
    );

    return (
      <Box
        sx={{
          ...sizeSx,
          position: "relative",
          flexShrink: 0,
          "& > img": { display: "block" },
          ...frameSx,
        }}
      >
        {image}
      </Box>
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
