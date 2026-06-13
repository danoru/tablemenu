import CourseCard from "@/components/rooms/CourseCard";
import ExportMenuButton from "@/components/pdf/ExportMenuButton";
import { getUserLibrary } from "@/data/games";
import { authOptions } from "@/lib/authOptions";
import {
  BORDER_INK,
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  OLIVE,
  PLUM,
  SHADOW_HARD,
  SHADOW_HARD_LG,
  TEAL,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_BRICK,
  TINT_MUSTARD,
  TINT_OLIVE,
  TINT_PLUM,
  TINT_TEAL,
} from "@/styles/theme";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CasinoIcon from "@mui/icons-material/Casino";
import CloseIcon from "@mui/icons-material/Close";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PersonIcon from "@mui/icons-material/Person";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  OutlinedInput,
  Snackbar,
  Typography,
} from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import React from "react";

const COURSES = [
  {
    id: "appetizer",
    icon: "🥨",
    label: "Appetizers",
    subtitle: "While everyone arrives",
    color: TINT_OLIVE,
    border: OLIVE,
    accent: OLIVE,
    filter: (g: LibraryGame) => g.maxPlaytime <= 20,
    picks: 2,
  },
  {
    id: "entree",
    icon: "🍽️",
    label: "Entrées",
    subtitle: "The main event",
    color: TINT_BRICK,
    border: BRICK,
    accent: BRICK,
    filter: (g: LibraryGame) => g.minPlaytime >= 30 && g.maxPlaytime <= 89,
    picks: 2,
  },
  {
    id: "epic",
    icon: "🏰",
    label: "Epic Course",
    subtitle: "Go all in",
    color: TINT_PLUM,
    border: PLUM,
    accent: PLUM,
    filter: (g: LibraryGame) => g.minPlaytime >= 90,
    picks: 1,
  },
  {
    id: "dessert",
    icon: "🎂",
    label: "Desserts",
    subtitle: "Wind down the night",
    color: TINT_TEAL,
    border: TEAL,
    accent: TEAL,
    filter: (g: LibraryGame) => g.maxPlaytime <= 29,
    picks: 2,
  },
] as const;

type CourseId = (typeof COURSES)[number]["id"];

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
interface MenuSelection {
  [courseId: string]: LibraryGame[];
}

interface Props {
  library: LibraryGame[];
  username: string;
}

