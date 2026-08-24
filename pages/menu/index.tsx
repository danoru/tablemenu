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
import Head from "next/head";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import React from "react";

import RibbonLabel from "@/components/menu/RibbonLabel";
import SectionCard from "@/components/menu/SectionCard";
import ExportMenuButton from "@/components/pdf/ExportMenuButton";
import { getUserLibrary } from "@/data/games";
import { authOptions } from "@/lib/authOptions";
import { loginRedirect } from "@/lib/redirect";
import { generateMenu, makeRng, rerollSlot } from "@/lib/menu/generate";
import { menuStats, playHoursLabel, sawtoothPoints, splitSections } from "@/lib/menu/layout";
import type { GeneratedMenu, SectionConfig } from "@/lib/menu/types";
import {
  BORDER_INK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  OLIVE,
  SHADOW_HARD,
  SHADOW_HARD_LG,
  SURFACE,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_MUSTARD,
} from "@/styles/theme";

interface Props {
  library: LibraryGame[];
  username: string;
  userId: number;
}

/** Stable YYYY-MM-DD for seeding the day's menu. */
function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const SAW_POINTS = sawtoothPoints(612, 9);

/** Circular ticket-stub stat badge on the masthead band (mirrors the PDF). */
function StatBadge({
  side,
  value,
  label,
}: {
  side: "left" | "right";
  value: string;
  label: string;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [side]: { sm: "20px", md: "30px" },
        width: "68px",
        height: "68px",
        borderRadius: "50%",
        border: "1.5px solid rgba(255,251,240,0.8)",
        display: { xs: "none", sm: "flex" },
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: "4px",
          borderRadius: "50%",
          border: "1px dashed rgba(255,251,240,0.45)",
        },
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT_SERIF,
          fontSize: "20px",
          fontWeight: 900,
          color: SURFACE,
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontFamily: FONT_SANS,
          fontSize: "8px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,251,240,0.62)",
          mt: "3px",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function MenuPage({ library, username, userId }: Props) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"solo" | "room">("solo");
  const [roomCode, setRoomCode] = React.useState("");
  const [roomError, setRoomError] = React.useState("");
  const [roomLoading, setRoomLoading] = React.useState(false);
  const [roomPool, setRoomPool] = React.useState<LibraryGame[] | null>(null);
  const [roomName, setRoomName] = React.useState("");

  const [menu, setMenu] = React.useState<GeneratedMenu | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [rerolling, setRerolling] = React.useState<{ sectionId: string; idx: number } | null>(null);
  // Bumped by "New menu" and every reroll so the seeded RNG produces fresh picks.
  const [nonce, setNonce] = React.useState(0);
  const rerollCount = React.useRef(0);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const activePool: LibraryGame[] = mode === "room" && roomPool ? roomPool : library;

  function seedBase(withNonce: number): string {
    return `${todayStamp()}-${userId}-${mode}-${withNonce}`;
  }

  async function handleRoomConnect() {
    if (!roomCode.trim()) return;
    setRoomLoading(true);
    setRoomError("");
    try {
      // Full game records, not the trimmed shapes the room poll carries. The
      // poll has no categories/mechanics/complexity/description, so building
      // the pool from it silently produced a worse menu than solo mode: no
      // Today's Special (needs tags), no Desserts (needs favourites/ratings),
      // and no tasting notes, spice meters or rating badges on any row.
      const res = await fetch(`/api/rooms/${roomCode.toUpperCase()}/pool`);
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) {
        // A room's game pool is member data — the endpoint is member-only.
        setRoomError("Join this room first to use its game pool.");
        return;
      }
      if (!res.ok || !Array.isArray(data.pool)) {
        setRoomError("Room not found. Check the code and try again.");
        return;
      }
      if (data.pool.length === 0) {
        setRoomError("That room has no games on the table yet.");
        return;
      }
      setRoomPool(data.pool as LibraryGame[]);
      setRoomName(data.roomName ?? "");
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

  function buildMenu(withNonce: number) {
    setGenerating(true);
    setMenu(null);
    setTimeout(() => {
      setMenu(generateMenu(activePool, seedBase(withNonce)));
      setGenerating(false);
    }, 600);
  }

  function handleGenerate() {
    buildMenu(nonce);
  }

  function handleNewMenu() {
    const next = nonce + 1;
    setNonce(next);
    buildMenu(next);
  }

  function handleRerollGame(section: SectionConfig, idx: number) {
    if (!menu) return;
    setRerolling({ sectionId: section.id, idx });

    setTimeout(() => {
      rerollCount.current += 1;
      const rng = makeRng(`${seedBase(nonce)}-reroll-${section.id}-${idx}-${rerollCount.current}`);
      const pick = rerollSlot(activePool, section, menu.selection, rng);
      if (!pick) {
        setRerolling(null);
        return;
      }
      setMenu((prev) => {
        if (!prev) return prev;
        const updated = [...(prev.selection[section.id] ?? [])];
        updated[idx] = pick;
        return { ...prev, selection: { ...prev.selection, [section.id]: updated } };
      });
      setRerolling(null);
    }, 400);
  }

  const hasMenu = menu !== null;
  const poolSize = activePool.length;
  // Only the solo path can be empty here — room mode refuses to connect to a
  // room with nothing on the table.
  const emptyPool = mode === "solo" && poolSize === 0;

  // Programme sheet layout — same two-column + feature split as the PDF.
  const programme = menu ? splitSections(menu.sections, menu.selection) : null;
  const stats = menu ? menuStats(menu.sections, menu.selection) : null;
  const hours = stats ? playHoursLabel(stats.minutes) : "";
  const [hoursValue, ...hoursUnitParts] = hours.split(" ");

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
              A curated evening of games — courses by playtime, plus tonight&apos;s special.
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
                onClick={handleSwitchToSolo}
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
                onClick={() => mode !== "room" && setMode("room")}
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
                  error={!!roomError}
                  inputProps={{ maxLength: 6 }}
                  placeholder="ROOM CODE"
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
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    setRoomError("");
                  }}
                />
                <Button
                  disabled={roomLoading || !roomCode.trim()}
                  sx={{
                    fontSize: "13px",
                    padding: "9px 18px",
                  }}
                  variant="contained"
                  onClick={handleRoomConnect}
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
                  size="small"
                  sx={{ color: TEXT_FAINT, ml: "auto", "&:hover": { color: TEXT_DIM } }}
                  onClick={handleSwitchToSolo}
                >
                  <CloseIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </Box>
            )}
          </Box>
          {/* An empty pool produced a full programme sheet of "left to the
              chef's discretion" with no hint of what to do about it. */}
          {emptyPool ? (
            <Box
              sx={{
                backgroundColor: "background.paper",
                border: BORDER_INK,
                borderRadius: "13px",
                boxShadow: SHADOW_HARD,
                padding: "36px 28px",
                textAlign: "center",
                mb: "36px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontStyle: "italic",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "text.primary",
                  mb: "8px",
                }}
              >
                The pantry&apos;s empty
              </Typography>
              <Typography
                sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_DIM, mb: "20px" }}
              >
                Add a few games to your library and Tablekeeper will build the evening around them.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push(`/players/${username}/library`)}
                sx={{ fontSize: "14px", padding: "10px 24px" }}
              >
                Add games to my library
              </Button>
            </Box>
          ) : (
            <Button
              fullWidth
              disabled={generating || (mode === "room" && !roomPool)}
              startIcon={
                generating ? (
                  <CircularProgress size={18} sx={{ color: "text.disabled" }} />
                ) : (
                  <AutoAwesomeIcon />
                )
              }
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: "17px",
                fontStyle: "italic",
                padding: "14px",
                mb: "36px",
              }}
              variant="contained"
              onClick={handleGenerate}
            >
              {generating
                ? "Planning your evening…"
                : hasMenu
                  ? "Regenerate menu"
                  : "Plan my evening"}
            </Button>
          )}

          {hasMenu && !generating && menu && programme && stats && (
            <Box>
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  border: BORDER_INK,
                  borderRadius: "13px",
                  boxShadow: SHADOW_HARD_LG,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    backgroundColor: INK,
                    textAlign: "center",
                    padding: { xs: "26px 20px 20px", sm: "30px 116px 22px" },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "rgba(255,251,240,0.62)",
                      letterSpacing: "0.26em",
                      textTransform: "uppercase",
                      mb: "8px",
                    }}
                  >
                    Tablekeeper · An evening of games
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontStyle: "italic",
                      fontSize: { xs: "30px", md: "38px" },
                      fontWeight: 900,
                      color: SURFACE,
                      lineHeight: 1.05,
                    }}
                  >
                    Tonight&apos;s Programme
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "rgba(255,251,240,0.78)",
                      letterSpacing: "0.08em",
                      mt: "7px",
                    }}
                  >
                    {formatLongDate(new Date())}
                  </Typography>
                  <StatBadge label="games" side="left" value={String(stats.count)} />
                  {hours && (
                    <StatBadge
                      label={`${hoursUnitParts.join(" ")} play`}
                      side="right"
                      value={hoursValue}
                    />
                  )}
                </Box>
                <Box
                  component="svg"
                  preserveAspectRatio="none"
                  sx={{ display: "block", width: "100%", height: "10px" }}
                  viewBox="0 0 612 9"
                >
                  <polygon fill={INK} points={SAW_POINTS} />
                </Box>

                <Box sx={{ padding: { xs: "26px 18px 30px", md: "34px 40px 36px" } }}>
                  <Box
                    sx={{
                      position: "relative",
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      columnGap: "52px",
                      rowGap: "30px",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: "50%",
                        top: "4px",
                        bottom: "4px",
                        borderLeft: "1px dotted rgba(51,39,26,0.35)",
                        display: { xs: "none", md: "block" },
                      },
                    }}
                  >
                    {[programme.left, programme.right].map((column, colIdx) => (
                      <Box
                        key={colIdx}
                        sx={{ display: "flex", flexDirection: "column", gap: "30px" }}
                      >
                        {column.map((section) => (
                          <SectionCard
                            key={section.id}
                            games={menu.selection[section.id] ?? []}
                            rerollingIdx={
                              rerolling?.sectionId === section.id ? rerolling.idx : null
                            }
                            section={section}
                            onRerollGame={(idx) => handleRerollGame(section, idx)}
                          />
                        ))}
                      </Box>
                    ))}
                  </Box>

                  {programme.special && (
                    <Box
                      sx={{
                        position: "relative",
                        mt: "46px",
                        border: BORDER_INK,
                        borderRadius: "12px",
                        padding: { xs: "34px 18px 24px", sm: "36px 28px 26px" },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          inset: "5px",
                          border: "1px solid rgba(51,39,26,0.3)",
                          borderRadius: "8px",
                          pointerEvents: "none",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: "-16px",
                          left: 0,
                          right: 0,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <RibbonLabel
                          icon={programme.special.icon}
                          label={programme.special.label}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: FONT_SERIF,
                          fontStyle: "italic",
                          fontSize: "14px",
                          color: TEXT_FAINT,
                          textAlign: "center",
                          mb: "18px",
                        }}
                      >
                        {programme.special.subtitle}
                      </Typography>
                      <SectionCard
                        hideHeader
                        twoColumn
                        games={menu.selection[programme.special.id] ?? []}
                        rerollingIdx={
                          rerolling?.sectionId === programme.special.id ? rerolling.idx : null
                        }
                        section={programme.special}
                        onRerollGame={(idx) => handleRerollGame(programme.special!, idx)}
                      />
                    </Box>
                  )}

                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontStyle: "italic",
                      fontSize: "13px",
                      color: TEXT_FAINT,
                      textAlign: "center",
                      mt: "32px",
                    }}
                  >
                    — Substitutions gladly accommodated · ask your table keeper —
                  </Typography>
                </Box>
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
                  startIcon={<CasinoIcon />}
                  sx={{
                    fontSize: "14px",
                    padding: "10px 20px",
                  }}
                  variant="outlined"
                  onClick={handleNewMenu}
                >
                  New menu
                </Button>
                <ExportMenuButton menu={menu.selection} sections={menu.sections} />
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
                Hit the button above and we&apos;ll build a full game night menu from your library.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={4000}
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
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
    return loginRedirect(context.resolvedUrl);
  }

  const currentUserId = Number((session.user as any).id);

  const library = await getUserLibrary(currentUserId);

  return {
    props: { library, username: (session.user as any).username ?? "", userId: currentUserId },
  };
};
