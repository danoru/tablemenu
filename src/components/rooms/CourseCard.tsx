import {
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  OLIVE,
  PLUM,
  TEAL,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_BRICK,
  TINT_OLIVE,
  TINT_PLUM,
  TINT_TEAL,
} from "@/styles/theme";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";

type CourseId = "appetizer" | "entree" | "epic" | "dessert";

interface Course {
  id: CourseId;
  icon: string;
  label: string;
  subtitle: string;
  color: string;
  border: string;
  accent: string;
  filter: (g: LibraryGame) => boolean;
  picks: number;
}

// Café Press accents per course: tint fill + solid accent ink, paired with ink borders.
const COURSE_STYLES: Record<CourseId, { fill: string; accent: string }> = {
  appetizer: { fill: TINT_OLIVE, accent: OLIVE },
  entree: { fill: TINT_BRICK, accent: BRICK },
  epic: { fill: TINT_PLUM, accent: PLUM },
  dessert: { fill: TINT_TEAL, accent: TEAL },
};

function formatPlayers(game: LibraryGame): string {
  return game.minPlayers === game.maxPlayers
    ? `${game.minPlayers}p`
    : `${game.minPlayers}–${game.maxPlayers}p`;
}

function formatPlaytime(game: LibraryGame): string {
  return game.minPlaytime === game.maxPlaytime
    ? `${game.minPlaytime} min`
    : `${game.minPlaytime}–${game.maxPlaytime} min`;
}

// One course section of the printed menu sheet: a centered sticker label,
// then each game as a menu line — name, dotted leader, meta, reroll token.
export default function CourseCard({
  course,
  games,
  onRerollGame,
  rerollingIdx,
  empty,
}: {
  course: Course;
  games: LibraryGame[];
  onRerollGame: (idx: number) => void;
  rerollingIdx: number | null;
  empty: boolean;
}) {
  const courseStyle = COURSE_STYLES[course.id];

  return (
    <Box component="section">
      <Box sx={{ textAlign: "center", mb: "6px" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: courseStyle.fill,
            border: `2px solid ${INK}`,
            borderRadius: "999px",
            padding: "5px 18px",
          }}
        >
          <Box component="span" sx={{ fontSize: "15px", lineHeight: 1 }}>
            {course.icon}
          </Box>
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "12px",
              fontWeight: 700,
              color: INK,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {course.label}
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: "14px",
          color: TEXT_FAINT,
          textAlign: "center",
          mb: "18px",
        }}
      >
        {course.subtitle}
      </Typography>

      {empty ? (
        <Typography
          sx={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: "14px",
            color: TEXT_FAINT,
            textAlign: "center",
            py: "6px",
          }}
        >
          — Left to the chef&apos;s discretion —
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {games.map((game, idx) => {
            const rerolling = rerollingIdx === idx;
            return (
              <Box
                key={`${game.gameId}-${idx}`}
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "10px",
                  opacity: rerolling ? 0.45 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_SERIF,
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "text.primary",
                    lineHeight: 1.3,
                    flexShrink: 1,
                    minWidth: 0,
                  }}
                >
                  {game.name}
                </Typography>

                <Box
                  sx={{
                    flex: 1,
                    minWidth: "24px",
                    borderBottom: "2px dotted rgba(51,39,26,0.35)",
                    transform: "translateY(-4px)",
                  }}
                />

                <Typography
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "12px",
                    fontWeight: 500,
                    color: TEXT_DIM,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatPlayers(game)} · {formatPlaytime(game)}
                </Typography>

                <Tooltip placement="top" title="Re-roll this pick">
                  <IconButton
                    disabled={rerolling}
                    size="small"
                    onClick={() => onRerollGame(idx)}
                    sx={{
                      alignSelf: "center",
                      width: "28px",
                      height: "28px",
                      border: `1.5px solid rgba(51,39,26,0.3)`,
                      borderRadius: "50%",
                      color: courseStyle.accent,
                      flexShrink: 0,
                      "&:hover": {
                        background: courseStyle.fill,
                        borderColor: courseStyle.accent,
                      },
                    }}
                  >
                    {rerolling ? (
                      <CircularProgress size={12} sx={{ color: courseStyle.accent }} />
                    ) : (
                      <RefreshIcon sx={{ fontSize: "14px" }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