export default function MenuPage({ library, username }: Props) {
  const [mode, setMode] = React.useState<"solo" | "room">("solo");
  const [roomCode, setRoomCode] = React.useState("");
  const [roomError, setRoomError] = React.useState("");
  const [roomLoading, setRoomLoading] = React.useState(false);
  const [roomPool, setRoomPool] = React.useState<LibraryGame[] | null>(null);
  const [roomName, setRoomName] = React.useState("");

  const [menu, setMenu] = React.useState<MenuSelection | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [rerolling, setRerolling] = React.useState<{ courseId: string; idx: number } | null>(null);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const activePool: LibraryGame[] = mode === "room" && roomPool ? roomPool : library;

  async function handleRoomConnect() {
    if (!roomCode.trim()) return;
    setRoomLoading(true);
    setRoomError("");
    try {
      const res = await fetch(`/api/rooms/${roomCode.toUpperCase()}`);
      const data = await res.json();
      if (!res.ok || !data.room) {
        setRoomError("Room not found. Check the code and try again.");
        return;
      }
      const pool: LibraryGame[] = data.room.suggestions
        .filter((s: any) => s.bringing)
        .map((s: any) => ({
          id: s.gameId,
          name: s.name,
          imageUrl: s.imageUrl,
          minPlayers: s.minPlayers,
          maxPlayers: s.maxPlayers,
          minPlaytime: s.minPlaytime,
          maxPlaytime: s.maxPlaytime,
          complexity: null,
          bggRating: null,
          categories: [],
          bggId: null,
        }));
      setRoomPool(pool);
      setRoomName(data.room.name);
      setMode("room");
      setMenu(null);
    } catch {
      setRoomError("Failed to connect to room.");
    } finally {
      setRoomLoading(false);
    }
  }

  function handleSwitchToSolo() {
    setMode("solo");
    setRoomPool(null);
    setRoomCode("");
    setRoomError("");
    setRoomName("");
    setMenu(null);
  }

  function generateMenu() {
    setGenerating(true);
    setMenu(null);

    setTimeout(() => {
      const selection: MenuSelection = {};
      for (const course of COURSES) {
        const eligible = activePool.filter(course.filter);
        selection[course.id] = pickRandom(eligible, course.picks);
      }
      setMenu(selection);
      setGenerating(false);
    }, 600);
  }

  function handleRerollGame(courseId: CourseId, idx: number) {
    if (!menu) return;
    setRerolling({ courseId, idx });

    setTimeout(() => {
      const course = COURSES.find((c) => c.id === courseId)!;
      const eligible = activePool.filter(course.filter);
      const current = menu[courseId];

      const currentIds = new Set(current.map((g) => g.gameId));
      const candidates = eligible.filter((g) => !currentIds.has(g.gameId));
      const pick =
        candidates.length > 0
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : eligible[Math.floor(Math.random() * eligible.length)];

      if (!pick) {
        setRerolling(null);
        return;
      }

      setMenu((prev) => {
        if (!prev) return prev;
        const updated = [...prev[courseId]];
        updated[idx] = pick;
        return { ...prev, [courseId]: updated };
      });
      setRerolling(null);
    }, 400);
  }

  const hasMenu = menu !== null;
  const poolSize = activePool.length;

  return (
    <>
      <Head>
        <title>The Menu — Tablekeeper</title>
      </Head>

      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Box
          sx={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          <Box sx={{ mb: "36px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "8px" }}>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: { xs: "36px", md: "48px" },
                  fontWeight: 900,
                  color: "text.primary",
                  lineHeight: 1.05,
                  letterSpacing: "-0.5px",
                  fontStyle: "italic",
                }}
              >
                The Menu
              </Typography>
            </Box>
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "15px", fontWeight: 400, color: TEXT_DIM }}
            >
              A curated evening of games — from warm-up to send-off.
            </Typography>
          </Box>

          <Box
            sx={{
              backgroundColor: "background.paper",
              border: BORDER_INK,
              borderRadius: "13px",
              boxShadow: SHADOW_HARD,
              padding: "20px 24px",
              mb: "28px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "16px" }}>
              <Typography
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "text.secondary",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Game pool
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                mb: mode === "room" || roomCode ? "16px" : 0,
              }}
            >
              <Button
                onClick={handleSwitchToSolo}
                startIcon={<PersonIcon sx={{ fontSize: "15px !important" }} />}
                sx={{
                  background: mode === "solo" ? TINT_MUSTARD : "background.paper",
                  border: `2px solid ${mode === "solo" ? INK : "rgba(51,39,26,0.3)"}`,
                  borderRadius: "999px",
                  boxShadow: mode === "solo" ? SHADOW_HARD : "none",
                  color: mode === "solo" ? INK : "text.secondary",
                  fontFamily: FONT_SANS,
                  fontSize: "13px",
                  fontWeight: mode === "solo" ? 700 : 500,
                  padding: "7px 16px",
                  textTransform: "none",
                  "&:hover": { background: TINT_MUSTARD, borderColor: INK },
                }}
              >
                My library
                {mode === "solo" && (
                  <Box
                    component="span"
                    sx={{ ml: "8px", fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}
                  >
                    {poolSize} games
                  </Box>
                )}
              </Button>

              <Button
                startIcon={<MeetingRoomIcon sx={{ fontSize: "15px !important" }} />}
                onClick={() => mode !== "room" && setMode("room")}
                sx={{
                  background: mode === "room" ? TINT_MUSTARD : "background.paper",
                  border: `2px solid ${mode === "room" ? INK : "rgba(51,39,26,0.3)"}`,
                  borderRadius: "999px",
                  boxShadow: mode === "room" ? SHADOW_HARD : "none",
                  color: mode === "room" ? INK : "text.secondary",
                  fontFamily: FONT_SANS,
                  fontSize: "13px",
                  fontWeight: mode === "room" ? 700 : 500,
                  padding: "7px 16px",
                  textTransform: "none",
                  "&:hover": {
                    background: TINT_MUSTARD,
                    borderColor: INK,
                  },
                }}
              >
                {mode === "room" && roomName ? roomName : "Room pool"}
                {mode === "room" && roomPool && (
                  <Box
                    component="span"
                    sx={{ ml: "8px", fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}
                  >
                    {poolSize} games
                  </Box>
                )}
              </Button>
            </Box>

            {mode === "room" && !roomPool && (
              <Box sx={{ display: "flex", gap: "8px", mt: "16px", flexWrap: "wrap" }}>
                <OutlinedInput
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    setRoomError("");
                  }}
                  placeholder="ROOM CODE"
                  inputProps={{ maxLength: 6 }}
                  error={!!roomError}
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "text.primary",
                    letterSpacing: "2px",
                    width: "160px",
                    "& input": { textAlign: "center", padding: "9px 14px" },
                    "& input::placeholder": {
                      color: TEXT_FAINT,
                      letterSpacing: "1px",
                      fontSize: "13px",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleRoomConnect}
                  disabled={roomLoading || !roomCode.trim()}
                  sx={{
                    fontSize: "13px",
                    padding: "9px 18px",
                  }}
                >
                  {roomLoading ? (
                    <CircularProgress size={16} sx={{ color: "text.disabled" }} />
                  ) : (
                    "Connect"
                  )}
                </Button>
                {roomError && (
                  <Typography
                    sx={{
                      width: "100%",
                      fontFamily: FONT_SANS,
                      fontSize: "12px",
                      color: "error.main",
                      mt: "4px",
                    }}
                  >
                    {roomError}
                  </Typography>
                )}
              </Box>
            )}

            {mode === "room" && roomPool && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "16px" }}>
                <Box
                  sx={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: OLIVE,
                    flexShrink: 0,
                    "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography
                  sx={{ fontFamily: FONT_SANS, fontSize: "13px", fontWeight: 700, color: OLIVE }}
                >
                  Connected to {roomName}
                </Typography>
                <IconButton
                  onClick={handleSwitchToSolo}
                  size="small"
                  sx={{ color: TEXT_FAINT, ml: "auto", "&:hover": { color: TEXT_DIM } }}
                >
                  <CloseIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </Box>
            )}
          </Box>
          <Button
            fullWidth
            onClick={generateMenu}
            disabled={generating || (mode === "room" && !roomPool)}
            startIcon={
              generating ? (
                <CircularProgress size={18} sx={{ color: "text.disabled" }} />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            variant="contained"
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "17px",
              fontStyle: "italic",
              padding: "14px",
              mb: "36px",
            }}
          >
            {generating
              ? "Planning your evening…"
              : hasMenu
                ? "Regenerate menu"
                : "Plan my evening"}
          </Button>

          {hasMenu && !generating && (
            <Box>
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  border: BORDER_INK,
                  borderRadius: "13px",
                  boxShadow: SHADOW_HARD_LG,
                  padding: { xs: "32px 22px", md: "44px 52px" },
                }}
              >
                <Box sx={{ textAlign: "center", mb: "10px" }}>
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "10px",
                      fontWeight: 700,
                      color: BRICK,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      mb: "10px",
                    }}
                  >
                    Tablekeeper · An evening of games
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontStyle: "italic",
                      fontSize: { xs: "28px", md: "34px" },
                      fontWeight: 900,
                      color: "text.primary",
                      lineHeight: 1.1,
                    }}
                  >
                    Tonight&apos;s Programme
                  </Typography>
                </Box>

                <Box sx={{ borderTop: `2px solid ${INK}`, mb: "3px" }} />
                <Box sx={{ borderTop: "1px solid rgba(51,39,26,0.3)", mb: "30px" }} />

                {COURSES.map((course, courseIdx) => {
                  const picks = menu[course.id] ?? [];
                  return (
                    <Box key={course.id}>
                      {courseIdx > 0 && (
                        <Typography
                          aria-hidden
                          sx={{
                            textAlign: "center",
                            color: BRICK,
                            fontSize: "15px",
                            lineHeight: 1,
                            my: "26px",
                            userSelect: "none",
                          }}
                        >
                          ✳
                        </Typography>
                      )}
                      <CourseCard
                        course={course}
                        games={picks}
                        empty={picks.length === 0}
                        rerollingIdx={rerolling?.courseId === course.id ? rerolling.idx : null}
                        onRerollGame={(idx) => handleRerollGame(course.id, idx)}
                      />
                    </Box>
                  );
                })}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  mt: "32px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={generateMenu}
                  startIcon={<CasinoIcon />}
                  sx={{
                    fontSize: "14px",
                    padding: "10px 20px",
                  }}
                >
                  Start over
                </Button>
                <ExportMenuButton menu={menu} courses={COURSES} />
              </Box>
            </Box>
          )}

          {!hasMenu && !generating && (
            <Box sx={{ textAlign: "center", py: "48px" }}>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "22px",
                  fontStyle: "italic",
                  color: TEXT_DIM,
                  mb: "8px",
                }}
              >
                Your evening awaits
              </Typography>
              <Typography sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT }}>
                Hit the button above and we'll build a full game night menu from your library.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

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
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const currentUserId = Number((session.user as any).id);

  const library = await getUserLibrary(currentUserId);

  return { props: { library, username: (session.user as any).username ?? "" } };
};
