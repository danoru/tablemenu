import GameGrid from "@/components/games/GameGrid";
import AddGameModal from "@/components/modals/AddGameModal";
import BGGImportModal from "@/components/modals/BGGImportModal";
import QuickGenModal from "@/components/modals/QuickGenModal";
import { getUserLibrary } from "@/data/games";
import { authOptions } from "@/lib/authOptions";
import { BORDER_AMBER, FONT_SANS, FONT_SERIF, TEXT_DIM, TEXT_FAINT } from "@/styles/theme";
import { LibraryGame } from "@pages/api/games/library";
import AddIcon from "@mui/icons-material/Add";
import CasinoIcon from "@mui/icons-material/Casino";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  isSelf: boolean;
  profileUsername: string;
  userGames: LibraryGame[];
}

export default function UserLibraryPage({ isSelf, profileUsername, userGames }: Props) {
  const router = useRouter();
  const [library, setLibrary] = React.useState<LibraryGame[]>(userGames);
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [quickGenOpen, setQuickGenOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return library;
    const q = search.toLowerCase();
    return library.filter((g) => g.name.toLowerCase().includes(q));
  }, [library, search]);

  function handleAddGame(game: LibraryGame) {
    setLibrary((prev) => {
      if (prev.find((g) => g.gameId === game.gameId)) return prev;
      return [game, ...prev];
    });
  }

  return (
    <>
      <Head>
        <title>{profileUsername}'s Library — Tablekeeper</title>
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
              "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(34,85,48,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1200px",
            margin: "0 auto",
            padding: { xs: "24px 16px", md: "40px 32px" },
          }}
        >
          <Typography
            onClick={() => router.push(`/users/${profileUsername}`)}
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

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: "16px",
              mb: "32px",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: { xs: "30px", md: "38px" },
                  fontWeight: 900,
                  color: "text.primary",
                  lineHeight: 1.1,
                  letterSpacing: "-0.5px",
                }}
              >
                {isSelf ? "My Library" : `${profileUsername}'s Library`}
              </Typography>
              <Typography
                sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT, mt: "4px" }}
              >
                {library.length} game{library.length !== 1 ? "s" : ""}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              <Button
                onClick={() => setQuickGenOpen(true)}
                startIcon={<CasinoIcon />}
                sx={{
                  background: "rgba(34,85,48,0.25)",
                  border: "1px solid rgba(60,160,80,0.3)",
                  borderRadius: "8px",
                  color: "secondary.light",
                  fontFamily: FONT_SANS,
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "9px 18px",
                  textTransform: "none",
                  "&:hover": { background: "rgba(34,85,48,0.4)" },
                }}
              >
                Quick Gen
              </Button>
              {isSelf && (
                <>
                  <Button
                    onClick={() => setAddOpen(true)}
                    startIcon={<AddIcon />}
                    sx={{
                      background: "primary.main",
                      borderRadius: "8px",
                      color: "background.default",
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      fontWeight: 500,
                      padding: "9px 18px",
                      textTransform: "none",
                      "&:hover": { background: "primary.light" },
                    }}
                  >
                    Add Game
                  </Button>
                  <Button
                    onClick={() => setImportOpen(true)}
                    startIcon={<DownloadIcon />}
                    sx={{
                      background: "transparent",
                      border: `1px solid ${BORDER_AMBER}`,
                      borderRadius: "8px",
                      color: TEXT_DIM,
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      fontWeight: 500,
                      padding: "9px 18px",
                      textTransform: "none",
                      "&:hover": {
                        background: "rgba(180,140,60,0.08)",
                        color: "text.primary",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    Import from BGG
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <OutlinedInput
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isSelf ? "Search your library…" : `Search ${profileUsername}'s library…`}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ color: TEXT_FAINT, fontSize: "18px" }} />
              </InputAdornment>
            }
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "14px",
              color: "text.primary",
              mb: "28px",
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

          {filtered.length === 0 && (
            <Box sx={{ textAlign: "center", py: "64px" }}>
              <Typography sx={{ fontFamily: FONT_SERIF, fontSize: "20px", color: TEXT_DIM }}>
                No games match "{search}"
              </Typography>
              <Typography
                sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT, mt: "8px" }}
              >
                {isSelf ? "Try a different search or add a new game" : "Try a different search"}
              </Typography>
            </Box>
          )}

          <GameGrid games={filtered} />
        </Box>
      </Box>

      {isSelf && (
        <AddGameModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={handleAddGame} />
      )}

      <BGGImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => router.replace(router.asPath)}
      />

      <QuickGenModal open={quickGenOpen} onClose={() => setQuickGenOpen(false)} library={library} />
    </>
  );
}

// ─── Server-side props ────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.params as { username: string };
  const session = await getServerSession(context.req, context.res, authOptions);
  const currentUsername = session ? (session.user as any).username : null;

  // Verify the profile user exists
  const { default: prisma } = await import("@data/db");
  const user = await prisma.users.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) return { notFound: true };

  const userGames = await getUserLibrary(user.id);
  return {
    props: {
      isSelf: currentUsername === username,
      userGames,
      profileUsername: username,
    },
  };
};
