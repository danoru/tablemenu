import { gameColor, initials } from "@/lib/helpers";
import {
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  OLIVE,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_OLIVE,
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
  IconButton,
  Slide,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { RoomSuggestion } from "@pages/api/rooms/[code]";
import React from "react";
function weightedPick(suggestions: RoomSuggestion[]): RoomSuggestion {
  const weighted = suggestions.flatMap((s) => {
    const weight = Math.max(1, s.interestedCount - s.vetoCount + 1);
    return Array(weight).fill(s);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}
const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function RoomQuickGenModal({
  open,
  onClose,
  suggestions,
}: {
  open: boolean;
  onClose: () => void;
  suggestions: RoomSuggestion[];
}) {
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState<RoomSuggestion | null>(null);
  const pool = suggestions.filter((s) => s.bringing && s.vetoCount === 0);

  function spin() {
    if (pool.length === 0) return;
    setSpinning(true);
    setResult(null);
    let flashes = 0;
    const interval = setInterval(() => {
      setResult(pool[Math.floor(Math.random() * pool.length)]);
      if (++flashes >= 14) {
        clearInterval(interval);
        setResult(weightedPick(pool));
        setSpinning(false);
      }
    }, 80);
  }

  function handleClose() {
    setSpinning(false);
    setResult(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} TransitionComponent={SlideUp} fullWidth maxWidth="sm">
      <DialogContent sx={{ padding: "32px", position: "relative" }}>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "8px" }}
        >
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "24px",
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            Tonight's pick
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: TEXT_DIM }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT, mb: "32px" }}>
          Weighted by votes · {pool.length} game{pool.length !== 1 ? "s" : ""} in the pool
        </Typography>
        {pool.length === 0 ? (
          <Box sx={{ textAlign: "center", py: "32px" }}>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT }}>
              No games in the pool yet. Have members mark what they're bringing and cast votes
              first.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                mb: "28px",
              }}
            >
              {!result && !spinning && (
                <Typography
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "14px",
                    color: TEXT_FAINT,
                    fontStyle: "italic",
                  }}
                >
                  Hit spin when everyone's ready
                </Typography>
              )}
              {(result || spinning) && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "14px",
                    opacity: spinning ? 0.65 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  {result && (
                    <Box
                      sx={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "12px",
                        background: gameColor(result.name),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `2px solid ${INK}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: FONT_SERIF,
                          fontSize: "28px",
                          fontWeight: 900,
                          color: "rgba(255,251,240,0.9)",
                          userSelect: "none",
                        }}
                      >
                        {initials(result.name)}
                      </Typography>
                    </Box>
                  )}
                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontSize: "28px",
                      fontWeight: 700,
                      color: spinning ? TEXT_DIM : BRICK,
                      textAlign: "center",
                      maxWidth: "340px",
                      lineHeight: 1.1,
                      transition: "color 0.15s",
                    }}
                  >
                    {result?.name}
                  </Typography>
                  {!spinning && result && (
                    <Box sx={{ display: "flex", gap: "8px" }}>
                      <Chip
                        label={`👍 ${result.interestedCount}`}
                        size="small"
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "12px",
                          fontWeight: 700,
                          background: TINT_OLIVE,
                          color: OLIVE,
                          border: `1.5px solid ${OLIVE}`,
                        }}
                      />
                      <Chip
                        label={`${result.minPlayers}–${result.maxPlayers}p`}
                        size="small"
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "12px",
                          fontWeight: 500,
                          background: "transparent",
                          color: TEXT_DIM,
                          border: "1.5px solid rgba(51,39,26,0.3)",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: "10px" }}>
              <Button
                fullWidth
                variant="contained"
                onClick={spin}
                disabled={spinning}
                startIcon={
                  spinning ? (
                    <CircularProgress size={16} sx={{ color: "inherit" }} />
                  ) : (
                    <CasinoIcon />
                  )
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
