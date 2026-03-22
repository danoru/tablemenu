import { authOptions } from "@api/auth/[...nextauth]";
import { MOCK_USER_LIBRARY } from "@data/mockGameData";
import CasinoIcon from "@mui/icons-material/Casino";
import GroupsIcon from "@mui/icons-material/Groups";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { Box, Button, CircularProgress, Divider, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = "#e8c97a";
const GOLD_FADED = "rgba(232,201,122,0.4)";
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: "12px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "rgba(180,110,30,0.18)",
          border: `1px solid rgba(180,140,60,0.2)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: GOLD,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "22px",
            fontWeight: 500,
            color: TEXT,
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT, mt: "2px" }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: "16px" }}
    >
      <Typography sx={{ fontFamily: FONT_SERIF, fontSize: "20px", fontWeight: 700, color: TEXT }}>
        {title}
      </Typography>
      {action && (
        <Typography
          onClick={onAction}
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "13px",
            color: GOLD_FADED,
            cursor: "pointer",
            "&:hover": { color: GOLD },
            transition: "color 0.15s",
          }}
        >
          {action} →
        </Typography>
      )}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface DashboardProps {
  activeRooms: {
    id: number;
    name: string;
    code: string;
    type: string;
    playerCount: number | null;
    createdAt: string;
  }[];
  nightsHosted: number;
  username: string;
}

export default function DashboardPage({ activeRooms, nightsHosted, username }: DashboardProps) {
  const router = useRouter();

  const library = MOCK_USER_LIBRARY;
  const recentGames = library.slice(0, 5);

  const stats = {
    gamesOwned: library.length,
    nightsHosted: nightsHosted,
    following: 0,
    activeRooms: activeRooms.length,
  };

  return (
    <>
      <Head>
        <title>Dashboard — Tablekeeper</title>
      </Head>

      <Box sx={{ background: BG, minHeight: "100vh", position: "relative" }}>
        {/* Ambient glow */}
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
            maxWidth: "1100px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          {/* ── Greeting ─────────────────────────────────────────────────── */}
          <Box sx={{ mb: "36px" }}>
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "13px",
                fontWeight: 500,
                color: TEXT_FAINT,
                letterSpacing: "1px",
                textTransform: "uppercase",
                mb: "6px",
              }}
            >
              Welcome back
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: { xs: "34px", md: "44px" },
                fontWeight: 900,
                color: TEXT,
                lineHeight: 1.05,
                letterSpacing: "-0.5px",
              }}
            >
              {username}
            </Typography>
          </Box>

          {/* ── Quick Gen CTA ─────────────────────────────────────────────── */}
          <Box
            sx={{
              background: "rgba(34,85,48,0.14)",
              border: "1px solid rgba(60,160,80,0.22)",
              borderRadius: "14px",
              padding: { xs: "24px", md: "28px 36px" },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
              mb: "32px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: "-20px",
                top: "-20px",
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: "rgba(94,201,122,0.05)",
                pointerEvents: "none",
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: { xs: "20px", md: "24px" },
                  fontWeight: 700,
                  color: TEXT,
                  mb: "6px",
                }}
              >
                Ready to play?
              </Typography>
              <Typography sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_DIM }}>
                Let Tablekeeper pick tonight's game from your library.
              </Typography>
            </Box>
            <Button
              startIcon={<CasinoIcon />}
              onClick={() => router.push(`/players/${username}/library`)}
              sx={{
                background: AMBER,
                borderRadius: "8px",
                color: "#0f0c08",
                fontFamily: FONT_SANS,
                fontSize: "15px",
                fontWeight: 500,
                padding: "12px 24px",
                textTransform: "none",
                flexShrink: 0,
                "&:hover": { background: AMBER_HOVER },
              }}
            >
              Quick Gen
            </Button>
          </Box>

          {/* ── Stats row ─────────────────────────────────────────────────── */}
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              mb: "40px",
            }}
          >
            <StatCard
              label="Games in library"
              value={stats.gamesOwned}
              icon={<LibraryBooksIcon sx={{ fontSize: "18px" }} />}
            />
            <StatCard
              label="Nights hosted"
              value={stats.nightsHosted}
              icon={<GroupsIcon sx={{ fontSize: "18px" }} />}
            />
            <StatCard
              label="Active rooms"
              value={stats.activeRooms}
              icon={<MeetingRoomIcon sx={{ fontSize: "18px" }} />}
            />
          </Box>

          {/* ── Two-column content ────────────────────────────────────────── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: "24px",
            }}
          >
            {/* Recently added */}
            <Box>
              <SectionHeader
                title="Recently added"
                action="View library"
                onAction={() => router.push(`/players/${username}/library`)}
              />
              <Box
                sx={{
                  background: BG_CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {recentGames.map((game, i) => (
                  <Box key={game.id}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 18px",
                        "&:hover": { background: "rgba(255,255,255,0.025)" },
                        transition: "background 0.15s",
                      }}
                    >
                      {/* Mini art placeholder */}
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
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {game.name}
                      </Typography>
                    </Box>
                    {i < recentGames.length - 1 && (
                      <Divider sx={{ borderColor: BORDER, mx: "18px" }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Active rooms */}
            <Box
              sx={{
                background: BG_CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {activeRooms.length === 0 ? (
                <Box
                  sx={{
                    padding: "40px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <MeetingRoomIcon sx={{ fontSize: "32px", color: TEXT_FAINT }} />
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      color: TEXT_FAINT,
                      textAlign: "center",
                    }}
                  >
                    No active rooms
                  </Typography>
                  <Button
                    onClick={() => router.push("/rooms/new")}
                    sx={{
                      background: "transparent",
                      border: `1px solid ${BORDER_MED}`,
                      borderRadius: "8px",
                      color: TEXT_DIM,
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 500,
                      padding: "8px 18px",
                      textTransform: "none",
                      mt: "4px",
                      "&:hover": {
                        background: "rgba(180,140,60,0.08)",
                        color: TEXT,
                        borderColor: AMBER,
                      },
                    }}
                  >
                    Host a game night
                  </Button>
                </Box>
              ) : (
                activeRooms.map((room, i) => (
                  <Box key={room.id}>
                    <Box
                      onClick={() => router.push(`/rooms/${room.code}`)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 18px",
                        cursor: "pointer",
                        "&:hover": { background: "rgba(255,255,255,0.025)" },
                      }}
                    >
                      <MeetingRoomIcon
                        sx={{ fontSize: "18px", color: TEXT_FAINT, flexShrink: 0 }}
                      />
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
                          {room.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: FONT_SANS,
                            fontSize: "12px",
                            color: TEXT_FAINT,
                            mt: "1px",
                          }}
                        >
                          {room.code}
                          {room.playerCount ? ` · ${room.playerCount} players` : ""}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "10px",
                          fontWeight: 500,
                          letterSpacing: "0.8px",
                          textTransform: "uppercase",
                          color: room.type === "RECURRING" ? "#5ec97a" : TEXT_FAINT,
                          background:
                            room.type === "RECURRING"
                              ? "rgba(34,85,48,0.3)"
                              : "rgba(255,255,255,0.05)",
                          border: `1px solid ${room.type === "RECURRING" ? "rgba(60,160,80,0.25)" : BORDER}`,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          flexShrink: 0,
                        }}
                      >
                        {room.type === "RECURRING" ? "Recurring" : "Casual"}
                      </Box>
                    </Box>
                    {i < activeRooms.length - 1 && (
                      <Divider sx={{ borderColor: BORDER, mx: "18px" }} />
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* ── Activity feed placeholder ─────────────────────────────────── */}
          <Box sx={{ mt: "32px" }}>
            <SectionHeader title="Friend activity" />
            <Box
              sx={{
                background: BG_CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: "12px",
                padding: "40px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <GroupsIcon sx={{ fontSize: "32px", color: TEXT_FAINT }} />
              <Typography
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "14px",
                  color: TEXT_FAINT,
                  textAlign: "center",
                }}
              >
                Follow other players to see their activity here
              </Typography>
              <Button
                onClick={() => router.push("/users")}
                sx={{
                  background: "transparent",
                  border: `1px solid ${BORDER_MED}`,
                  borderRadius: "8px",
                  color: TEXT_DIM,
                  fontFamily: FONT_SANS,
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: "8px 18px",
                  textTransform: "none",
                  mt: "4px",
                  "&:hover": {
                    background: "rgba(180,140,60,0.08)",
                    color: TEXT,
                    borderColor: AMBER,
                  },
                }}
              >
                Find players
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

// ─── Server-side auth guard ───────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user) return { redirect: { destination: "/login", permanent: false } };

  const userId = Number((session.user as any).id);
  const username = (session.user as any).username ?? "Player";

  const { default: prisma } = await import("@data/db");

  const [activeRooms, sessionCount] = await Promise.all([
    prisma.rooms.findMany({
      where: { hostId: userId, isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, code: true, type: true, playerCount: true, createdAt: true },
    }),
    prisma.roomSessions.count({ where: { hostId: userId, status: "CLOSED" } }),
  ]);

  return {
    props: {
      username,
      activeRooms: activeRooms.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      nightsHosted: sessionCount,
    },
  };
};
