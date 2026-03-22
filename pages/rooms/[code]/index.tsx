import { authOptions } from "@/lib/authOptions";
import type { RoomData, RoomMember, RoomSuggestion } from "@api/rooms/[code]/index";
import { MOCK_USER_LIBRARY } from "@data/mockGameData";
import CasinoIcon from "@mui/icons-material/Casino";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NightlifeIcon from "@mui/icons-material/Nightlife";
import SettingsIcon from "@mui/icons-material/Settings";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  OutlinedInput,
  Slide,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = "#e8c97a";
const GOLD_FADED = "rgba(232,201,122,0.35)";
const AMBER = "#c8962a";
const AMBER_HOVER = "#dba535";
const GREEN_BRIGHT = "#5ec97a";
const BG = "#0f0c08";
const BG_CARD = "#1a1610";
const BG_ELEVATED = "#221e14";
const BORDER = "rgba(180,140,60,0.15)";
const BORDER_MED = "rgba(180,140,60,0.28)";
const TEXT = "#f0e6cc";
const TEXT_DIM = "rgba(232,223,200,0.55)";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SERIF = "'Playfair Display', serif";
const FONT_SANS = "'DM Sans', sans-serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gameColour(name: string): string {
  const palette = [
    "rgba(34,85,48,0.5)",
    "rgba(100,60,20,0.5)",
    "rgba(60,40,80,0.5)",
    "rgba(20,60,90,0.5)",
    "rgba(90,30,30,0.5)",
    "rgba(40,70,60,0.5)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function initials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function avatarColour(name: string): string {
  const palette = [
    "rgba(34,85,48,0.6)",
    "rgba(100,60,20,0.6)",
    "rgba(60,40,80,0.6)",
    "rgba(20,60,90,0.6)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function weightedPick(suggestions: RoomSuggestion[]): RoomSuggestion {
  const weighted = suggestions.flatMap((s) => {
    const weight = Math.max(1, s.interestedCount - s.vetoCount + 1);
    return Array(weight).fill(s);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

// ─── Slide transition ─────────────────────────────────────────────────────────

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ─── Quick Gen Modal ──────────────────────────────────────────────────────────

function RoomQuickGenModal({
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
          border: `1px solid ${BORDER_MED}`,
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
            sx={{ fontFamily: FONT_SERIF, fontSize: "24px", fontWeight: 700, color: TEXT }}
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
                        background: gameColour(result.name),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1px solid ${BORDER_MED}`,
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
                          color: GREEN_BRIGHT,
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
                          border: `1px solid ${BORDER}`,
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
                    <CircularProgress size={16} sx={{ color: "#0f0c08" }} />
                  ) : (
                    <CasinoIcon />
                  )
                }
                sx={{
                  background: AMBER,
                  borderRadius: "8px",
                  color: "#0f0c08",
                  fontFamily: FONT_SANS,
                  fontSize: "15px",
                  fontWeight: 500,
                  padding: "12px",
                  textTransform: "none",
                  "&:hover": { background: AMBER_HOVER },
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
                    border: `1px solid ${BORDER_MED}`,
                    borderRadius: "8px",
                    color: TEXT_DIM,
                    fontFamily: FONT_SANS,
                    fontSize: "15px",
                    padding: "12px 20px",
                    textTransform: "none",
                    "&:hover": { background: "rgba(180,140,60,0.08)", color: TEXT },
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

// ─── Log Games Modal ──────────────────────────────────────────────────────────

function LogGamesModal({
  open,
  onClose,
  suggestions,
  members,
  code,
  onLogged,
}: {
  open: boolean;
  onClose: () => void;
  suggestions: RoomSuggestion[];
  members: RoomMember[];
  code: string;
  onLogged: () => void;
}) {
  const acceptedMembers = members.filter((m) => m.status === "ACCEPTED");

  const [selectedGame, setSelectedGame] = React.useState<RoomSuggestion | null>(null);
  const [selectedPlayers, setSelectedPlayers] = React.useState<number[]>(
    acceptedMembers.map((m) => m.userId)
  );
  const [winnerIds, setWinnerIds] = React.useState<number[]>([]);
  const [duration, setDuration] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  function handleClose() {
    setSelectedGame(null);
    setSelectedPlayers(acceptedMembers.map((m) => m.userId));
    setWinnerIds([]);
    setDuration("");
    setSubmitting(false);
    onClose();
  }

  function togglePlayer(userId: number) {
    setSelectedPlayers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
    setWinnerIds((prev) => prev.filter((id) => id !== userId));
  }

  function toggleWinner(userId: number) {
    setWinnerIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  async function handleLog() {
    if (!selectedGame) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rooms/${code}/session/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          games: [
            {
              gameId: selectedGame.gameId,
              durationMin: duration ? Number(duration) : null,
              playerIds: selectedPlayers,
              winnerIds,
            },
          ],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: "Game logged!", severity: "success" });
        setTimeout(() => {
          onLogged();
          handleClose();
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: data.error ?? "Failed to log game.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "Something went wrong.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
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
          border: `1px solid ${BORDER_MED}`,
          borderRadius: "14px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        },
      }}
    >
      <DialogContent sx={{ padding: "28px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "24px",
          }}
        >
          <Typography
            sx={{ fontFamily: FONT_SERIF, fontSize: "22px", fontWeight: 700, color: TEXT }}
          >
            Log a game
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: TEXT_DIM }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Game picker */}
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "11px",
            fontWeight: 500,
            color: TEXT_FAINT,
            letterSpacing: "1px",
            textTransform: "uppercase",
            mb: "10px",
          }}
        >
          Which game?
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", mb: "24px" }}>
          {suggestions.length === 0 ? (
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "13px",
                color: TEXT_FAINT,
                fontStyle: "italic",
              }}
            >
              No games in the pool yet.
            </Typography>
          ) : (
            suggestions.map((s) => (
              <Box
                key={s.gameId}
                onClick={() => setSelectedGame(s)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background:
                    selectedGame?.gameId === s.gameId
                      ? "rgba(200,150,42,0.15)"
                      : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedGame?.gameId === s.gameId ? AMBER : BORDER}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: BORDER_MED },
                }}
              >
                <Box
                  sx={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: gameColour(s.name),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "rgba(232,223,200,0.5)",
                      userSelect: "none",
                    }}
                  >
                    {initials(s.name)}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "14px",
                    fontWeight: 500,
                    color: selectedGame?.gameId === s.gameId ? TEXT : TEXT_DIM,
                    flex: 1,
                  }}
                >
                  {s.name}
                </Typography>
                {selectedGame?.gameId === s.gameId && (
                  <CheckCircleIcon sx={{ fontSize: "16px", color: AMBER }} />
                )}
              </Box>
            ))
          )}
        </Box>

        {/* Duration */}
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "11px",
            fontWeight: 500,
            color: TEXT_FAINT,
            letterSpacing: "1px",
            textTransform: "uppercase",
            mb: "10px",
          }}
        >
          How long? (minutes, optional)
        </Typography>
        <OutlinedInput
          value={duration}
          onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g. 75"
          inputProps={{ inputMode: "numeric" }}
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "14px",
            color: TEXT,
            mb: "24px",
            width: "140px",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER_MED },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: AMBER },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: AMBER,
              borderWidth: "1px",
            },
            "& input::placeholder": { color: TEXT_FAINT },
          }}
        />

        {/* Players */}
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "11px",
            fontWeight: 500,
            color: TEXT_FAINT,
            letterSpacing: "1px",
            textTransform: "uppercase",
            mb: "10px",
          }}
        >
          Who played?
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", mb: "24px" }}>
          {acceptedMembers.map((member) => (
            <Box
              key={member.userId}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "8px",
                background: selectedPlayers.includes(member.userId)
                  ? "rgba(255,255,255,0.04)"
                  : "transparent",
                border: `1px solid ${selectedPlayers.includes(member.userId) ? BORDER : "transparent"}`,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedPlayers.includes(member.userId)}
                    onChange={() => togglePlayer(member.userId)}
                    size="small"
                    sx={{
                      color: BORDER_MED,
                      "&.Mui-checked": { color: AMBER },
                      padding: "4px 8px",
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      color: selectedPlayers.includes(member.userId) ? TEXT : TEXT_DIM,
                    }}
                  >
                    {member.username}
                  </Typography>
                }
                sx={{ margin: 0 }}
              />
              {selectedPlayers.includes(member.userId) && (
                <Tooltip title="Mark as winner" placement="left">
                  <IconButton
                    onClick={() => toggleWinner(member.userId)}
                    size="small"
                    sx={{
                      color: winnerIds.includes(member.userId) ? GOLD : TEXT_FAINT,
                      background: winnerIds.includes(member.userId)
                        ? "rgba(232,201,122,0.15)"
                        : "transparent",
                      border: `1px solid ${winnerIds.includes(member.userId) ? "rgba(232,201,122,0.3)" : "transparent"}`,
                      borderRadius: "6px",
                      "&:hover": { color: GOLD },
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: "15px" }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Box>

        <Button
          fullWidth
          onClick={handleLog}
          disabled={!selectedGame || submitting}
          sx={{
            background: AMBER,
            borderRadius: "8px",
            color: "#0f0c08",
            fontFamily: FONT_SANS,
            fontSize: "15px",
            fontWeight: 500,
            padding: "12px",
            textTransform: "none",
            "&:hover": { background: AMBER_HOVER },
            "&.Mui-disabled": { background: "rgba(200,150,42,0.35)", color: "rgba(15,12,8,0.5)" },
          }}
        >
          {submitting ? (
            <CircularProgress size={20} sx={{ color: "rgba(15,12,8,0.5)" }} />
          ) : (
            "Log game"
          )}
        </Button>
      </DialogContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ fontFamily: FONT_SANS }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

// ─── Suggestion row ───────────────────────────────────────────────────────────

function SuggestionRow({
  suggestion,
  isHost,
  currentUserId,
  onVote,
  onToggleBring,
  loadingGameId,
}: {
  suggestion: RoomSuggestion;
  isHost: boolean;
  currentUserId: number;
  onVote: (gameId: number, interested: boolean) => void;
  onToggleBring: (gameId: number) => void;
  loadingGameId: number | null;
}) {
  const isBringing = suggestion.suggestedBy === currentUserId;
  const isLoading = loadingGameId === suggestion.gameId;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 18px",
        borderRadius: "10px",
        background: suggestion.bringing ? "rgba(34,85,48,0.1)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${suggestion.bringing ? "rgba(60,160,80,0.2)" : BORDER}`,
        transition: "all 0.15s",
        mb: "8px",
      }}
    >
      <Box
        sx={{
          width: "44px",
          height: "44px",
          borderRadius: "8px",
          background: gameColour(suggestion.name),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontFamily: FONT_SERIF,
            fontSize: "14px",
            fontWeight: 700,
            color: "rgba(232,223,200,0.5)",
            userSelect: "none",
          }}
        >
          {initials(suggestion.name)}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "14px",
            fontWeight: 500,
            color: TEXT,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {suggestion.name}
        </Typography>
        <Box sx={{ display: "flex", gap: "8px", mt: "3px", alignItems: "center" }}>
          {suggestion.bringing && (
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: GREEN_BRIGHT }}>
              ✓ In the pool
            </Typography>
          )}
          <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}>
            {suggestion.minPlayers}–{suggestion.maxPlayers}p
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            background: "rgba(94,201,122,0.1)",
            border: "1px solid rgba(94,201,122,0.18)",
            borderRadius: "6px",
            padding: "3px 8px",
          }}
        >
          <ThumbUpIcon sx={{ fontSize: "11px", color: GREEN_BRIGHT }} />
          <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: GREEN_BRIGHT }}>
            {suggestion.interestedCount}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            background: "rgba(220,80,80,0.08)",
            border: "1px solid rgba(220,80,80,0.15)",
            borderRadius: "6px",
            padding: "3px 8px",
          }}
        >
          <ThumbDownIcon sx={{ fontSize: "11px", color: "rgba(220,120,120,0.8)" }} />
          <Typography
            sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: "rgba(220,120,120,0.8)" }}
          >
            {suggestion.vetoCount}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        <Tooltip title={isBringing ? "Remove from tonight" : "I'm bringing this"} placement="top">
          <IconButton
            onClick={() => onToggleBring(suggestion.gameId)}
            disabled={isLoading}
            size="small"
            sx={{
              background: isBringing ? "rgba(34,85,48,0.3)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${isBringing ? "rgba(60,160,80,0.3)" : BORDER}`,
              borderRadius: "7px",
              color: isBringing ? GREEN_BRIGHT : TEXT_FAINT,
              "&:hover": {
                background: isBringing ? "rgba(34,85,48,0.5)" : "rgba(255,255,255,0.08)",
              },
            }}
          >
            <DirectionsWalkIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="I want to play this" placement="top">
          <IconButton
            onClick={() => onVote(suggestion.gameId, true)}
            disabled={isLoading}
            size="small"
            sx={{
              background:
                suggestion.myVote === true ? "rgba(94,201,122,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${suggestion.myVote === true ? "rgba(94,201,122,0.3)" : BORDER}`,
              borderRadius: "7px",
              color: suggestion.myVote === true ? GREEN_BRIGHT : TEXT_FAINT,
              "&:hover": { background: "rgba(94,201,122,0.15)" },
            }}
          >
            <ThumbUpIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="I'd rather not play this" placement="top">
          <IconButton
            onClick={() => onVote(suggestion.gameId, false)}
            disabled={isLoading}
            size="small"
            sx={{
              background:
                suggestion.myVote === false ? "rgba(220,80,80,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${suggestion.myVote === false ? "rgba(220,80,80,0.25)" : BORDER}`,
              borderRadius: "7px",
              color: suggestion.myVote === false ? "rgba(220,120,120,0.9)" : TEXT_FAINT,
              "&:hover": { background: "rgba(220,80,80,0.1)" },
            }}
          >
            <ThumbDownIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  initialRoom: RoomData;
  currentUserId: number;
  username: string;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RoomPage({ initialRoom, currentUserId, username }: Props) {
  const router = useRouter();
  const { code } = router.query as { code: string };

  const [room, setRoom] = React.useState<RoomData>(initialRoom);
  const [quickGenOpen, setQuickGenOpen] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);
  const [loadingGameId, setLoadingGameId] = React.useState<number | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [activeSessionId, setActiveSessionId] = React.useState<number | null>(
    initialRoom.activeSessionId ?? null
  );
  const [sessionLoading, setSessionLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const isHost = room.hostId === currentUserId;

  // ── Polling ────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${code}`);
        const data = await res.json();
        if (res.ok && data.room) setRoom(data.room);
      } catch {
        /* silent */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [code]);

  function handleCopyCode() {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const suggestedGameIds = new Set(room.suggestions.map((s) => s.gameId));
  const myLibrary = MOCK_USER_LIBRARY.filter((g) => !suggestedGameIds.has(g.id));

  async function handleToggleBring(gameId: number) {
    setLoadingGameId(gameId);
    try {
      const res = await fetch(`/api/rooms/${code}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "bring", gameId }),
      });
      if (res.ok) {
        const data = await (await fetch(`/api/rooms/${code}`)).json();
        if (data.room) setRoom(data.room);
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to update.", severity: "error" });
    } finally {
      setLoadingGameId(null);
    }
  }

  async function handleVote(gameId: number, interested: boolean) {
    setLoadingGameId(gameId);
    try {
      const res = await fetch(`/api/rooms/${code}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "vote", gameId, interested }),
      });
      if (res.ok) {
        const data = await (await fetch(`/api/rooms/${code}`)).json();
        if (data.room) setRoom(data.room);
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to record vote.", severity: "error" });
    } finally {
      setLoadingGameId(null);
    }
  }

  async function handleAddFromLibrary(gameId: number) {
    setLoadingGameId(gameId);
    try {
      const res = await fetch(`/api/rooms/${code}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "bring", gameId }),
      });
      if (res.ok) {
        const data = await (await fetch(`/api/rooms/${code}`)).json();
        if (data.room) setRoom(data.room);
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to add game.", severity: "error" });
    } finally {
      setLoadingGameId(null);
    }
  }

  async function handleOpenSession() {
    setSessionLoading(true);
    try {
      const res = await fetch(`/api/rooms/${code}/session/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerCount: room.playerCount }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSessionId(data.sessionId);
        setSnackbar({ open: true, message: "Tonight's session is open!", severity: "success" });
      } else {
        setSnackbar({
          open: true,
          message: data.error ?? "Failed to open session.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "Something went wrong.", severity: "error" });
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleCloseSession() {
    setSessionLoading(true);
    try {
      const res = await fetch(`/api/rooms/${code}/session/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearSession: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSessionId(null);
        setSnackbar({ open: true, message: "Session closed. Good night!", severity: "success" });
        const pollData = await (await fetch(`/api/rooms/${code}`)).json();
        if (pollData.room) setRoom(pollData.room);
      } else {
        setSnackbar({
          open: true,
          message: data.error ?? "Failed to close session.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "Something went wrong.", severity: "error" });
    } finally {
      setSessionLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>{room.name} — Tablekeeper</title>
      </Head>

      <Box sx={{ background: BG, minHeight: "100vh", position: "relative" }}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "40vh",
            background:
              "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(34,85,48,0.16) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1000px",
            margin: "0 auto",
            padding: { xs: "24px 16px", md: "40px 32px" },
          }}
        >
          {/* ── Room header ───────────────────────────────────────────────── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: "16px",
              mb: "28px",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: { xs: "28px", md: "36px" },
                  fontWeight: 900,
                  color: TEXT,
                  lineHeight: 1.05,
                  letterSpacing: "-0.5px",
                }}
              >
                {room.name}
              </Typography>
              {room.description && (
                <Typography
                  sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_DIM, mt: "4px" }}
                >
                  {room.description}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: "12px", mt: "8px", flexWrap: "wrap" }}>
                {room.playerCount && (
                  <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}>
                    {room.playerCount} players
                  </Typography>
                )}
                {room.timeBudget && (
                  <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}>
                    {room.timeBudget >= 240
                      ? "4+ hrs"
                      : `${Math.floor(room.timeBudget / 60)}hr${room.timeBudget % 60 > 0 ? ` ${room.timeBudget % 60}min` : ""}`}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}>
              <Box
                onClick={handleCopyCode}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(180,110,30,0.15)",
                  border: "1px solid rgba(180,140,60,0.3)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  cursor: "pointer",
                  "&:hover": { background: "rgba(180,110,30,0.25)" },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: GOLD,
                    letterSpacing: "3px",
                  }}
                >
                  {room.code}
                </Typography>
                {copied ? (
                  <CheckIcon sx={{ fontSize: "14px", color: GREEN_BRIGHT }} />
                ) : (
                  <ContentCopyIcon sx={{ fontSize: "14px", color: GOLD_FADED }} />
                )}
              </Box>
              <Button
                onClick={() => setQuickGenOpen(true)}
                startIcon={<CasinoIcon />}
                sx={{
                  background: AMBER,
                  borderRadius: "8px",
                  color: "#0f0c08",
                  fontFamily: FONT_SANS,
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "9px 18px",
                  textTransform: "none",
                  "&:hover": { background: AMBER_HOVER },
                }}
              >
                Spin
              </Button>
              {isHost && (
                <Button
                  onClick={() => router.push(`/rooms/${code}/settings`)}
                  startIcon={<SettingsIcon sx={{ fontSize: "16px !important" }} />}
                  sx={{
                    background: "transparent",
                    border: `1px solid ${BORDER_MED}`,
                    borderRadius: "8px",
                    color: TEXT_DIM,
                    fontFamily: FONT_SANS,
                    fontSize: "14px",
                    fontWeight: 500,
                    padding: "9px 14px",
                    textTransform: "none",
                    "&:hover": {
                      background: "rgba(180,140,60,0.08)",
                      color: TEXT,
                      borderColor: AMBER,
                    },
                  }}
                >
                  Settings
                </Button>
              )}
            </Box>
          </Box>

          {/* ── Session banner ────────────────────────────────────────────── */}
          {isHost && (
            <Box
              sx={{
                background: activeSessionId ? "rgba(34,85,48,0.18)" : "rgba(180,110,30,0.1)",
                border: `1px solid ${activeSessionId ? "rgba(60,160,80,0.3)" : "rgba(180,140,60,0.2)"}`,
                borderRadius: "12px",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                mb: "24px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {activeSessionId ? (
                  <>
                    <Box
                      sx={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: GREEN_BRIGHT,
                        "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
                        animation: "pulse 2s infinite",
                      }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "14px",
                          fontWeight: 500,
                          color: TEXT,
                        }}
                      >
                        Session is live
                      </Typography>
                      <Typography
                        sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}
                      >
                        Log games and close when you're done for the night.
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <NightlifeIcon sx={{ color: TEXT_FAINT, fontSize: "20px" }} />
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "14px",
                          fontWeight: 500,
                          color: TEXT,
                        }}
                      >
                        Ready to play?
                      </Typography>
                      <Typography
                        sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}
                      >
                        Open tonight's session to start tracking this game night.
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {activeSessionId ? (
                  <>
                    <Button
                      onClick={() => setLogOpen(true)}
                      startIcon={<EmojiEventsIcon />}
                      sx={{
                        background: "rgba(34,85,48,0.3)",
                        border: "1px solid rgba(60,160,80,0.35)",
                        borderRadius: "8px",
                        color: GREEN_BRIGHT,
                        fontFamily: FONT_SANS,
                        fontSize: "13px",
                        fontWeight: 500,
                        padding: "8px 16px",
                        textTransform: "none",
                        "&:hover": { background: "rgba(34,85,48,0.5)" },
                      }}
                    >
                      Log games
                    </Button>
                    <Button
                      onClick={handleCloseSession}
                      disabled={sessionLoading}
                      startIcon={<CheckCircleIcon />}
                      sx={{
                        background: "transparent",
                        border: `1px solid ${BORDER_MED}`,
                        borderRadius: "8px",
                        color: TEXT_DIM,
                        fontFamily: FONT_SANS,
                        fontSize: "13px",
                        fontWeight: 500,
                        padding: "8px 16px",
                        textTransform: "none",
                        "&:hover": {
                          background: "rgba(180,140,60,0.08)",
                          color: TEXT,
                          borderColor: AMBER,
                        },
                      }}
                    >
                      {sessionLoading ? (
                        <CircularProgress size={14} sx={{ color: "inherit" }} />
                      ) : (
                        "Close session"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleOpenSession}
                    disabled={sessionLoading}
                    startIcon={
                      sessionLoading ? (
                        <CircularProgress size={14} sx={{ color: "#0f0c08" }} />
                      ) : (
                        <NightlifeIcon />
                      )
                    }
                    sx={{
                      background: AMBER,
                      borderRadius: "8px",
                      color: "#0f0c08",
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 500,
                      padding: "8px 18px",
                      textTransform: "none",
                      "&:hover": { background: AMBER_HOVER },
                      "&.Mui-disabled": {
                        background: "rgba(200,150,42,0.35)",
                        color: "rgba(15,12,8,0.5)",
                      },
                    }}
                  >
                    Open tonight
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* ── Two column layout ─────────────────────────────────────────── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
              gap: "24px",
            }}
          >
            {/* ── Left: game pool ───────────────────────────────────────── */}
            <Box>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: TEXT,
                  mb: "16px",
                }}
              >
                Game pool
              </Typography>

              {room.suggestions.length === 0 ? (
                <Box
                  sx={{
                    background: BG_CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "12px",
                    padding: "40px 24px",
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT }}>
                    No games added yet. Add games from your library below.
                  </Typography>
                </Box>
              ) : (
                room.suggestions.map((s) => (
                  <SuggestionRow
                    key={s.gameId}
                    suggestion={s}
                    isHost={isHost}
                    currentUserId={currentUserId}
                    onVote={handleVote}
                    onToggleBring={handleToggleBring}
                    loadingGameId={loadingGameId}
                  />
                ))
              )}

              {myLibrary.length > 0 && (
                <Box sx={{ mt: "28px" }}>
                  <Divider sx={{ borderColor: BORDER, mb: "20px" }} />
                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontSize: "18px",
                      fontWeight: 700,
                      color: TEXT,
                      mb: "14px",
                    }}
                  >
                    Add from my library
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {myLibrary.map((game) => (
                      <Box
                        key={game.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.02)",
                          border: `1px solid ${BORDER}`,
                          "&:hover": {
                            background: "rgba(180,140,60,0.05)",
                            borderColor: BORDER_MED,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            background: gameColour(game.name),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: FONT_SERIF,
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "rgba(232,223,200,0.5)",
                              userSelect: "none",
                            }}
                          >
                            {initials(game.name)}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: FONT_SANS,
                            fontSize: "14px",
                            fontWeight: 500,
                            color: TEXT,
                            flex: 1,
                          }}
                        >
                          {game.name}
                        </Typography>
                        <Button
                          onClick={() => handleAddFromLibrary(game.id)}
                          disabled={loadingGameId === game.id}
                          size="small"
                          sx={{
                            background: "rgba(180,110,30,0.15)",
                            border: "1px solid rgba(180,140,60,0.25)",
                            borderRadius: "6px",
                            color: GOLD_FADED,
                            fontFamily: FONT_SANS,
                            fontSize: "12px",
                            fontWeight: 500,
                            padding: "4px 12px",
                            textTransform: "none",
                            "&:hover": { background: "rgba(180,110,30,0.3)", color: GOLD },
                          }}
                        >
                          {loadingGameId === game.id ? <CircularProgress size={12} /> : "Bring"}
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* ── Right: members ────────────────────────────────────────── */}
            <Box>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: TEXT,
                  mb: "16px",
                }}
              >
                At the table
              </Typography>
              <Box
                sx={{
                  background: BG_CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  mb: "16px",
                }}
              >
                {room.members
                  .filter((m) => m.status === "ACCEPTED")
                  .map((member, i, arr) => (
                    <Box key={member.userId}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                        }}
                      >
                        <Box
                          sx={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background: avatarColour(member.username),
                            border: `1px solid ${BORDER}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: FONT_SERIF,
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "rgba(232,223,200,0.6)",
                              userSelect: "none",
                            }}
                          >
                            {member.username.slice(0, 1).toUpperCase()}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: FONT_SANS,
                            fontSize: "14px",
                            fontWeight: 500,
                            color: TEXT,
                            flex: 1,
                          }}
                        >
                          {member.username}
                          {member.userId === room.hostId && (
                            <Box
                              component="span"
                              sx={{
                                ml: "8px",
                                fontFamily: FONT_SANS,
                                fontSize: "10px",
                                fontWeight: 500,
                                letterSpacing: "0.8px",
                                textTransform: "uppercase",
                                color: AMBER,
                                background: "rgba(200,150,42,0.15)",
                                border: "1px solid rgba(200,150,42,0.2)",
                                padding: "2px 7px",
                                borderRadius: "10px",
                                verticalAlign: "middle",
                              }}
                            >
                              Host
                            </Box>
                          )}
                        </Typography>
                      </Box>
                      {i < arr.length - 1 && <Divider sx={{ borderColor: BORDER }} />}
                    </Box>
                  ))}
              </Box>

              <Box
                sx={{
                  background: "rgba(180,110,30,0.08)",
                  border: "1px solid rgba(180,140,60,0.18)",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "12px",
                    fontWeight: 500,
                    color: TEXT_DIM,
                    mb: "4px",
                  }}
                >
                  Invite others
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "12px",
                    color: TEXT_FAINT,
                    lineHeight: 1.6,
                  }}
                >
                  Share the room code{" "}
                  <Box
                    component="span"
                    sx={{
                      fontFamily: FONT_SANS,
                      fontWeight: 700,
                      color: GOLD,
                      letterSpacing: "2px",
                    }}
                  >
                    {room.code}
                  </Box>{" "}
                  or copy the link below.
                </Typography>
                <Button
                  fullWidth
                  onClick={handleCopyCode}
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                  sx={{
                    mt: "10px",
                    background: "transparent",
                    border: `1px solid ${BORDER_MED}`,
                    borderRadius: "7px",
                    color: TEXT_DIM,
                    fontFamily: FONT_SANS,
                    fontSize: "12px",
                    fontWeight: 500,
                    padding: "7px",
                    textTransform: "none",
                    "&:hover": { background: "rgba(180,140,60,0.08)", color: TEXT },
                  }}
                >
                  {copied ? "Copied!" : "Copy room code"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <RoomQuickGenModal
        open={quickGenOpen}
        onClose={() => setQuickGenOpen(false)}
        suggestions={room.suggestions}
      />

      <LogGamesModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        suggestions={room.suggestions}
        members={room.members}
        code={code}
        onLogged={() => setLogOpen(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ fontFamily: FONT_SANS }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

// ─── Server-side props ────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { code } = context.params as { code: string };
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user)
    return { redirect: { destination: `/login?next=/rooms/${code}`, permanent: false } };

  const currentUserId = Number((session.user as any).id);
  const username = (session.user as any).username ?? "";

  const { default: prisma } = await import("@data/db");

  const queryArgs = {
    where: { code: code.toUpperCase() },
    include: {
      host: { select: { id: true, username: true } },
      invites: { include: { user: { select: { id: true, username: true } } } },
      gameSuggs: { include: { game: true } },
      votes: true,
      sessions: { where: { status: "ACTIVE" as const }, select: { id: true }, take: 1 },
    },
  } as const;

  let room = await prisma.rooms.findUnique(queryArgs);
  if (!room) return { notFound: true };

  const isMember = room.invites.some((inv) => inv.userId === currentUserId);
  if (!isMember) {
    await prisma.roomInvites.create({
      data: { roomId: room.id, userId: currentUserId, status: "ACCEPTED" },
    });
    room = await prisma.rooms.findUnique(queryArgs);
    if (!room) return { notFound: true };
  }

  return { props: { initialRoom: buildRoomData(room, currentUserId), currentUserId, username } };
};

