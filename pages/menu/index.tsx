import CourseCard from "@/components/cards/CourseCard";
import ExportMenuButton from "@/components/ExportMenuButton";
import { getUserLibrary } from "@/data/games";
import { authOptions } from "@/lib/authOptions";
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

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = "#e8c97a";
const GOLD_FADED = "rgba(232,201,122,0.35)";
const AMBER = "#c8962a";
const AMBER_HOVER = "#dba535";
const GREEN_BRIGHT = "#5ec97a";
const BG = "#0f0c08";
const BG_CARD = "#1a1610";
const BORDER = "rgba(180,140,60,0.15)";
const BORDER_MED = "rgba(180,140,60,0.28)";
const TEXT = "#f0e6cc";
const TEXT_DIM = "rgba(232,223,200,0.55)";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SERIF = "'Playfair Display', serif";
const FONT_SANS = "'DM Sans', sans-serif";

const COURSES = [
  {
    id: "appetizer",
    icon: "🥨",
    label: "Appetizers",
    subtitle: "While everyone arrives",
    color: "rgba(34,85,48,0.25)",
    border: "rgba(60,160,80,0.2)",
    accent: GREEN_BRIGHT,
    filter: (g: LibraryGame) => g.maxPlaytime <= 20,
    picks: 2,
  },
  {
    id: "entree",
    icon: "🍽️",
    label: "Entrées",
    subtitle: "The main event",
    color: "rgba(180,110,30,0.18)",
    border: "rgba(180,140,60,0.25)",
    accent: GOLD,
    filter: (g: LibraryGame) => g.minPlaytime >= 30 && g.maxPlaytime <= 89,
    picks: 2,
  },
  {
    id: "epic",
    icon: "🏰",
    label: "Epic Course",
    subtitle: "Go all in",
    color: "rgba(60,40,80,0.25)",
    border: "rgba(100,70,160,0.25)",
    accent: "#c4a0f0",
    filter: (g: LibraryGame) => g.minPlaytime >= 90,
    picks: 1,
  },
  {
    id: "dessert",
    icon: "🎂",
    label: "Desserts",
    subtitle: "Wind down the night",
    color: "rgba(90,30,30,0.2)",
    border: "rgba(160,70,70,0.2)",
    accent: "#f0a0a0",
    filter: (g: LibraryGame) => g.maxPlaytime <= 29,
    picks: 2,
  },
] as const;

type CourseId = (typeof COURSES)[number]["id"];

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuSelection {
  [courseId: string]: LibraryGame[];
}

