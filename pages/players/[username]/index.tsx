import GameArt from "@/components/games/GameArt";
import CompatibilityCard from "@/components/players/CompatibilityCard";
import TasteProfileCard from "@/components/players/TasteProfileCard";
import { getUserGamesForTaste, getUserLibrary } from "@/data/games";
import { authOptions } from "@/lib/authOptions";
import { avatarColor } from "@/lib/helpers";
import { buildTasteProfile, type TasteProfile } from "@/services/tasteProfile";
import {
  BORDER_INK,
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  SHADOW_HARD,
  SHADOW_HARD_HOVER,
  SURFACE,
  TEAL,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_MUSTARD,
} from "@/styles/theme";
import EditIcon from "@mui/icons-material/Edit";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LinkIcon from "@mui/icons-material/Link";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { Box, Button, CircularProgress, Divider, Typography } from "@mui/material";
import Header from "@/components/layout/Header";
import { LibraryGame } from "@pages/api/games/library";
import type { Users } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import React from "react";
import superjson from "superjson";

function PlayerPill({
  value,
  label,
  onClick,
}: {
  value: number;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        textAlign: "center",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s",
        "&:hover": onClick
          ? {
              transform: "translateY(-1px)",
              "& .pill-value": { color: BRICK },
              "& .pill-label": { color: TEXT_DIM },
            }
          : undefined,
      }}
    >
      <Typography
        className="pill-value"
        sx={{
          fontFamily: FONT_SERIF,
          fontSize: "22px",
          fontWeight: 700,
          color: "text.primary",
          lineHeight: 1,
          transition: "color 0.15s",
        }}
      >
        {value}
      </Typography>
      <Typography
        className="pill-label"
        sx={{
          fontFamily: FONT_SANS,
          fontSize: "12px",
          color: TEXT_FAINT,
          mt: "3px",
          transition: "color 0.15s",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

interface ProfileUser extends Omit<Users, "password"> {}

interface Props {
  profileUser: ProfileUser;
  isSelf: boolean;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  library: LibraryGame[];
  wantToPlay: LibraryGame[];
  tasteProfile: TasteProfile;
  showCompatibility: boolean;
}

export default function UserProfilePage({
  profileUser,
  isSelf,
  isFollowing: initialIsFollowing,
  followerCount: initialFollowerCount,
  followingCount,
  library,
  wantToPlay,
  tasteProfile,
  showCompatibility,
}: Props) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = React.useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = React.useState(initialFollowerCount);
  const [followLoading, setFollowLoading] = React.useState(false);

  const libraryPreview = [...library]
    .sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      const aStars = a.userStars ?? -1;
      const bStars = b.userStars ?? -1;
      if (aStars !== bStars) return bStars - aStars;
      return b.addedAt.localeCompare(a.addedAt);
    })
    .slice(0, 6);
  const wantToPlayPreview = wantToPlay.slice(0, 6);

  async function handleFollow() {
    setFollowLoading(true);
    try {
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isFollowing ? "unfollow" : "follow",
          followingUserId: profileUser.id,
        }),
      });

      if (res.ok) {
        setIsFollowing((prev) => !prev);
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (err) {
      console.error("Follow action failed:", err);
    } finally {
      setFollowLoading(false);
    }
  }

  return (
    <>
      <Header
        title={`${profileUser.username} — Tablekeeper`}
        description={
          profileUser.bio
            ? profileUser.bio
            : `${profileUser.username}'s board game library on Tablekeeper — ${library.length} ${library.length === 1 ? "game" : "games"}${wantToPlay.length > 0 ? `, ${wantToPlay.length} on the wishlist` : ""}.`
        }
        type="profile"
      />

      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Box
          sx={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          <Box
            sx={{
              backgroundColor: "background.paper",
              border: BORDER_INK,
              borderRadius: "13px",
              boxShadow: SHADOW_HARD,
              padding: { xs: "28px 24px", md: "36px 40px" },
              mb: "24px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: "24px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <Box
                sx={{
                  width: { xs: "64px", md: "80px" },
                  height: { xs: "64px", md: "80px" },
                  borderRadius: "50%",
                  background: avatarColor(profileUser.username),
                  border: `2px solid ${INK}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_SERIF,
                    fontSize: { xs: "26px", md: "32px" },
                    fontWeight: 700,
                    color: "rgba(255,251,240,0.9)",
                    userSelect: "none",
                  }}
                >
                  {profileUser.username.slice(0, 1).toUpperCase()}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    mb: "6px",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontSize: { xs: "24px", md: "30px" },
                      fontWeight: 900,
                      color: "text.primary",
                      letterSpacing: "-0.3px",
                      lineHeight: 1,
                    }}
                  >
                    {profileUser.username}
                  </Typography>

                  {profileUser.badge && profileUser.badge !== "USER" && (
                    <Box
                      sx={{
                        fontFamily: FONT_SANS,
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        color: INK,
                        background: TINT_MUSTARD,
                        border: `1.5px solid ${INK}`,
                        padding: "3px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      {profileUser.badge}
                    </Box>
                  )}
                </Box>

                {(profileUser.firstName || profileUser.lastName) && (
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      color: TEXT_DIM,
                      mb: "8px",
                    }}
                  >
                    {[profileUser.firstName, profileUser.lastName].filter(Boolean).join(" ")}
                  </Typography>
                )}

                {profileUser.bio && (
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      fontWeight: 400,
                      color: TEXT_DIM,
                      lineHeight: 1.65,
                      mb: "12px",
                      maxWidth: "500px",
                    }}
                  >
                    {profileUser.bio}
                  </Typography>
                )}

                <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {profileUser.location && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <LocationOnIcon sx={{ fontSize: "14px", color: TEXT_FAINT }} />
                      <Typography
                        sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}
                      >
                        {profileUser.location}
                      </Typography>
                    </Box>
                  )}
                  {profileUser.website && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(profileUser.website!, "_blank")}
                    >
                      <LinkIcon sx={{ fontSize: "14px", color: BRICK }} />
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "13px",
                          fontWeight: 500,
                          color: BRICK,
                          "&:hover": { textDecoration: "underline" },
                          transition: "color 0.15s",
                        }}
                      >
                        {profileUser.website.replace(/^https?:\/\//, "")}
                      </Typography>
                    </Box>
                  )}
                  <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
                    Joined{" "}
                    {new Date(profileUser.joinDate).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                {isSelf ? (
                  <Button
                    startIcon={<EditIcon sx={{ fontSize: "14px !important" }} />}
                    onClick={() => router.push(`/players/${profileUser.username}/settings`)}
                    sx={{
                      backgroundColor: "background.paper",
                      border: `1.5px solid ${INK}`,
                      borderRadius: "999px",
                      boxShadow: `2px 2px 0 ${INK}`,
                      color: "text.primary",
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 700,
                      padding: "8px 16px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "background.paper",
                        boxShadow: `3px 3px 0 ${INK}`,
                        transform: "translate(-1px, -1px)",
                      },
                    }}
                  >
                    Edit profile
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    startIcon={
                      followLoading ? (
                        <CircularProgress size={12} sx={{ color: "inherit" }} />
                      ) : isFollowing ? (
                        <PersonRemoveIcon sx={{ fontSize: "14px !important" }} />
                      ) : (
                        <PersonAddIcon sx={{ fontSize: "14px !important" }} />
                      )
                    }
                    sx={{
                      borderRadius: "999px",
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 700,
                      padding: "8px 16px",
                      textTransform: "none",
                      transition: "all 0.15s",
                      ...(isFollowing
                        ? {
                            background: "transparent",
                            border: "1.5px solid rgba(51,39,26,0.4)",
                            color: TEXT_DIM,
                            "&:hover": {
                              borderColor: BRICK,
                              color: BRICK,
                              background: "rgba(192,69,44,0.06)",
                            },
                          }
                        : {
                            backgroundColor: "primary.main",
                            border: `1.5px solid ${INK}`,
                            boxShadow: `2px 2px 0 ${INK}`,
                            color: SURFACE,
                            "&:hover": { backgroundColor: "primary.light" },
                          }),
                      "&.Mui-disabled": { opacity: 0.5 },
                    }}
                  >
                    {followLoading ? "" : isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </Box>
            </Box>

            <Divider sx={{ borderColor: "divider", my: "24px" }} />
            <Box sx={{ display: "flex", gap: "32px" }}>
              <PlayerPill
                label="followers"
                value={followerCount}
                onClick={() => router.push(`/players/${profileUser.username}/followers`)}
              />
              <PlayerPill
                label="following"
                value={followingCount}
                onClick={() => router.push(`/players/${profileUser.username}/following`)}
              />
              <PlayerPill
                label="games owned"
                value={library.length}
                onClick={() => router.push(`/players/${profileUser.username}/library`)}
              />
              {wantToPlay.length > 0 && (
                <PlayerPill
                  label="want to play"
                  value={wantToPlay.length}
                  onClick={() => router.push(`/players/${profileUser.username}/library`)}
                />
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "12px",
              flexDirection: { xs: "column", sm: "row" },
              mb: "28px",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TasteProfileCard
                isSelf={isSelf}
                profile={tasteProfile}
                username={profileUser.username}
              />
            </Box>
            {showCompatibility && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <CompatibilityCard username={profileUser.username} />
              </Box>
            )}
          </Box>

          <Box sx={{ mb: "28px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: "16px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                Library
              </Typography>
              <Typography
                onClick={() => router.push(`/players/${profileUser.username}/library`)}
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "13px",
                  fontWeight: 500,
                  color: BRICK,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                  transition: "color 0.15s",
                }}
              >
                View all {library.length} games →
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "10px",
                mb: "12px",
              }}
            >
              {libraryPreview.map((game) => (
                <Box
                  key={game.gameId}
                  onClick={() => router.push(`/games/${game.gameId}`)}
                  sx={{
                    position: "relative",
                    backgroundColor: "background.paper",
                    border: BORDER_INK,
                    borderRadius: "10px",
                    boxShadow: SHADOW_HARD,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "box-shadow 0.15s, transform 0.15s",
                    "&:hover": {
                      boxShadow: SHADOW_HARD_HOVER,
                      transform: "translate(-2px, -2px)",
                    },
                  }}
                >
                  <GameArt flush game={game} size={120} />
                  <Box sx={{ padding: "8px 10px" }}>
                    <Typography
                      sx={{
                        fontFamily: FONT_SANS,
                        fontSize: "11px",
                        fontWeight: 500,
                        color: TEXT_DIM,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {game.name}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Button
              fullWidth
              startIcon={<LibraryBooksIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => router.push(`/players/${profileUser.username}/library`)}
              sx={{
                background: "transparent",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "10px",
                color: TEXT_FAINT,
                fontFamily: FONT_SANS,
                fontSize: "13px",
                fontWeight: 500,
                padding: "11px",
                textTransform: "none",
                "&:hover": {
                  background: "rgba(51,39,26,0.04)",
                  borderColor: INK,
                  color: "text.primary",
                },
              }}
            >
              View full library
            </Button>
          </Box>

          {wantToPlay.length > 0 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  mb: "16px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    Want to Play
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: "10px",
                }}
              >
                {wantToPlayPreview.map((game) => (
                  <Box
                    key={game.gameId}
                    onClick={() => router.push(`/games/${game.gameId}`)}
                    sx={{
                      position: "relative",
                      backgroundColor: "background.paper",
                      border: `2px solid ${TEAL}`,
                      borderRadius: "10px",
                      boxShadow: `3px 3px 0 ${TEAL}`,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "box-shadow 0.15s, transform 0.15s",
                      "&:hover": {
                        boxShadow: `5px 5px 0 ${TEAL}`,
                        transform: "translate(-2px, -2px)",
                      },
                    }}
                  >
                    <GameArt flush game={game} size={120} />

                    <Box sx={{ padding: "8px 10px" }}>
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "11px",
                          fontWeight: 500,
                          color: TEXT_DIM,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {game.name}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.params as { username: string };
  const session = await getServerSession(context.req, context.res, authOptions);
  const currentUserId = session ? Number((session.user as any).id) : null;
  const currentUsername = session ? (session.user as any).username : null;

  const { default: prisma } = await import("@data/db");

  const user = await prisma.users.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: false,
      bio: true,
      location: true,
      website: true,
      image: true,
      badge: true,
      joinDate: true,
      _count: {
        select: {
          followedBy: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return { notFound: true };
  }

  const [library, tasteGames] = await Promise.all([
    getUserLibrary(user.id),
    getUserGamesForTaste(user.id),
  ]);
  const wantToPlay = library.filter((g) => g.isWishlist);
  const tasteProfile = buildTasteProfile(tasteGames);

  let isFollowing = false;
  if (currentUserId && currentUserId !== user.id) {
    const follow = await prisma.following.findUnique({
      where: {
        userId_followingUserId: {
          userId: currentUserId,
          followingUserId: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const isSelf = currentUsername === username;
  const showCompatibility = !!currentUserId && !isSelf;

  const { _count, ...profileUser } = user;

  const serialized = superjson.serialize({
    profileUser: { ...profileUser },
    isSelf,
    isFollowing,
    followerCount: _count.followedBy,
    followingCount: _count.following,
    library,
    wantToPlay,
    tasteProfile,
    showCompatibility,
  });

  return {
    props: serialized.json as any,
  };
};