// ─── Room data builder ────────────────────────────────────────────────────────

function buildRoomData(room: any, currentUserId: number): RoomData {
  const members = room.invites.map((inv: any) => ({
    userId: inv.user.id,
    username: inv.user.username,
    status: inv.status,
  }));

  const suggestions = room.gameSuggs.map((sugg: any) => {
    const gameVotes = room.votes.filter((v: any) => v.gameId === sugg.gameId);
    const interestedCount = gameVotes.filter((v: any) => v.interested).length;
    const vetoCount = gameVotes.filter((v: any) => !v.interested).length;
    const myVoteRecord = gameVotes.find((v: any) => v.userId === currentUserId);
    return {
      gameId: sugg.game.id,
      name: sugg.game.name,
      imageUrl: sugg.game.imageUrl,
      minPlayers: sugg.game.minPlayers,
      maxPlayers: sugg.game.maxPlayers,
      minPlaytime: sugg.game.minPlaytime,
      maxPlaytime: sugg.game.maxPlaytime,
      suggestedBy: sugg.suggestedBy,
      interestedCount,
      vetoCount,
      myVote: myVoteRecord ? myVoteRecord.interested : null,
      bringing: sugg.suggestedBy !== null,
    };
  });

  return {
    id: room.id,
    code: room.code,
    name: room.name,
    description: room.description,
    playerCount: room.playerCount,
    timeBudget: room.timeBudget,
    isActive: room.isActive,
    hostId: room.host.id,
    hostUsername: room.host.username,
    activeSessionId: room.sessions?.[0]?.id ?? null,
    members,
    suggestions,
  };
}
