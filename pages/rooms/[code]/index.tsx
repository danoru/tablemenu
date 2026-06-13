import LogGamesModal from "@/components/modals/LogGamesModal";
import RoomQuickGenModal from "@/components/modals/RoomQuickGenModal";
import RoomSuggestions from "@/components/rooms/RoomSuggestions";
import { getUserLibrary } from "@/data/games";
import { authOptions } from "@/lib/authOptions";
import { avatarColor, gameColor, initials } from "@/lib/helpers";
import {
  BORDER_INK,
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  OLIVE,
  SHADOW_HARD,
  SHADOW_HARD_LG,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_MUSTARD,
  TINT_OLIVE,
} from "@/styles/theme";
import Header from "@/components/layout/Header";
import type { RoomData } from "@api/rooms/[code]/index";
import CasinoIcon from "@mui/icons-material/Casino";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NightlifeIcon from "@mui/icons-material/Nightlife";
import SettingsIcon from "@mui/icons-material/Settings";
import { Alert, Box, Button, CircularProgress, Divider, Snackbar, Typography } from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import React from "react";

interface PreviewRoom {
  name: string;
  code: string;
  hostUsername: string;
  memberCount: number;
  suggestionCount: number;
}

type Props =
  | { preview: true; room: PreviewRoom }
  | {
      preview: false;
      initialRoom: RoomData;
      currentUserId: number;
      library: LibraryGame[];
      username: string;
    };

function RoomPreview({ room }: { room: PreviewRoom }) {
  const router = useRouter();
  const next = encodeURIComponent(`/rooms/${room.code}`);

  return (
    <>
      <Header
        title={`${room.name} — Tablekeeper`}
        description={`Game night hosted by ${room.hostUsername} · code ${room.code}. ${room.suggestionCount} ${room.suggestionCount === 1 ? "game" : "games"} on the table, ${room.memberCount} ${room.memberCount === 1 ? "player" : "players"} invited.`}
      />
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: { xs: "32px 16px", md: "48px 32px" },
        }}
      >
        <Box
          sx={{
            maxWidth: "480px",
            width: "100%",
            backgroundColor: "background.paper",
            border: BORDER_INK,
            borderRadius: "13px",
            boxShadow: SHADOW_HARD,
            padding: { xs: "32px 24px", md: "44px 36px" },
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "text.secondary",
              mb: "10px",
            }}
          >
            You're invited to
          </Typography>

          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: { xs: "30px", md: "36px" },
              fontWeight: 900,
              color: "text.primary",
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              mb: "12px",
            }}
          >
            {room.name}
          </Typography>

          <Typography sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_DIM, mb: "4px" }}>
            Hosted by {room.hostUsername}
          </Typography>

          <Typography
            sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT, mb: "28px" }}
          >
            {room.suggestionCount} {room.suggestionCount === 1 ? "game" : "games"} ·{" "}
            {room.memberCount} {room.memberCount === 1 ? "player" : "players"} invited · code{" "}
            {room.code}
          </Typography>

          <Button
            variant="contained"
            onClick={() => router.push(`/login?next=${next}`)}
            sx={{ fontSize: "14px", padding: "10px 22px", width: "100%", mb: "10px" }}
          >
            Sign in to join
          </Button>

          <Button
            variant="outlined"
            onClick={() => router.push(`/register?next=${next}`)}
            sx={{ fontSize: "14px", padding: "10px 22px", width: "100%" }}
          >
            Create an account
          </Button>
        </Box>
      </Box>
    </>
  );
}

interface AuthedRoomPageProps {
  initialRoom: RoomData;
  currentUserId: number;
  library: LibraryGame[];
  username: string;
}

export default function RoomPage(props: Props) {
  if (props.preview) {
    return <RoomPreview room={props.room} />;
  }
  return (
    <AuthenticatedRoomPage
      initialRoom={props.initialRoom}
      currentUserId={props.currentUserId}
      library={props.library}
      username={props.username}
    />
  );
}

