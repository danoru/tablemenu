import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import type { LibraryGame } from "@pages/api/games/library";

import GameArt from "@/components/games/GameArt";
import RibbonLabel from "@/components/menu/RibbonLabel";
import { playersLabel, priceLabel, ratingLabel, spiceLevel, tastingNote } from "@/lib/menu/format";
import type { SectionAccent, SectionConfig } from "@/lib/menu/types";
import {
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  MUSTARD_DARK,
  OLIVE,
  PLUM,
  TEAL,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_BRICK,
  TINT_MUSTARD,
  TINT_OLIVE,
  TINT_PLUM,
  TINT_TEAL,
} from "@/styles/theme";

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
      aria-label={`Spice ${level} of 5`}
      sx={{ display: "inline-flex", alignItems: "center", gap: "2px" }}
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

function GameRow({
  game,
  fill,
  accent,
  rerolling,
  onReroll,
}: {
  game: LibraryGame;
  fill: string;
  accent: string;
  rerolling: boolean;
  onReroll: () => void;
}) {
  const note = tastingNote(game);
  const rating = ratingLabel(game);
  const spice = spiceLevel(game);
  return (
    <Box
      sx={{
        display: "flex",
        gap: "12px",
        opacity: rerolling ? 0.45 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <Box sx={{ flexShrink: 0, pt: "2px" }}>
        <GameArt game={game} size={46} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <Typography
            noWrap
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "16px",
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
              minWidth: "20px",
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
              sx={{
                alignSelf: "center",
                width: "26px",
                height: "26px",
                border: `1.5px solid rgba(51,39,26,0.3)`,
                borderRadius: "50%",
                color: accent,
                flexShrink: 0,
                "&:hover": { background: fill, borderColor: accent },
              }}
              onClick={onReroll}
            >
              {rerolling ? (
                <CircularProgress size={12} sx={{ color: accent }} />
              ) : (
                <RefreshIcon sx={{ fontSize: "14px" }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_DIM }}>
            {playersLabel(game)}
          </Typography>
          {spice > 0 && <SpiceMeter color={accent} level={spice} />}
          {rating && (
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: MUSTARD_DARK }}>
              {rating}
            </Typography>
          )}
          {game.isFavorite && (
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: MUSTARD_DARK,
              }}
            >
              ★ House specialty
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
              mt: "3px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {note}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// One menu section: ink ribbon banner + tasting-menu rows with cover art.
// hideHeader/twoColumn support the Today's Special feature box, whose frame
// and banner are drawn by the page around this card.
export default function SectionCard({
  section,
  games,
  onRerollGame,
  rerollingIdx,
  hideHeader = false,
  twoColumn = false,
}: {
  section: SectionConfig;
  games: LibraryGame[];
  onRerollGame: (idx: number) => void;
  rerollingIdx: number | null;
  hideHeader?: boolean;
  twoColumn?: boolean;
}) {
  const { fill, accent } = ACCENTS[section.accent];
  const empty = games.length === 0;

  return (
    <Box component="section">
      {!hideHeader && (
        <>
          <RibbonLabel fullWidth icon={section.icon} label={section.label} />
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: "14px",
              color: TEXT_FAINT,
              textAlign: "center",
              mt: "8px",
              mb: "16px",
            }}
          >
            {section.subtitle}
          </Typography>
        </>
      )}

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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: twoColumn ? { xs: "1fr", sm: "1fr 1fr" } : "1fr",
            columnGap: "32px",
            rowGap: "18px",
          }}
        >
          {games.map((game, idx) => (
            <GameRow
              key={`${game.gameId}-${idx}`}
              accent={accent}
              fill={fill}
              game={game}
              rerolling={rerollingIdx === idx}
              onReroll={() => onRerollGame(idx)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