interface Props {
  library: LibraryGame[];
  username: string;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MenuPage({ library, username }: Props) {
  // ── Source mode: solo vs room ──────────────────────────────────────────────
  const [mode, setMode] = React.useState<"solo" | "room">("solo");
  const [roomCode, setRoomCode] = React.useState("");
  const [roomError, setRoomError] = React.useState("");
  const [roomLoading, setRoomLoading] = React.useState(false);
  const [roomPool, setRoomPool] = React.useState<LibraryGame[] | null>(null);
  const [roomName, setRoomName] = React.useState("");

  // ── Menu state ─────────────────────────────────────────────────────────────
  const [menu, setMenu] = React.useState<MenuSelection | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [rerolling, setRerolling] = React.useState<{ courseId: string; idx: number } | null>(null);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const activePool: LibraryGame[] = mode === "room" && roomPool ? roomPool : library;

  // ── Room pool fetch ────────────────────────────────────────────────────────
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
      // Map room suggestions to Game shape
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
      setMenu(null); // clear old menu when switching pools
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

  // ── Menu generation ────────────────────────────────────────────────────────
  function generateMenu() {
    setGenerating(true);
    setMenu(null);

    // Small delay for dramatic effect
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

  // ── Per-game reroll ────────────────────────────────────────────────────────
  function handleRerollGame(courseId: CourseId, idx: number) {
    if (!menu) return;
    setRerolling({ courseId, idx });

    setTimeout(() => {
      const course = COURSES.find((c) => c.id === courseId)!;
      const eligible = activePool.filter(course.filter);
      const current = menu[courseId];

      // Pick a game not already in this course's selection
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

      <Box sx={{ background: BG, minHeight: "100vh", position: "relative" }}>
        {/* Ambient glow */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "50vh",
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(180,110,30,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "800px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          {/* ── Page header ──────────────────────────────────────────────── */}
          <Box sx={{ mb: "36px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "8px" }}>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: { xs: "36px", md: "48px" },
                  fontWeight: 900,
                  color: TEXT,
                  lineHeight: 1.05,
                  letterSpacing: "-0.5px",
                  fontStyle: "italic",
                }}
              >
                The Menu
              </Typography>
            </Box>
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "15px", fontWeight: 300, color: TEXT_DIM }}
            >
              A curated evening of games — from warm-up to send-off.
            </Typography>
          </Box>

          {/* ── Source toggle ─────────────────────────────────────────────── */}
          <Box
            sx={{
              background: BG_CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: "14px",
              padding: "20px 24px",
              mb: "28px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "16px" }}>
              <Typography
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "11px",
                  fontWeight: 500,
                  color: TEXT_FAINT,
                  letterSpacing: "1px",
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
                  background: mode === "solo" ? "rgba(200,150,42,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${mode === "solo" ? AMBER : BORDER}`,
                  borderRadius: "8px",
                  color: mode === "solo" ? GOLD : TEXT_DIM,
                  fontFamily: FONT_SANS,
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: "7px 16px",
                  textTransform: "none",
                  "&:hover": { background: "rgba(200,150,42,0.15)", borderColor: AMBER },
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
                  background: mode === "room" ? "rgba(34,85,48,0.25)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${mode === "room" ? "rgba(60,160,80,0.4)" : BORDER}`,
                  borderRadius: "8px",
                  color: mode === "room" ? GREEN_BRIGHT : TEXT_DIM,
                  fontFamily: FONT_SANS,
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: "7px 16px",
                  textTransform: "none",
                  "&:hover": {
                    background: "rgba(34,85,48,0.2)",
                    borderColor: "rgba(60,160,80,0.3)",
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

            {/* Room code input — shown when room mode is selected but not yet connected */}
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
                    color: TEXT,
                    letterSpacing: "2px",
                    width: "160px",
                    "& input": { textAlign: "center", padding: "9px 14px" },
                    "& input::placeholder": {
                      color: TEXT_FAINT,
                      letterSpacing: "1px",
                      fontSize: "13px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: roomError ? "rgba(220,80,80,0.5)" : BORDER_MED,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: AMBER },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: AMBER,
                      borderWidth: "1px",
                    },
                  }}
                />
                <Button
                  onClick={handleRoomConnect}
                  disabled={roomLoading || !roomCode.trim()}
                  sx={{
                    background: AMBER,
                    borderRadius: "8px",
                    color: "#0f0c08",
                    fontFamily: FONT_SANS,
                    fontSize: "13px",
                    fontWeight: 500,
                    padding: "9px 18px",
                    textTransform: "none",
                    "&:hover": { background: AMBER_HOVER },
                    "&.Mui-disabled": {
                      background: "rgba(200,150,42,0.35)",
                      color: "rgba(15,12,8,0.5)",
                    },
                  }}
                >
                  {roomLoading ? (
                    <CircularProgress size={16} sx={{ color: "rgba(15,12,8,0.5)" }} />
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
                      color: "rgba(220,100,100,0.9)",
                      mt: "4px",
                    }}
                  >
                    {roomError}
                  </Typography>
                )}
              </Box>
            )}

            {/* Connected room — show disconnect option */}
            {mode === "room" && roomPool && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "16px" }}>
                <Box
                  sx={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: GREEN_BRIGHT,
                    flexShrink: 0,
                    "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: GREEN_BRIGHT }}>
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
          {/* ── Generate button ───────────────────────────────────────────── */}
          <Button
            fullWidth
            onClick={generateMenu}
            disabled={generating || (mode === "room" && !roomPool)}
            startIcon={
              generating ? (
                <CircularProgress size={18} sx={{ color: "#0f0c08" }} />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            sx={{
              background: AMBER,
              borderRadius: "10px",
              color: "#0f0c08",
              fontFamily: FONT_SERIF,
              fontSize: "17px",
              fontWeight: 700,
              fontStyle: "italic",
              padding: "14px",
              textTransform: "none",
              mb: "36px",
              "&:hover": { background: AMBER_HOVER },
              "&.Mui-disabled": { background: "rgba(200,150,42,0.35)", color: "rgba(15,12,8,0.5)" },
            }}
          >
            {generating
              ? "Planning your evening…"
              : hasMenu
                ? "Regenerate menu"
                : "Plan my evening"}
          </Button>

          {/* ── Menu output ───────────────────────────────────────────────── */}
          {hasMenu && !generating && (
            <Box>
              {/* Decorative header */}
              <Box sx={{ textAlign: "center", mb: "32px" }}>
                <Typography
                  sx={{
                    fontFamily: FONT_SERIF,
                    fontSize: "13px",
                    fontWeight: 400,
                    color: GOLD_FADED,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    mb: "8px",
                  }}
                >
                  Tonight's Programme
                </Typography>
                <Box
                  sx={{
                    width: "60px",
                    height: "1px",
                    background: `linear-gradient(to right, transparent, ${GOLD_FADED}, transparent)`,
                    margin: "0 auto",
                  }}
                />
              </Box>

              {/* Course cards */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {COURSES.map((course) => {
                  const picks = menu[course.id] ?? [];
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      games={picks}
                      empty={picks.length === 0}
                      rerollingIdx={rerolling?.courseId === course.id ? rerolling.idx : null}
                      onRerollGame={(idx) => handleRerollGame(course.id, idx)}
                    />
                  );
                })}
              </Box>

              {/* Footer actions */}
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
                  onClick={generateMenu}
                  startIcon={<CasinoIcon />}
                  sx={{
                    background: "transparent",
                    border: `1px solid ${BORDER_MED}`,
                    borderRadius: "8px",
                    color: TEXT_DIM,
                    fontFamily: FONT_SANS,
                    fontSize: "14px",
                    fontWeight: 500,
                    padding: "10px 20px",
                    textTransform: "none",
                    "&:hover": {
                      background: "rgba(180,140,60,0.08)",
                      color: TEXT,
                      borderColor: AMBER,
                    },
                  }}
                >
                  Start over
                </Button>
                <ExportMenuButton menu={menu} courses={COURSES} />
              </Box>
            </Box>
          )}

          {/* ── Empty state (before generation) ──────────────────────────── */}
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

// ─── Server-side auth ─────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const currentUserId = Number((session.user as any).id);

  const library = await getUserLibrary(currentUserId);

  return { props: { library, username: (session.user as any).username ?? "" } };
};
