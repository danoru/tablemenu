import { authOptions } from "@api/auth/[...nextauth]";
import type { RoomData, RoomSuggestion } from "@api/rooms/[code]/index";
import { MOCK_USER_LIBRARY } from "@data/mockGameData";
import CasinoIcon from "@mui/icons-material/Casino";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
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

// Weighted pick — games with more "interested" votes are more likely to be picked
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

// ─── Quick Gen modal (room-aware) ─────────────────────────────────────────────

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

  // Only use games that at least one person is bringing
  const pool = suggestions.filter((s) => s.bringing && s.vetoCount === 0);

  function spin() {
    if (pool.length === 0) return;
    setSpinning(true);
    setResult(null);

    let flashes = 0;
    const interval = setInterval(() => {
      setResult(pool[Math.floor(Math.random() * pool.length)]);
      flashes++;
      if (flashes >= 14) {
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

        {pool.length === 0 && (
          <Box sx={{ textAlign: "center", py: "32px" }}>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT }}>
              No games in the pool yet. Have members mark what they're bringing and cast votes
              first.
            </Typography>
          </Box>
        )}

        {pool.length > 0 && (
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

// ─── Game suggestion row ──────────────────────────────────────────────────────

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
      {/* Art */}
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

      {/* Name + meta */}
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

      {/* Vote counts */}
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

      {/* Actions */}
      <Box sx={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        {/* Bring toggle */}
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

        {/* Vote interested */}
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

        {/* Vote veto */}
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
  const [loadingGameId, setLoadingGameId] = React.useState<number | null>(null);
  const [copied, setCopied] = React.useState(false);
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
        /* silent — stale data is fine */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [code]);

  // ── Copy room code ─────────────────────────────────────────────────────────
  function handleCopyCode() {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Library games not yet in room ─────────────────────────────────────────
  const suggestedGameIds = new Set(room.suggestions.map((s) => s.gameId));
  const myLibrary = MOCK_USER_LIBRARY.filter((g) => !suggestedGameIds.has(g.id));

  // ── Toggle bring ──────────────────────────────────────────────────────────
  async function handleToggleBring(gameId: number) {
    setLoadingGameId(gameId);
    try {
      const res = await fetch(`/api/rooms/${code}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "bring", gameId }),
      });
      if (res.ok) {
        // Optimistic refresh
        const poll = await fetch(`/api/rooms/${code}`);
        const data = await poll.json();
        if (data.room) setRoom(data.room);
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to update.", severity: "error" });
    } finally {
      setLoadingGameId(null);
    }
  }

  // ── Vote ──────────────────────────────────────────────────────────────────
  async function handleVote(gameId: number, interested: boolean) {
    setLoadingGameId(gameId);
    try {
      const res = await fetch(`/api/rooms/${code}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "vote", gameId, interested }),
      });
      if (res.ok) {
        const poll = await fetch(`/api/rooms/${code}`);
        const data = await poll.json();
        if (data.room) setRoom(data.room);
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to record vote.", severity: "error" });
    } finally {
      setLoadingGameId(null);
    }
  }

  // ── Add game from library ─────────────────────────────────────────────────
  async function handleAddFromLibrary(gameId: number) {
    setLoadingGameId(gameId);
    try {
      const res = await fetch(`/api/rooms/${code}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "bring", gameId }),
      });
      if (res.ok) {
        const poll = await fetch(`/api/rooms/${code}`);
        const data = await poll.json();
        if (data.room) setRoom(data.room);
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to add game.", severity: "error" });
    } finally {
      setLoadingGameId(null);
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
          {/* ── Room header ──────────────────────────────────────────────── */}
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
              {/* Room code */}
              <Box
                onClick={handleCopyCode}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(180,110,30,0.15)",
                  border: `1px solid rgba(180,140,60,0.3)`,
                  borderRadius: "8px",
                  padding: "8px 14px",
                  cursor: "pointer",
                  transition: "all 0.15s",
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
            </Box>
          </Box>

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

              {/* Add from my library */}
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
                            border: `1px solid rgba(180,140,60,0.25)`,
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

              {/* Join instructions */}
              <Box
                sx={{
                  background: "rgba(180,110,30,0.08)",
                  border: `1px solid rgba(180,140,60,0.18)`,
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

      <RoomQuickGenModal
        open={quickGenOpen}
        onClose={() => setQuickGenOpen(false)}
        suggestions={room.suggestions}
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

  if (!session?.user) {
    return { redirect: { destination: `/login?next=/rooms/${code}`, permanent: false } };
  }

  const currentUserId = Number((session.user as any).id);
  const username = (session.user as any).username ?? "";

  const { default: prisma } = await import("@data/db");

  const room = await prisma.rooms.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      host: { select: { id: true, username: true } },
      invites: { include: { user: { select: { id: true, username: true } } } },
      gameSuggs: { include: { game: true } },
      votes: true,
    },
  });

  if (!room) return { notFound: true };

  // Auto-join if authenticated user isn't already a member
  const isMember = room.invites.some((inv) => inv.userId === currentUserId);
  if (!isMember) {
    await prisma.roomInvites.create({
      data: { roomId: room.id, userId: currentUserId, status: "ACCEPTED" },
    });
    // Refresh after join
    const updated = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        host: { select: { id: true, username: true } },
        invites: { include: { user: { select: { id: true, username: true } } } },
        gameSuggs: { include: { game: true } },
        votes: true,
      },
    });
    if (updated) {
      const initialRoom = buildRoomData(updated, currentUserId);
      return { props: { initialRoom, currentUserId, username } };
    }
  }

  const initialRoom = buildRoomData(room, currentUserId);
  return { props: { initialRoom, currentUserId, username } };
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
    members,
    suggestions,
  };
}
