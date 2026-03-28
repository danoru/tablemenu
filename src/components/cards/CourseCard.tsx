import { Box, Divider, Typography } from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";

import { MiniGameCard } from "./MiniGameCard";

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = "#e8c97a";
const GREEN_BRIGHT = "#5ec97a";
const TEXT = "#f0e6cc";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SERIF = "'Playfair Display', serif";
const FONT_SANS = "'DM Sans', sans-serif";

const COURSES = [
  {
    id: "appetizer",
    icon: "🥨",
    label: "Appetizers",
    subtitle: "While everyone arrives",
    color: "rgba(34,85,48,0.25)",
    border: "rgba(60,160,80,0.2)",
    accent: GREEN_BRIGHT,
    filter: (g: LibraryGame) => g.maxPlaytime <= 20,
    picks: 2,
  },
  {
    id: "entree",
    icon: "🍽️",
    label: "Entrées",
    subtitle: "The main event",
    color: "rgba(180,110,30,0.18)",
    border: "rgba(180,140,60,0.25)",
    accent: GOLD,
    filter: (g: LibraryGame) => g.minPlaytime >= 30 && g.maxPlaytime <= 90,
    picks: 2,
  },
  {
    id: "epic",
    icon: "🏰",
    label: "Epic Course",
    subtitle: "Go all in",
    color: "rgba(60,40,80,0.25)",
    border: "rgba(100,70,160,0.25)",
    accent: "#c4a0f0",
    filter: (g: LibraryGame) => g.minPlaytime >= 90,
    picks: 1,
  },
  {
    id: "dessert",
    icon: "🎂",
    label: "Desserts",
    subtitle: "Wind down the night",
    color: "rgba(90,30,30,0.2)",
    border: "rgba(160,70,70,0.2)",
    accent: "#f0a0a0",
    filter: (g: LibraryGame) => g.maxPlaytime <= 25,
    picks: 2,
  },
] as const;

type CourseId = (typeof COURSES)[number]["id"];

export default function CourseCard({
  course,
  games,
  onRerollGame,
  rerollingIdx,
  empty,
}: {
  course: (typeof COURSES)[number];
  games: LibraryGame[];
  onRerollGame: (idx: number) => void;
  rerollingIdx: number | null;
  empty: boolean;
}) {
  return (
    <Box
      sx={{
        background: course.color,
        border: `1px solid ${course.border}`,
        borderRadius: "14px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Course header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Box
          sx={{
            width: "44px",
            height: "44px",
            borderRadius: "10px",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            flexShrink: 0,
          }}
        >
          {course.icon}
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "18px",
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1,
            }}
          >
            {course.label}
          </Typography>
          <Typography
            sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT, mt: "3px" }}
          >
            {course.subtitle}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: course.border }} />

      {/* Games */}
      {empty ? (
        <Box sx={{ textAlign: "center", py: "16px" }}>
          <Typography
            sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT, fontStyle: "italic" }}
          >
            No games in your library fit this course.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {games.map((game, idx) => (
            <MiniGameCard
              key={`${game.gameId}-${idx}`}
              game={game}
              accent={course.accent}
              onReroll={() => onRerollGame(idx)}
              rerolling={rerollingIdx === idx}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
