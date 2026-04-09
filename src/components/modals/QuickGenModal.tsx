import {
  BG_ELEVATED,
  BORDER_AMBER,
  FONT_SANS,
  FONT_SERIF,
  GOLD,
  TEXT_DIM,
  TEXT_FAINT,
} from "@/styles/theme";
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
    fontWeight: active ? 500 : 400,
    height: "32px",
    background: active ? "rgba(200,150,42,0.2)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? "primary.main" : "divider"}`,
    color: active ? GOLD : TEXT_DIM,
    cursor: "pointer",
    transition: "all 0.15s",
    "&:hover": {
      background: active ? "rgba(200,150,42,0.3)" : "rgba(255,255,255,0.07)",
      borderColor: "primary.main",
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
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={SlideUp}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          background: BG_ELEVATED,
          border: `1px solid ${BORDER_AMBER}`,
          borderRadius: "14px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,85,48,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
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
              sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: "rgba(220,100,100,0.8)" }}
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
                  color: spinning ? TEXT_DIM : GOLD,
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
            onClick={spin}
            disabled={spinning}
            startIcon={
              spinning ? (
                <CircularProgress size={16} sx={{ color: "background.default" }} />
              ) : (
                <CasinoIcon />
              )
            }
            sx={{
              backgroundColor: "primary.main",
              borderRadius: "8px",
              color: "background.default",
              fontFamily: FONT_SANS,
              fontSize: "15px",
              fontWeight: 500,
              padding: "12px",
              textTransform: "none",
              "&:hover": { backgroundColor: "primary.light" },
              "&.Mui-disabled": { background: "rgba(200,150,42,0.35)", color: "rgba(15,12,8,0.5)" },
            }}
          >
            {spinning ? "Picking…" : result ? "Spin again" : "Spin"}
          </Button>
          {result && !spinning && (
            <Button
              onClick={spin}
              startIcon={<ShuffleIcon />}
              sx={{
                background: "transparent",
                border: `1px solid ${BORDER_AMBER}`,
                borderRadius: "8px",
                color: TEXT_DIM,
                fontFamily: FONT_SANS,
                fontSize: "15px",
                fontWeight: 500,
                padding: "12px 20px",
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": { background: "rgba(180,140,60,0.08)", color: "text.primary" },
              }}
            >
              Re-roll
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
