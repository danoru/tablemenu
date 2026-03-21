import EditIcon from "@mui/icons-material/Edit";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LinkIcon from "@mui/icons-material/Link";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { Box, Button, CircularProgress, Divider, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import superjson from "superjson";
import type { Users } from "@prisma/client";

import { authOptions } from "../api/auth/[...nextauth]";
import { MOCK_USER_LIBRARY } from "../../src/data/mockGameData";

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = "#e8c97a";
const GOLD_FADED = "rgba(232,201,122,0.35)";
const AMBER = "#c8962a";
const AMBER_HOVER = "#dba535";
const BG = "#0f0c08";
const BG_CARD = "#1a1610";
const BORDER = "rgba(180,140,60,0.15)";
const BORDER_MED = "rgba(180,140,60,0.28)";
const TEXT = "#f0e6cc";
const TEXT_DIM = "rgba(232,223,200,0.55)";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SERIF = "'Playfair Display', serif";
const FONT_SANS = "'DM Sans', sans-serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        sx={{
          fontFamily: FONT_SERIF,
          fontSize: "22px",
          fontWeight: 700,
          color: TEXT,
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT, mt: "3px" }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileUser extends Omit<Users, "password"> {}

interface Props {
  profileUser: ProfileUser;
  isSelf: boolean;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserProfilePage({
  profileUser,
  isSelf,
  isFollowing: initialIsFollowing,
  followerCount: initialFollowerCount,
  followingCount,
}: Props) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = React.useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = React.useState(initialFollowerCount);
  const [followLoading, setFollowLoading] = React.useState(false);

  const libraryPreview = MOCK_USER_LIBRARY.slice(0, 6);

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
      <Head>
        <title>{profileUser.username} — Tablekeeper</title>
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
              "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(34,85,48,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "860px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          {/* ── Profile header ───────────────────────────────────────── */}
          <Box
            sx={{
              background: BG_CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: "16px",
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
              {/* Avatar */}
              <Box
                sx={{
                  width: { xs: "64px", md: "80px" },
                  height: { xs: "64px", md: "80px" },
                  borderRadius: "50%",
                  background: avatarColour(profileUser.username),
                  border: `2px solid ${BORDER_MED}`,
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
                    color: "rgba(232,223,200,0.6)",
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
                      color: TEXT,
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
                        fontWeight: 500,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        color: AMBER,
                        background: "rgba(200,150,42,0.15)",
                        border: "1px solid rgba(200,150,42,0.25)",
                        padding: "3px 8px",
                        borderRadius: "10px",
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

                {/* Bio */}
                {profileUser.bio && (
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      fontWeight: 300,
                      color: TEXT_DIM,
                      lineHeight: 1.65,
                      mb: "12px",
                      maxWidth: "500px",
                    }}
                  >
                    {profileUser.bio}
                  </Typography>
                )}

                {/* Location + website */}
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
                      sx={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                      onClick={() => window.open(profileUser.website!, "_blank")}
                    >
                      <LinkIcon sx={{ fontSize: "14px", color: GOLD_FADED }} />
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "13px",
                          color: GOLD_FADED,
                          "&:hover": { color: GOLD },
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

              {/* Action buttons */}
              <Box sx={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                {isSelf ? (
                  <Button
                    startIcon={<EditIcon sx={{ fontSize: "14px !important" }} />}
                    onClick={() => router.push(`/players/${profileUser.username}/edit`)}
                    sx={{
                      background: "transparent",
                      border: `1px solid ${BORDER_MED}`,
                      borderRadius: "8px",
                      color: TEXT_DIM,
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 500,
                      padding: "8px 16px",
                      textTransform: "none",
                      "&:hover": {
                        background: "rgba(180,140,60,0.08)",
                        color: TEXT,
                        borderColor: AMBER,
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
                      borderRadius: "8px",
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 500,
                      padding: "8px 16px",
                      textTransform: "none",
                      transition: "all 0.15s",
                      ...(isFollowing
                        ? {
                            background: "transparent",
                            border: `1px solid ${BORDER_MED}`,
                            color: TEXT_DIM,
                            "&:hover": {
                              borderColor: "rgba(220,80,80,0.4)",
                              color: "rgba(220,120,120,0.9)",
                              background: "rgba(220,80,80,0.06)",
                            },
                          }
                        : {
                            background: AMBER,
                            border: "none",
                            color: "#0f0c08",
                            "&:hover": { background: AMBER_HOVER },
                          }),
                      "&.Mui-disabled": { opacity: 0.5 },
                    }}
                  >
                    {followLoading ? "" : isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </Box>
            </Box>

            {/* ── Stats row ──────────────────────────────────────────── */}
            <Divider sx={{ borderColor: BORDER, my: "24px" }} />
            <Box sx={{ display: "flex", gap: "32px" }}>
              <StatPill value={followerCount} label="followers" />
              <StatPill value={followingCount} label="following" />
              <StatPill value={MOCK_USER_LIBRARY.length} label="games owned" />
            </Box>
          </Box>

          {/* ── Library preview ──────────────────────────────────────── */}
          <Box>
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
                  color: TEXT,
                }}
              >
                Library
              </Typography>
              <Typography
                onClick={() => router.push(`/players/${profileUser.username}/library`)}
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "13px",
                  color: GOLD_FADED,
                  cursor: "pointer",
                  "&:hover": { color: GOLD },
                  transition: "color 0.15s",
                }}
              >
                View all {MOCK_USER_LIBRARY.length} games →
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
                  key={game.id}
                  onClick={() => router.push(`/players/${profileUser.username}/library`)}
                  sx={{
                    background: BG_CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "10px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "border-color 0.15s, transform 0.15s",
                    "&:hover": { borderColor: BORDER_MED, transform: "translateY(-2px)" },
                  }}
                >
                  {/* Art placeholder */}
                  <Box
                    sx={{
                      height: "80px",
                      background: gameColour(game.name),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: FONT_SERIF,
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "rgba(232,223,200,0.4)",
                        userSelect: "none",
                      }}
                    >
                      {initials(game.name)}
                    </Typography>
                  </Box>
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
                border: `1px solid ${BORDER}`,
                borderRadius: "10px",
                color: TEXT_FAINT,
                fontFamily: FONT_SANS,
                fontSize: "13px",
                fontWeight: 500,
                padding: "11px",
                textTransform: "none",
                "&:hover": {
                  background: "rgba(180,140,60,0.06)",
                  borderColor: BORDER_MED,
                  color: TEXT_DIM,
                },
              }}
            >
              View full library
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}

// ─── Data fetching ────────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.params as { username: string };
  const session = await getServerSession(context.req, context.res, authOptions);
  const currentUserId = session ? Number((session.user as any).id) : null;
  const currentUsername = session ? (session.user as any).username : null;

  const { default: prisma } = await import("../../src/data/db");

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

  const { _count, ...profileUser } = user;

  const serialized = superjson.serialize({
    profileUser: { ...profileUser },
    isSelf: currentUsername === username,
    isFollowing,
    followerCount: _count.followedBy,
    followingCount: _count.following,
  });

  return {
    props: serialized.json as any,
  };
};