function AuthenticatedRoomPage({
  initialRoom,
  currentUserId,
  library,
  username,
}: AuthedRoomPageProps) {
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

  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${code}`);
        const data = await res.json();
        if (res.ok && data.room) setRoom(data.room);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [code]);

  function handleCopyCode() {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const suggestedGameIds = new Set(room.suggestions.map((s) => s.gameId));
  const myLibrary = library.filter((g) => !suggestedGameIds.has(g.gameId));

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
      <Header
        title={`${room.name} — Tablekeeper`}
        description={`Game night hosted by ${room.hostUsername} · code ${room.code}. ${room.suggestions.length} ${room.suggestions.length === 1 ? "game" : "games"} on the table, ${room.members.length} ${room.members.length === 1 ? "player" : "players"} invited.`}
      />

      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Box
          sx={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: { xs: "24px 16px", md: "40px 32px" },
          }}
        >
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
                  color: "text.primary",
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
                  background: TINT_MUSTARD,
                  border: BORDER_INK,
                  borderRadius: "10px",
                  boxShadow: SHADOW_HARD,
                  padding: "8px 14px",
                  cursor: "pointer",
                  transition: "transform 0.12s ease, box-shadow 0.12s ease",
                  "&:hover": {
                    boxShadow: SHADOW_HARD_LG,
                    transform: "translate(-1px, -1px)",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: INK,
                    letterSpacing: "3px",
                  }}
                >
                  {room.code}
                </Typography>
                {copied ? (
                  <CheckIcon sx={{ fontSize: "14px", color: OLIVE }} />
                ) : (
                  <ContentCopyIcon sx={{ fontSize: "14px", color: "rgba(51,39,26,0.6)" }} />
                )}
              </Box>
              <Button
                startIcon={<CasinoIcon />}
                variant="contained"
                onClick={() => setQuickGenOpen(true)}
                sx={{ fontSize: "14px", padding: "9px 18px" }}
              >
                Spin
              </Button>
              {isHost && (
                <Button
                  startIcon={<SettingsIcon sx={{ fontSize: "16px !important" }} />}
                  variant="outlined"
                  onClick={() => router.push(`/rooms/${code}/settings`)}
                  sx={{ fontSize: "14px", padding: "9px 14px" }}
                >
                  Settings
                </Button>
              )}
            </Box>
          </Box>

          {isHost && (
            <Box
              sx={{
                backgroundColor: activeSessionId ? TINT_OLIVE : "background.paper",
                border: BORDER_INK,
                borderRadius: "13px",
                boxShadow: SHADOW_HARD,
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
                        backgroundColor: OLIVE,
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
                          color: "text.primary",
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
                          color: "text.primary",
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
                      color="secondary"
                      startIcon={<EmojiEventsIcon />}
                      variant="contained"
                      onClick={() => setLogOpen(true)}
                      sx={{ fontSize: "13px", padding: "8px 16px" }}
                    >
                      Log games
                    </Button>
                    <Button
                      disabled={sessionLoading}
                      startIcon={<CheckCircleIcon />}
                      variant="outlined"
                      onClick={handleCloseSession}
                      sx={{ fontSize: "13px", padding: "8px 16px" }}
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
                    disabled={sessionLoading}
                    variant="contained"
                    startIcon={
                      sessionLoading ? (
                        <CircularProgress size={14} sx={{ color: "inherit" }} />
                      ) : (
                        <NightlifeIcon />
                      )
                    }
                    onClick={handleOpenSession}
                    sx={{ fontSize: "13px", padding: "8px 18px" }}
                  >
                    Open tonight
                  </Button>
                )}
              </Box>
            </Box>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
              gap: "24px",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "text.primary",
                  mb: "16px",
                }}
              >
                Game pool
              </Typography>

              {room.suggestions.length === 0 ? (
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
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
                  <RoomSuggestions
                    key={s.gameId}
                    suggestion={s}
                    isHost={isHost}
                    currentUserId={currentUserId}
                    onVote={handleVote}
                    onToggleBring={handleToggleBring}
                    loadingGameId={loadingGameId}
                    playedLastSession={room.lastSessionGameIds.includes(s.gameId)}
                  />
                ))
              )}

              {myLibrary.length > 0 && (
                <Box sx={{ mt: "28px" }}>
                  <Divider sx={{ borderColor: "divider", mb: "20px" }} />
                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "text.primary",
                      mb: "14px",
                    }}
                  >
                    Add from my library
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {myLibrary.map((game) => (
                      <Box
                        key={game.gameId}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          background: "transparent",
                          border: "1px solid",
                          borderColor: "divider",
                          "&:hover": {
                            background: "rgba(51,39,26,0.05)",
                            borderColor: INK,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            background: gameColor(game.name),
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
                              color: "rgba(255,251,240,0.9)",
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
                            color: "text.primary",
                            flex: 1,
                          }}
                        >
                          {game.name}
                        </Typography>
                        <Button
                          disabled={loadingGameId === game.gameId}
                          size="small"
                          onClick={() => handleAddFromLibrary(game.gameId)}
                          sx={{
                            background: "transparent",
                            border: `1.5px solid ${INK}`,
                            borderRadius: "999px",
                            color: INK,
                            fontFamily: FONT_SANS,
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "4px 12px",
                            textTransform: "none",
                            "&:hover": { background: TINT_MUSTARD },
                          }}
                        >
                          {loadingGameId === game.gameId ? <CircularProgress size={12} /> : "Bring"}
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "text.primary",
                  mb: "16px",
                }}
              >
                At the table
              </Typography>
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  border: BORDER_INK,
                  borderRadius: "13px",
                  boxShadow: SHADOW_HARD,
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
                            background: avatarColor(member.username),
                            border: BORDER_INK,
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
                              color: "rgba(255,251,240,0.9)",
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
                            color: "text.primary",
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
                                fontWeight: 700,
                                letterSpacing: "0.8px",
                                textTransform: "uppercase",
                                color: INK,
                                background: TINT_MUSTARD,
                                border: `1.5px solid ${INK}`,
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
                      {i < arr.length - 1 && <Divider sx={{ borderColor: "divider" }} />}
                    </Box>
                  ))}
              </Box>

              <Box
                sx={{
                  backgroundColor: "background.paper",
                  border: "2px solid rgba(51,39,26,0.15)",
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
                      color: BRICK,
                      letterSpacing: "2px",
                    }}
                  >
                    {room.code}
                  </Box>{" "}
                  or copy the link below.
                </Typography>
                <Button
                  fullWidth
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                  variant="outlined"
                  onClick={handleCopyCode}
                  sx={{ mt: "10px", fontSize: "12px", padding: "7px" }}
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

      <LogGamesModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        suggestions={room.suggestions}
        members={room.members}
        code={code}
        isCompetitive={room.isCompetitive}
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { code } = context.params as { code: string };
  const session = await getServerSession(context.req, context.res, authOptions);
  const { default: prisma } = await import("@data/db");

  if (!session?.user) {
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        name: true,
        code: true,
        host: { select: { username: true } },
        _count: { select: { invites: true, gameSuggs: true } },
      },
    });
    if (!room) return { notFound: true };
    return {
      props: {
        preview: true as const,
        room: {
          name: room.name,
          code: room.code,
          hostUsername: room.host.username,
          memberCount: room._count.invites,
          suggestionCount: room._count.gameSuggs,
        },
      },
    };
  }

  const currentUserId = Number((session.user as any).id);
  const username = (session.user as any).username ?? "";

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

  const library = await getUserLibrary(currentUserId);

  const lastClosedSession = await prisma.roomSessions.findFirst({
    where: { roomId: room.id, status: "CLOSED" },
    orderBy: { closedAt: "desc" },
    include: {
      gamePlayed: {
        include: { games: { select: { gameId: true } } },
      },
    },
  });

  const lastSessionGameIds =
    lastClosedSession?.gamePlayed.flatMap((gs) => gs.games.map((g) => g.gameId)) ?? [];

  return {
    props: {
      preview: false as const,
      initialRoom: buildRoomData(room, currentUserId, lastSessionGameIds),
      currentUserId,
      library,
      username,
    },
  };
};

function buildRoomData(
  room: any,
  currentUserId: number,
  lastSessionGameIds: number[] = []
): RoomData {
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
    isCompetitive: room.isCompetitive,
    hostId: room.host.id,
    hostUsername: room.host.username,
    activeSessionId: room.sessions?.[0]?.id ?? null,
    lastSessionGameIds,
    members,
    suggestions,
  };
}
