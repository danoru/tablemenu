import UserListRow, { UserListEntry } from "@/components/players/UserListRow";
import { authOptions } from "@/lib/authOptions";
import { BORDER_AMBER, FONT_SANS, FONT_SERIF, TEXT_DIM, TEXT_FAINT } from "@/styles/theme";
import { Box, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";

interface Props {
  profileUsername: string;
  isAuthenticated: boolean;
  currentUsername: string | null;
  followers: UserListEntry[];
}

export default function FollowersPage({
  profileUsername,
  isAuthenticated,
  currentUsername,
  followers,
}: Props) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{profileUsername}'s Followers — Tablekeeper</title>
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
              "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(34,85,48,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "720px",
            margin: "0 auto",
            padding: { xs: "28px 16px", md: "44px 32px" },
          }}
        >
          <Typography
            onClick={() => router.push(`/players/${profileUsername}`)}
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "12px",
              fontWeight: 500,
              color: TEXT_FAINT,
              letterSpacing: "1px",
              textTransform: "uppercase",
              mb: "20px",
              cursor: "pointer",
              "&:hover": { color: TEXT_DIM },
              display: "inline-block",
            }}
          >
            ← {profileUsername}'s profile
          </Typography>

          <Box sx={{ mb: "28px" }}>
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: { xs: "28px", md: "34px" },
                fontWeight: 900,
                color: "text.primary",
                lineHeight: 1.1,
                letterSpacing: "-0.5px",
              }}
            >
              Followers
            </Typography>
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT, mt: "4px" }}
            >
              {followers.length} {followers.length === 1 ? "person follows" : "people follow"}{" "}
              {profileUsername}
            </Typography>
          </Box>

          {followers.length === 0 ? (
            <Box
              sx={{
                border: `1px dashed ${BORDER_AMBER}`,
                borderRadius: "12px",
                padding: "40px 20px",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_DIM }}>
                No followers yet.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {followers.map((entry) => (
                <UserListRow
                  key={entry.id}
                  entry={entry}
                  isAuthenticated={isAuthenticated}
                  isSelf={entry.username === currentUsername}
                />
              ))}
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
  const currentUsername = session ? ((session.user as any).username as string) : null;

  const { default: prisma } = await import("@data/db");

  const profileUser = await prisma.users.findUnique({
    where: { username },
    select: { id: true, username: true },
  });

  if (!profileUser) {
    return { notFound: true };
  }

  const rows = await prisma.following.findMany({
    where: { followingUserId: profileUser.id },
    orderBy: { addedAt: "desc" },
    select: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          image: true,
          bio: true,
        },
      },
    },
  });

  let followingSet = new Set<number>();
  if (currentUserId) {
    const followingRows = await prisma.following.findMany({
      where: {
        userId: currentUserId,
        followingUserId: { in: rows.map((r) => r.user.id) },
      },
      select: { followingUserId: true },
    });
    followingSet = new Set(followingRows.map((r) => r.followingUserId));
  }

  const followers: UserListEntry[] = rows.map((r) => ({
    id: r.user.id,
    username: r.user.username,
    firstName: r.user.firstName,
    lastName: r.user.lastName,
    image: r.user.image,
    bio: r.user.bio,
    isFollowing: followingSet.has(r.user.id),
  }));

  return {
    props: {
      profileUsername: profileUser.username,
      isAuthenticated: !!currentUserId,
      currentUsername,
      followers,
    },
  };
};
