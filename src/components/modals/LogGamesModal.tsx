import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  OutlinedInput,
  Slide,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { RoomMember, RoomSuggestion } from "@pages/api/rooms/[code]";
import React from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = "#e8c97a";
const AMBER = "#c8962a";
const AMBER_HOVER = "#dba535";
const BG_ELEVATED = "#221e14";
const BORDER = "rgba(180,140,60,0.15)";
const BORDER_MED = "rgba(180,140,60,0.28)";
const TEXT = "#f0e6cc";
const TEXT_DIM = "rgba(232,223,200,0.55)";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SERIF = "'Playfair Display', serif";
const FONT_SANS = "'DM Sans', sans-serif";

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

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function LogGamesModal({
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
