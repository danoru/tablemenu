import LogGamesModal from "@/components/modals/LogGamesModal";
import RoomQuickGenModal from "@/components/modals/RoomQuickGenModal";
import RoomSuggestions from "@/components/rooms/RoomSuggestions";
import { getUserLibrary } from "@/data/games";
import { authOptions } from "@/lib/authOptions";
import { avatarColor, gameColor, initials } from "@/lib/helpers";
import {
  AMBER_DIM,
  BORDER_AMBER,
  FONT_SANS,
  FONT_SERIF,
  GOLD,
  GOLD_FADED,
  TEXT_DIM,
  TEXT_FAINT,
} from "@/styles/theme";
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
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  initialRoom: RoomData;
  currentUserId: number;
  library: LibraryGame[];
  username: string;
}

export default function RoomPage({ initialRoom, currentUserId, library, username }: Props) {
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
      <Head>
        <title>{room.name} — Tablekeeper</title>
      </Head>

      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh", position: "relative" }}>
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
                  <CheckIcon sx={{ fontSize: "14px", color: "secondary.light" }} />
                ) : (
                  <ContentCopyIcon sx={{ fontSize: "14px", color: GOLD_FADED }} />
                )}
              </Box>
              <Button
                onClick={() => setQuickGenOpen(true)}
                startIcon={<CasinoIcon />}
                sx={{
                  backgroundColor: "primary.main",
                  borderRadius: "8px",
                  color: "background.default",
                  fontFamily: FONT_SANS,
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "9px 18px",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "primary.light" },
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
                    border: `1px solid ${BORDER_AMBER}`,
                    borderRadius: "8px",
                    color: TEXT_DIM,
                    fontFamily: FONT_SANS,
                    fontSize: "14px",
                    fontWeight: 500,
                    padding: "9px 14px",
                    textTransform: "none",
                    "&:hover": {
                      background: "rgba(180,140,60,0.08)",
                      color: "text.primary",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  Settings
                </Button>
              )}
            </Box>
          </Box>

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
                        backgroundColor: "secondary.light",
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
                      onClick={() => setLogOpen(true)}
                      startIcon={<EmojiEventsIcon />}
                      sx={{
                        background: "rgba(34,85,48,0.3)",
                        border: "1px solid rgba(60,160,80,0.35)",
                        borderRadius: "8px",
                        color: "secondary.light",
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
                        border: `1px solid ${BORDER_AMBER}`,
                        borderRadius: "8px",
                        color: TEXT_DIM,
                        fontFamily: FONT_SANS,
                        fontSize: "13px",
                        fontWeight: 500,
                        padding: "8px 16px",
                        textTransform: "none",
                        "&:hover": {
                          background: "rgba(180,140,60,0.08)",
                          color: "text.primary",
                          borderColor: "primary.main",
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
                        <CircularProgress size={14} sx={{ color: "background.default" }} />
                      ) : (
                        <NightlifeIcon />
                      )
                    }
                    sx={{
                      backgroundColor: "primary.main",
                      borderRadius: "8px",
                      color: "background.default",
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 500,
                      padding: "8px 18px",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "primary.light" },
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
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid",
                          borderColor: "divider",
                          "&:hover": {
                            background: "rgba(180,140,60,0.05)",
                            borderColor: BORDER_AMBER,
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
                            color: "text.primary",
                            flex: 1,
                          }}
                        >
                          {game.name}
                        </Typography>
                        <Button
                          onClick={() => handleAddFromLibrary(game.gameId)}
                          disabled={loadingGameId === game.gameId}
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
                  border: "1px solid",
                  borderColor: "divider",
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
                            background: avatarColor(member.username),
                            border: "1px solid",
                            borderColor: "divider",
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
                                fontWeight: 500,
                                letterSpacing: "0.8px",
                                textTransform: "uppercase",
                                color: "primary.main",
                                background: AMBER_DIM,
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
                      {i < arr.length - 1 && <Divider sx={{ borderColor: "divider" }} />}
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
                    border: `1px solid ${BORDER_AMBER}`,
                    borderRadius: "7px",
                    color: TEXT_DIM,
                    fontFamily: FONT_SANS,
                    fontSize: "12px",
                    fontWeight: 500,
                    padding: "7px",
                    textTransform: "none",
                    "&:hover": { background: "rgba(180,140,60,0.08)", color: "text.primary" },
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
