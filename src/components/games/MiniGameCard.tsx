import { BORDER_AMBER, FONT_SANS, TEXT_FAINT } from "@/styles/theme";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";

import GameArt from "../games/GameArt";

export function MiniGameCard({
  game,
  accent,
  onReroll,
  rerolling,
}: {
  game: LibraryGame;
  accent: string;
  onReroll: () => void;
  rerolling: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "10px",
        transition: "border-color 0.15s",
        "&:hover": { borderColor: BORDER_AMBER },
        opacity: rerolling ? 0.5 : 1,
      }}
    >
      <GameArt game={game} size={48} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "14px",
            fontWeight: 500,
            color: "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {game.name}
        </Typography>
        <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT, mt: "2px" }}>
          {game.minPlayers === game.maxPlayers
            ? `${game.minPlayers} players`
            : `${game.minPlayers}–${game.maxPlayers} players`}
          {" · "}
          {game.minPlaytime === game.maxPlaytime
            ? `${game.minPlaytime} min`
            : `${game.minPlaytime}–${game.maxPlaytime} min`}
        </Typography>
      </Box>

      <IconButton
        onClick={onReroll}
        disabled={rerolling}
        size="small"
        sx={{
          color: accent,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "7px",
          "&:hover": { background: "rgba(255,255,255,0.08)", borderColor: accent },
        }}
      >
        {rerolling ? (
          <CircularProgress size={14} sx={{ color: accent }} />
        ) : (
          <RefreshIcon sx={{ fontSize: "16px" }} />
        )}
      </IconButton>
    </Box>
  );
}
