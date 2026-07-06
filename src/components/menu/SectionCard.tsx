import { playersLabel, priceLabel, ratingLabel, spiceLevel, tastingNote } from "@/lib/menu/format";
import type { SectionAccent, SectionConfig } from "@/lib/menu/types";
import {
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  MUSTARD,
  MUSTARD_DARK,
  OLIVE,
  PLUM,
  SHADOW_HARD,
  TEAL,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_BRICK,
  TINT_MUSTARD,
  TINT_OLIVE,
  TINT_PLUM,
  TINT_TEAL,
} from "@/styles/theme";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import type { LibraryGame } from "@pages/api/games/library";

const ACCENTS: Record<SectionAccent, { fill: string; accent: string }> = {
  olive: { fill: TINT_OLIVE, accent: OLIVE },
  brick: { fill: TINT_BRICK, accent: BRICK },
  plum: { fill: TINT_PLUM, accent: PLUM },
  mustard: { fill: TINT_MUSTARD, accent: MUSTARD_DARK },
  teal: { fill: TINT_TEAL, accent: TEAL },
};

function SpiceMeter({ level, color }: { level: number; color: string }) {
  if (level <= 0) return null;
  return (
    <Box
      sx={{ display: "inline-flex", alignItems: "center", gap: "2px" }}
      aria-label={`Spice ${level} of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            backgroundColor: i < level ? color : "transparent",
            border: `1px solid ${i < level ? color : "rgba(51,39,26,0.25)"}`,
          }}
        />
      ))}
    </Box>
  );
}

// One menu section: a centered sticker label + tasting-menu rows.
export default function SectionCard({
  section,
  games,
  onRerollGame,
  rerollingIdx,
}: {
  section: SectionConfig;
  games: LibraryGame[];
  onRerollGame: (idx: number) => void;
  rerollingIdx: number | null;
}) {
  const { fill, accent } = ACCENTS[section.accent];
  const empty = games.length === 0;

  return (
    <Box component="section">
      <Box sx={{ textAlign: "center", mb: "6px" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: fill,
            border: `2px solid ${INK}`,
            borderRadius: "999px",
            boxShadow: SHADOW_HARD,
            padding: "5px 18px",
          }}
        >
          <Box component="span" sx={{ fontSize: "15px", lineHeight: 1 }}>
            {section.icon}
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
            {section.label}
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
        {section.subtitle}
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {games.map((game, idx) => {
            const rerolling = rerollingIdx === idx;
            const note = tastingNote(game);
            const rating = ratingLabel(game);
            const spice = spiceLevel(game);
            return (
              <Box
                key={`${game.gameId}-${idx}`}
                sx={{ opacity: rerolling ? 0.45 : 1, transition: "opacity 0.2s" }}
              >
                <Box sx={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
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
                    {game.isFavorite && (
                      <Box
                        component="span"
                        sx={{
                          ml: "8px",
                          fontFamily: FONT_SANS,
                          fontSize: "9px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: MUSTARD_DARK,
                          border: `1px solid ${MUSTARD}`,
                          borderRadius: "999px",
                          padding: "1px 7px",
                          whiteSpace: "nowrap",
                          verticalAlign: "middle",
                        }}
                      >
                        ★ House specialty
                      </Box>
                    )}
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
                      fontWeight: 700,
                      color: "text.primary",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {priceLabel(game)}
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
                        color: accent,
                        flexShrink: 0,
                        "&:hover": { background: fill, borderColor: accent },
                      }}
                    >
                      {rerolling ? (
                        <CircularProgress size={12} sx={{ color: accent }} />
                      ) : (
                        <RefreshIcon sx={{ fontSize: "14px" }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    mt: "3px",
                    pr: "38px",
                  }}
                >
                  <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_DIM }}>
                    {playersLabel(game)}
                  </Typography>
                  {spice > 0 && <SpiceMeter color={accent} level={spice} />}
                  {rating && (
                    <Typography
                      sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: MUSTARD_DARK }}
                    >
                      {rating}
                    </Typography>
                  )}
                </Box>

                {note && (
                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontStyle: "italic",
                      fontSize: "13px",
                      color: TEXT_DIM,
                      lineHeight: 1.4,
                      mt: "4px",
                      pr: "38px",
                    }}
                  >
                    {note}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
