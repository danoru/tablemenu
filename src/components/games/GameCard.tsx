import { BORDER_AMBER, FONT_SANS, TEXT_FAINT } from "@/styles/theme";
import StarIcon from "@mui/icons-material/Star";
import { Box, Typography } from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";
import Link from "next/link";

import GameArt from "../games/GameArt";

export default function GameCard({ game }: { game: LibraryGame }) {
  return (
    <Link href={`/games/${game.gameId}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          background: "background.paper",
          border: "1px solid divider",
          borderRadius: "10px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            borderColor: BORDER_AMBER,
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          },
        }}
      >
        <GameArt
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
        <Box sx={{ padding: "10px 12px 12px", flex: 1 }}>
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "13px",
              fontWeight: 500,
              color: "text.primary",
              lineHeight: 1.35,
              mb: "6px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {game.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}>
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
                <StarIcon sx={{ fontSize: "10px", color: "primary.main" }} />
                <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}>
                  {game.bggRating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Link>
  );
}
