import {
  BRICK,
  FONT_SANS,
  INK,
  MUSTARD,
  SHADOW_HARD,
  SHADOW_HARD_HOVER,
  TEXT_FAINT,
  TINT_BRICK,
} from "@/styles/theme";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarIcon from "@mui/icons-material/Star";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";
import Link from "next/link";

import GameArt from "../games/GameArt";

export default function GameCard({
  game,
  onRemove,
}: {
  game: LibraryGame;
  onRemove?: (game: LibraryGame) => void;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        "&:hover .game-card-remove, & .game-card-remove:focus-visible": { opacity: 1 },
      }}
    >
      <Link
        href={`/games/${game.gameId}`}
        style={{ textDecoration: "none", display: "block", height: "100%" }}
      >
        <Box
          sx={{
            backgroundColor: "background.paper",
            border: `2px solid ${INK}`,
            borderRadius: "13px",
            boxShadow: SHADOW_HARD,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            cursor: "pointer",
            transition: "transform 0.12s ease, box-shadow 0.12s ease",
            "&:hover": {
              transform: "translate(-2px, -2px)",
              boxShadow: SHADOW_HARD_HOVER,
            },
          }}
        >
          <Box sx={{ borderBottom: `2px solid ${INK}`, "& > *": { display: "block" } }}>
            <GameArt
              flush
              fullWidth
              game={
                {
                  ...game,
                  gameId: game.gameId,
                  userGameId: 0,
                  addedAt: "",
                  weight: 1,
                  notes: null,
                  description: null,
                  mechanics: [],
                  designers: [],
                  publishers: [],
                  userStars: null,
                } as LibraryGame
              }
              size={120}
            />
          </Box>
          <Box
            sx={{ padding: "10px 12px 12px", flex: 1, display: "flex", flexDirection: "column" }}
          >
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "13px",
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1.35,
                mb: "6px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                // reserve two lines so single-line titles don't shrink the card
                minHeight: "calc(2 * 1.35 * 13px)",
              }}
            >
              {game.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: "auto",
              }}
            >
              <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: "text.secondary" }}>
                {game.minPlayers === game.maxPlayers
                  ? `${game.minPlayers}p`
                  : `${game.minPlayers}–${game.maxPlayers}p`}
                {" · "}
                {game.minPlaytime === game.maxPlaytime
                  ? `${game.minPlaytime}m`
                  : `${game.minPlaytime}–${game.maxPlaytime}m`}
              </Typography>
              {game.bggRating != null && (
                <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  <StarIcon sx={{ fontSize: "11px", color: MUSTARD }} />
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "text.secondary",
                    }}
                  >
                    {game.bggRating.toFixed(1)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Link>
      {onRemove && (
        <Tooltip title="Remove from library">
          <IconButton
            aria-label={`Remove ${game.name} from library`}
            className="game-card-remove"
            sx={{
              position: "absolute",
              top: "6px",
              right: "6px",
              padding: "4px",
              backgroundColor: "background.paper",
              border: `2px solid ${INK}`,
              borderRadius: "8px",
              color: TEXT_FAINT,
              opacity: 0,
              transition: "opacity 0.12s ease, color 0.12s ease",
              "&:hover": { color: BRICK, borderColor: BRICK, backgroundColor: TINT_BRICK },
              // keep the control reachable where hover does not exist (touch)
              "@media (hover: none)": { opacity: 1 },
            }}
            onClick={() => onRemove(game)}
          >
            <DeleteOutlineIcon sx={{ fontSize: "15px" }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
