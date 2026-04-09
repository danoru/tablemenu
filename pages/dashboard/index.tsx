import {
  BORDER_AMBER,
  FONT_SANS,
  FONT_SERIF,
  GOLD,
  GOLD_FADED,
  TEXT_DIM,
  TEXT_FAINT,
} from "@/styles/theme";
import StatCard from "@/components/ui/StatCard";
import GameArt from "@/components/games/GameArt";
import { getUserLibrary } from "@/data/games";
import { authOptions } from "@/lib/authOptions";
import CasinoIcon from "@mui/icons-material/Casino";
import GroupsIcon from "@mui/icons-material/Groups";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { Box, Button, Divider, Typography } from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";

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
      <Typography
        sx={{ fontFamily: FONT_SERIF, fontSize: "20px", fontWeight: 700, color: "text.primary" }}
      >
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

interface DashboardProps {
  activeRooms: {
    id: number;
    name: string;
    code: string;
    type: string;
    playerCount: number | null;
    createdAt: string;
  }[];
  library: LibraryGame[];
  nightsHosted: number;
  username: string;
}

export default function DashboardPage({
  activeRooms,
  library,
  nightsHosted,
  username,
}: DashboardProps) {
  const router = useRouter();

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
            maxWidth: "1100px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
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
                color: "text.primary",
                lineHeight: 1.05,
                letterSpacing: "-0.5px",
              }}
            >
              {username}
            </Typography>
          </Box>

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
                  color: "text.primary",
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
                backgroundColor: "primary.main",
                borderRadius: "8px",
                color: "background.default",
                fontFamily: FONT_SANS,
                fontSize: "15px",
                fontWeight: 500,
                padding: "12px 24px",
                textTransform: "none",
                flexShrink: 0,
                "&:hover": { backgroundColor: "primary.light" },
              }}
            >
              Quick Gen
            </Button>
          </Box>

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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: "24px",
            }}
          >
            <Box>
              <SectionHeader
                title="Recently added"
                action="View library"
                onAction={() => router.push(`/players/${username}/library`)}
              />
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {recentGames.map((game, i) => (
                  <Box key={game.gameId}>
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
                      <GameArt game={game} size={36} />
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "text.primary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {game.name}
                      </Typography>
                    </Box>
                    {i < recentGames.length - 1 && (
                      <Divider sx={{ borderColor: "divider", mx: "18px" }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
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
                      border: `1px solid ${BORDER_AMBER}`,
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
                        color: "text.primary",
                        borderColor: "primary.main",
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
                            color: "text.primary",
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
                          color: room.type === "RECURRING" ? "secondary.light" : TEXT_FAINT,
                          background:
                            room.type === "RECURRING"
                              ? "rgba(34,85,48,0.3)"
                              : "rgba(255,255,255,0.05)",
                          border: "1px solid",
                          borderColor: `${room.type === "RECURRING" ? "rgba(60,160,80,0.25)" : "divider"}`,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          flexShrink: 0,
                        }}
                      >
                        {room.type === "RECURRING" ? "Recurring" : "Casual"}
                      </Box>
                    </Box>
                    {i < activeRooms.length - 1 && (
                      <Divider sx={{ borderColor: "divider", mx: "18px" }} />
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Box>

          <Box sx={{ mt: "32px" }}>
            <SectionHeader title="Friend activity" />
            <Box
              sx={{
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
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
                  border: `1px solid ${BORDER_AMBER}`,
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
                    color: "text.primary",
                    borderColor: "primary.main",
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

  const library = await getUserLibrary(userId);

  return {
    props: {
      activeRooms: activeRooms.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      library,
      nightsHosted: sessionCount,
      username,
    },
  };
};
