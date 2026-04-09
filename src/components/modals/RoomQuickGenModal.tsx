import { gameColor, initials } from "@/lib/helpers";
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
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
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
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,85,48,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
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
                        border: `1px solid ${BORDER_AMBER}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: FONT_SERIF,
                          fontSize: "28px",
                          fontWeight: 700,
                          color: "rgba(232,223,200,0.5)",
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
                      color: spinning ? TEXT_DIM : GOLD,
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
                          background: "rgba(94,201,122,0.15)",
                          color: "secondary.light",
                          border: "1px solid rgba(94,201,122,0.2)",
                        }}
                      />
                      <Chip
                        label={`${result.minPlayers}–${result.maxPlayers}p`}
                        size="small"
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "12px",
                          background: "rgba(255,255,255,0.05)",
                          color: TEXT_DIM,
                          border: "1px solid",
                          borderColor: "divider",
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
                  "&.Mui-disabled": {
                    background: "rgba(200,150,42,0.35)",
                    color: "rgba(15,12,8,0.5)",
                  },
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
                    padding: "12px 20px",
                    textTransform: "none",
                    "&:hover": { background: "rgba(180,140,60,0.08)", color: "text.primary" },
                  }}
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
