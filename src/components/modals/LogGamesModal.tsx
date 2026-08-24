import { gameColor, initials } from "@/lib/helpers";
import {
  FONT_SANS,
  FONT_SERIF,
  INK,
  MUSTARD_DARK,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_MUSTARD,
} from "@/styles/theme";
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
import type { LibraryGame } from "@pages/api/games/library";
import { RoomMember, RoomSuggestion } from "@pages/api/rooms/[code]";
import React from "react";

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/** A game the host can log: the room pool plus their own library. */
interface LoggableGame {
  gameId: number;
  name: string;
  inPool: boolean;
}

export default function LogGamesModal({
  open,
  onClose,
  suggestions,
  library,
  members,
  presentMemberIds,
  code,
  isCompetitive,
  onLogged,
}: {
  open: boolean;
  onClose: () => void;
  suggestions: RoomSuggestion[];
  /** The host's library, so an unplanned game can still be logged. */
  library: LibraryGame[];
  members: RoomMember[];
  /** Members present tonight — the default player selection. Undefined → all. */
  presentMemberIds?: number[];
  code: string;
  isCompetitive: boolean;
  onLogged: () => void;
}) {
  const acceptedMembers = members.filter((m) => m.status === "ACCEPTED");

  // Default to the members marked present tonight (attendance is soft — anyone
  // can still be hand-checked in the list below). Falls back to all members.
  //
  // Held in a ref, not a useCallback: the room page rebuilds `members` and
  // `presentMemberIds` on every 5s poll, so a callback identity that tracked
  // them would re-fire the reset effect below mid-edit and wipe the host's
  // ticked players and winners. The effect keys off `open` alone; this ref
  // makes sure it still reads the freshest roster when it does run.
  const defaultPlayerIdsRef = React.useRef<() => number[]>(() => []);
  defaultPlayerIdsRef.current = () => {
    const present = presentMemberIds ? new Set(presentMemberIds) : null;
    return members
      .filter((m) => m.status === "ACCEPTED")
      .filter((m) => !present || present.has(m.userId))
      .map((m) => m.userId);
  };
  const defaultPlayerIds = () => defaultPlayerIdsRef.current();

  const [gameQuery, setGameQuery] = React.useState("");
  const [selectedGame, setSelectedGame] = React.useState<LoggableGame | null>(null);

  // The pool first (that was the plan), then anything else in the host's
  // library, so an unplanned game can still be recorded.
  const gameOptions: LoggableGame[] = React.useMemo(() => {
    const pooled = new Set(suggestions.map((s) => s.gameId));
    const combined: LoggableGame[] = [
      ...suggestions.map((s) => ({ gameId: s.gameId, name: s.name, inPool: true })),
      ...library
        .filter((g) => !pooled.has(g.gameId))
        .map((g) => ({ gameId: g.gameId, name: g.name, inPool: false })),
    ];
    const q = gameQuery.trim().toLowerCase();
    return q ? combined.filter((g) => g.name.toLowerCase().includes(q)) : combined;
  }, [suggestions, library, gameQuery]);
  const [selectedPlayers, setSelectedPlayers] = React.useState<number[]>(defaultPlayerIds());
  const [winnerIds, setWinnerIds] = React.useState<number[]>([]);
  const [duration, setDuration] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // The members/attendance props refresh while the dialog is closed (the room
  // page polls) — recompute the default selection each time it opens. Depends
  // on `open` only, so a poll landing mid-edit can't reset the form.
  React.useEffect(() => {
    if (open) {
      setSelectedPlayers(defaultPlayerIdsRef.current());
      setWinnerIds([]);
    }
  }, [open]);

  function handleClose() {
    setSelectedGame(null);
    setGameQuery("");
    setSelectedPlayers(defaultPlayerIds());
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
    if (!selectedGame || selectedPlayers.length === 0) return;
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
        // Stay disabled until the dialog closes — re-enabling during this
        // window allowed double-logging the same game.
        closeTimer.current = setTimeout(() => {
          onLogged();
          handleClose();
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: data.error ?? "Failed to log game.",
          severity: "error",
        });
        setSubmitting(false);
      }
    } catch {
      setSnackbar({ open: true, message: "Something went wrong.", severity: "error" });
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} TransitionComponent={SlideUp} fullWidth maxWidth="sm">
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
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "22px",
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            Log a game
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: TEXT_DIM }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

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
        {/* Nights rarely stick to the plan — let the host log something that
            was never put on the table, not just what's in the pool. */}
        <OutlinedInput
          fullWidth
          value={gameQuery}
          onChange={(e) => setGameQuery(e.target.value)}
          placeholder="Search the pool or your library…"
          sx={{ fontFamily: FONT_SANS, fontSize: "14px", mb: "10px" }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            mb: "24px",
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          {gameOptions.length === 0 ? (
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "13px",
                color: TEXT_FAINT,
                fontStyle: "italic",
              }}
            >
              {gameQuery
                ? "No games match that search."
                : "No games in the pool or your library yet."}
            </Typography>
          ) : (
            gameOptions.map((s) => (
              <Box
                key={s.gameId}
                onClick={() => setSelectedGame(s)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: selectedGame?.gameId === s.gameId ? TINT_MUSTARD : "transparent",
                  border: `2px solid ${selectedGame?.gameId === s.gameId ? INK : "rgba(51,39,26,0.2)"}`,
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                  "&:hover": { borderColor: INK },
                }}
              >
                <Box
                  sx={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: gameColor(s.name),
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
                      fontWeight: 900,
                      color: "rgba(255,251,240,0.9)",
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
                    color: selectedGame?.gameId === s.gameId ? "text.primary" : TEXT_DIM,
                    flex: 1,
                  }}
                >
                  {s.name}
                </Typography>
                {!s.inPool && (
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.6px",
                      textTransform: "uppercase",
                      color: TEXT_FAINT,
                      flexShrink: 0,
                    }}
                  >
                    from library
                  </Typography>
                )}
                {selectedGame?.gameId === s.gameId && (
                  <CheckCircleIcon sx={{ fontSize: "16px", color: "primary.main" }} />
                )}
              </Box>
            ))
          )}
        </Box>

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
            color: "text.primary",
            mb: "24px",
            width: "140px",
          }}
        />

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
                  ? "rgba(51,39,26,0.05)"
                  : "transparent",
                border: `1px solid ${selectedPlayers.includes(member.userId) ? "rgba(51,39,26,0.18)" : "transparent"}`,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedPlayers.includes(member.userId)}
                    onChange={() => togglePlayer(member.userId)}
                    size="small"
                    sx={{
                      color: "rgba(51,39,26,0.4)",
                      "&.Mui-checked": { color: "primary.main" },
                      padding: "4px 8px",
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      color: selectedPlayers.includes(member.userId) ? "text.primary" : TEXT_DIM,
                    }}
                  >
                    {member.username}
                  </Typography>
                }
                sx={{ margin: 0 }}
              />
              {isCompetitive && selectedPlayers.includes(member.userId) && (
                <Tooltip title="Mark as winner" placement="left">
                  <IconButton
                    onClick={() => toggleWinner(member.userId)}
                    size="small"
                    sx={{
                      color: winnerIds.includes(member.userId) ? MUSTARD_DARK : TEXT_FAINT,
                      background: winnerIds.includes(member.userId) ? TINT_MUSTARD : "transparent",
                      border: `1.5px solid ${winnerIds.includes(member.userId) ? MUSTARD_DARK : "transparent"}`,
                      borderRadius: "8px",
                      "&:hover": { color: MUSTARD_DARK },
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
          variant="contained"
          onClick={handleLog}
          disabled={!selectedGame || selectedPlayers.length === 0 || submitting}
          sx={{ fontSize: "15px", padding: "10px" }}
        >
          {submitting ? <CircularProgress size={20} sx={{ color: "inherit" }} /> : "Log game"}
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
