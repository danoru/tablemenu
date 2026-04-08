import { authOptions } from "@/lib/authOptions";
import { getAllUsers } from "@data/users";
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
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import SearchIcon from "@mui/icons-material/Search";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  OutlinedInput,
  Tooltip,
  Typography,
} from "@mui/material";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import superjson from "superjson";
import type { Users } from "@prisma/client";

function avatarColour(name: string): string {
  const palette = [
    "rgba(34,85,48,0.6)",
    "rgba(100,60,20,0.6)",
    "rgba(60,40,80,0.6)",
    "rgba(20,60,90,0.6)",
    "rgba(90,30,30,0.6)",
    "rgba(40,70,60,0.6)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function avatarInitial(name: string): string {
  return name.slice(0, 1).toUpperCase();
}

interface Props {
  users: Users[];
  currentUserId: number | null;
  currentUsername: string | null;
  initialFollowing: number[];
}

export default function UsersPage({
  users,
  currentUserId,
  currentUsername,
  initialFollowing,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [following, setFollowing] = React.useState<Set<number>>(new Set(initialFollowing));
  const [loadingId, setLoadingId] = React.useState<number | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    return users
      .filter((u) => u.username !== "guest")
      .filter((u) => !q || u.username.toLowerCase().includes(q));
  }, [users, search]);

  async function handleFollow(targetUser: Users) {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    const isFollowing = following.has(targetUser.id);
    setLoadingId(targetUser.id);

    try {
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isFollowing ? "unfollow" : "follow",
          followingUserId: targetUser.id,
        }),
      });

      if (res.ok) {
        setFollowing((prev) => {
          const next = new Set(prev);
          isFollowing ? next.delete(targetUser.id) : next.add(targetUser.id);
          return next;
        });
      }
    } catch (err) {
      console.error("Follow action failed:", err);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Players — Tablekeeper</title>
      </Head>

      <Box sx={{ background: "background.default", minHeight: "100vh", position: "relative" }}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "40vh",
            background:
              "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(34,85,48,0.15) 0%, transparent 70%)",
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
          <Box sx={{ mb: "32px" }}>
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: { xs: "32px", md: "40px" },
                fontWeight: 900,
                color: "text.primary",
                lineHeight: 1.05,
                letterSpacing: "-0.5px",
                mb: "8px",
              }}
            >
              Players
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "15px",
                fontWeight: 300,
                color: TEXT_DIM,
              }}
            >
              Gamers, collectors, and strategists — browse the community.
            </Typography>
          </Box>

          <OutlinedInput
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players…"
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ color: TEXT_FAINT, fontSize: "18px" }} />
              </InputAdornment>
            }
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "14px",
              color: "text.primary",
              mb: "24px",
              background: "rgba(255,255,255,0.03)",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: BORDER_AMBER },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
                borderWidth: "1px",
              },
              "& input::placeholder": { color: TEXT_FAINT },
            }}
          />

          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "12px",
              color: TEXT_FAINT,
              letterSpacing: "0.5px",
              mb: "12px",
            }}
          >
            {filtered.length} player{filtered.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </Typography>

          <Box
            sx={{
              background: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            {filtered.length === 0 ? (
              <Box sx={{ padding: "48px 24px", textAlign: "center" }}>
                <Typography sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT }}>
                  No players found{search ? ` matching "${search}"` : ""}
                </Typography>
              </Box>
            ) : (
              filtered.map((user, i) => {
                const isSelf = user.username === currentUsername;
                const isFollowing = following.has(user.id);
                const isLoading = loadingId === user.id;

                return (
                  <Box
                    key={user.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "14px 20px",
                      borderBottom: i < filtered.length - 1 ? "1px solid divider" : "none",
                      transition: "background 0.15s",
                      "&:hover": { background: "rgba(255,255,255,0.025)" },
                    }}
                  >
                    <Box
                      onClick={() => router.push(`/players/${user.username}`)}
                      sx={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: avatarColour(user.username),
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                        "&:hover": { borderColor: GOLD_FADED },
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: FONT_SERIF,
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "rgba(232,223,200,0.6)",
                          userSelect: "none",
                        }}
                      >
                        {avatarInitial(user.username)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                      onClick={() => router.push(`/players/${user.username}`)}
                    >
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "15px",
                          fontWeight: 500,
                          color: "text.primary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.username}
                        {isSelf && (
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
                              border: "1px solid rgba(200,150,42,0.25)",
                              padding: "2px 7px",
                              borderRadius: "10px",
                              verticalAlign: "middle",
                            }}
                          >
                            You
                          </Box>
                        )}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "12px",
                          color: TEXT_FAINT,
                          mt: "1px",
                        }}
                      >
                        Joined{" "}
                        {new Date(user.joinDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>

                    <Tooltip title={`${user.username}'s library`} placement="top">
                      <Box
                        onClick={() => router.push(`/players/${user.username}/library`)}
                        sx={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "8px",
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: TEXT_FAINT,
                          transition: "all 0.15s",
                          "&:hover": {
                            borderColor: GOLD_FADED,
                            color: GOLD,
                            background: "rgba(232,201,122,0.06)",
                          },
                        }}
                      >
                        <LibraryBooksIcon sx={{ fontSize: "16px" }} />
                      </Box>
                    </Tooltip>

                    {!isSelf && (
                      <Button
                        onClick={() => handleFollow(user)}
                        disabled={isLoading}
                        startIcon={
                          isLoading ? (
                            <CircularProgress size={12} sx={{ color: "inherit" }} />
                          ) : isFollowing ? (
                            <PersonRemoveIcon sx={{ fontSize: "14px !important" }} />
                          ) : (
                            <PersonAddIcon sx={{ fontSize: "14px !important" }} />
                          )
                        }
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "12px",
                          fontWeight: 500,
                          textTransform: "none",
                          borderRadius: "7px",
                          padding: "6px 13px",
                          minWidth: "90px",
                          transition: "all 0.15s",
                          ...(isFollowing
                            ? {
                                background: "transparent",
                                border: `1px solid ${BORDER_AMBER}`,
                                color: TEXT_DIM,
                                "&:hover": {
                                  borderColor: "rgba(220,80,80,0.4)",
                                  color: "rgba(220,120,120,0.9)",
                                  background: "rgba(220,80,80,0.06)",
                                },
                              }
                            : {
                                background: "primary.main",
                                border: "none",
                                color: "background.default",
                                "&:hover": { background: "primary.light" },
                              }),
                          "&.Mui-disabled": {
                            opacity: 0.5,
                          },
                        }}
                      >
                        {isLoading ? "" : isFollowing ? "Following" : "Follow"}
                      </Button>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const currentUserId = session ? Number((session.user as any).id) : null;
  const currentUsername = session ? ((session.user as any).username ?? null) : null;

  const users = await getAllUsers();

  let initialFollowing: number[] = [];
  if (currentUserId) {
    const { default: prisma } = await import("@data/db");
    const rows = await prisma.following.findMany({
      where: { userId: currentUserId },
      select: { followingUserId: true },
    });
    initialFollowing = rows.map((r) => r.followingUserId);
  }

  const serialized = superjson.serialize({ users });

  return {
    props: {
      ...(serialized.json as any),
      currentUserId,
      currentUsername,
      initialFollowing,
    },
  };
};
