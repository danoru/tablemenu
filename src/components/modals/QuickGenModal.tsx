import { BRICK, FONT_SANS, FONT_SERIF, INK, MUSTARD, TEXT_DIM, TEXT_FAINT } from "@/styles/theme";
import CasinoIcon from "@mui/icons-material/Casino";
import CloseIcon from "@mui/icons-material/Close";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Slide,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { LibraryGame } from "@pages/api/games/library";
import React from "react";

import GameArt from "../games/GameArt";

function weightedPick(games: LibraryGame[]): LibraryGame {
  const total = games.length;
  let rand = Math.random() * total;
  for (const g of games) {
    rand -= 1;
    if (rand <= 0) return g;
  }
  return games[games.length - 1];
}

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TIME_OPTIONS = [
  { label: "Any", min: 0, max: Infinity },
  { label: "< 30 min", min: 0, max: 30 },
  { label: "30–60 min", min: 30, max: 60 },
  { label: "1–2 hrs", min: 60, max: 120 },
  { label: "2+ hrs", min: 120, max: Infinity },
];

const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

function chipSx(active: boolean) {
  return {
    fontFamily: FONT_SANS,
    fontSize: "13px",
    fontWeight: active ? 700 : 500,
    height: "32px",
    background: active ? MUSTARD : "transparent",
    border: `2px solid ${active ? INK : "rgba(51,39,26,0.3)"}`,
    color: active ? INK : TEXT_DIM,
    cursor: "pointer",
    transition: "all 0.12s ease",
    "&:hover": {
      background: active ? MUSTARD : "rgba(51,39,26,0.05)",
      borderColor: INK,
    },
    "& .MuiChip-label": { padding: "0 10px" },
  };
}

export default function QuickGenModal({
  open,
  onClose,
  library,
}: {
  open: boolean;
  onClose: () => void;
  library: LibraryGame[];
}) {
  const [players, setPlayers] = React.useState<number | null>(null);
  const [timeIdx, setTimeIdx] = React.useState(0);
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState<LibraryGame | null>(null);
  const [noResults, setNoResults] = React.useState(false);

  function getPool() {
    return library.filter((g) => {
      const timeOk =
        timeIdx === 0 ||
        (g.maxPlaytime <= TIME_OPTIONS[timeIdx].max && g.minPlaytime >= TIME_OPTIONS[timeIdx].min);
      const playerOk = players === null || (g.minPlayers <= players && g.maxPlayers >= players);
      return timeOk && playerOk;
    });
  }

  function spin() {
    const pool = getPool();
    if (pool.length === 0) {
      setNoResults(true);
      setResult(null);
      return;
    }
    setNoResults(false);
    setSpinning(true);
    setResult(null);

    let flashes = 0;
    const interval = setInterval(() => {
      setResult(pool[Math.floor(Math.random() * pool.length)]);
      flashes++;
      if (flashes >= 12) {
        clearInterval(interval);
        setResult(weightedPick(pool));
        setSpinning(false);
      }
    }, 80);
  }

  function handleClose() {
    setPlayers(null);
    setTimeIdx(0);
    setSpinning(false);
    setResult(null);
    setNoResults(false);
    onClose();
  }

  const pool = getPool();

  return (
    <Dialog open={open} onClose={handleClose} TransitionComponent={SlideUp} fullWidth maxWidth="sm">
      <DialogContent sx={{ padding: "28px", position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "24px",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: "22px",
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              Quick Gen
            </Typography>
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT, mt: "2px" }}
            >
              {pool.length} game{pool.length !== 1 ? "s" : ""} in pool
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: TEXT_DIM }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "12px",
            fontWeight: 500,
            color: TEXT_DIM,
            mb: "8px",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          Players
        </Typography>
        <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", mb: "20px" }}>
          <Chip label="Any" onClick={() => setPlayers(null)} sx={chipSx(players === null)} />
          {PLAYER_OPTIONS.map((n) => (
            <Chip
              key={n}
              label={n}
              onClick={() => setPlayers(players === n ? null : n)}
              sx={chipSx(players === n)}
            />
          ))}
        </Box>

        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "12px",
            fontWeight: 500,
            color: TEXT_DIM,
            mb: "8px",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          Time budget
        </Typography>
        <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", mb: "28px" }}>
          {TIME_OPTIONS.map((opt, i) => (
            <Chip
              key={opt.label}
              label={opt.label}
              onClick={() => setTimeIdx(i)}
              sx={chipSx(timeIdx === i)}
            />
          ))}
        </Box>

        <Divider sx={{ borderColor: "divider", mb: "28px" }} />

        <Box
          sx={{
            minHeight: "160px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          {!result && !spinning && !noResults && (
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "14px",
                color: TEXT_FAINT,
                fontStyle: "italic",
              }}
            >
              Set your filters and spin
            </Typography>
          )}
          {noResults && (
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "14px", fontWeight: 500, color: "error.main" }}
            >
              No games match those filters.
            </Typography>
          )}
          {(result || spinning) && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                opacity: spinning ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {result && <GameArt game={result} size={100} />}
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "24px",
                  fontWeight: 700,
                  color: spinning ? TEXT_DIM : BRICK,
                  textAlign: "center",
                  maxWidth: "320px",
                }}
              >
                {result?.name}
              </Typography>
              {!spinning && result && (
                <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
                  {result.minPlayers === result.maxPlayers
                    ? `${result.minPlayers} players`
                    : `${result.minPlayers}–${result.maxPlayers} players`}
                  {" · "}
                  {result.minPlaytime === result.maxPlaytime
                    ? `${result.minPlaytime} min`
                    : `${result.minPlaytime}–${result.maxPlaytime} min`}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: "10px", mt: "24px" }}>
          <Button
            fullWidth
            variant="contained"
            onClick={spin}
            disabled={spinning}
            startIcon={
              spinning ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : <CasinoIcon />
            }
            sx={{ fontSize: "15px", padding: "10px" }}
          >
            {spinning ? "Picking…" : result ? "Spin again" : "Spin"}
          </Button>
          {result && !spinning && (
            <Button
              variant="outlined"
              onClick={spin}
              startIcon={<ShuffleIcon />}
              sx={{ fontSize: "15px", padding: "10px 20px", whiteSpace: "nowrap" }}
            >
              Re-roll
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
