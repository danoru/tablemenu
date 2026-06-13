import GameGrid from "@/components/games/GameGrid";
import AddGameModal from "@/components/modals/AddGameModal";
import BGGImportModal from "@/components/modals/BGGImportModal";
import QuickGenModal from "@/components/modals/QuickGenModal";
import FilterChip from "@/components/ui/FilterChip";
import { getUserLibrary } from "@/data/games";
import { authOptions } from "@/lib/authOptions";
import {
  BORDER_INK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  SHADOW_HARD,
  SURFACE,
  TEXT_DIM,
  TEXT_FAINT,
} from "@/styles/theme";
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
  const [sortBy, setSortBy] = React.useState("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const filtered = React.useMemo(() => {
    let result = library;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortBy) {
        case "bggRating":
          return ((a.bggRating ?? 0) - (b.bggRating ?? 0)) * dir;
        case "complexity":
          return ((a.complexity ?? 0) - (b.complexity ?? 0)) * dir;
        case "minPlaytime":
          return (a.minPlaytime - b.minPlaytime) * dir;
        case "yearPublished":
          return ((a.yearPublished ?? 0) - (b.yearPublished ?? 0)) * dir;
        case "userStars":
          return ((a.userStars ?? 0) - (b.userStars ?? 0)) * dir;
        case "addedAt":
          return (new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()) * dir;
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });
  }, [library, search, sortBy, sortDir]);

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

      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Box
          sx={{
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
                  backgroundColor: "secondary.main",
                  border: BORDER_INK,
                  borderRadius: "999px",
                  boxShadow: SHADOW_HARD,
                  color: SURFACE,
                  fontFamily: FONT_SANS,
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "9px 18px",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "secondary.dark" },
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
                      backgroundColor: "primary.main",
                      border: BORDER_INK,
                      borderRadius: "999px",
                      boxShadow: SHADOW_HARD,
                      color: SURFACE,
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      fontWeight: 700,
                      padding: "9px 18px",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "primary.light" },
                    }}
                  >
                    Add Game
                  </Button>
                  <Button
                    onClick={() => setImportOpen(true)}
                    startIcon={<DownloadIcon />}
                    sx={{
                      backgroundColor: "background.paper",
                      border: BORDER_INK,
                      borderRadius: "999px",
                      boxShadow: SHADOW_HARD,
                      color: "text.primary",
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      fontWeight: 700,
                      padding: "9px 18px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "background.paper",
                        boxShadow: `4px 4px 0 ${INK}`,
                        transform: "translate(-1px, -1px)",
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
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              mb: "24px",
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "11px",
                fontWeight: 600,
                color: "primary.main",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                flexShrink: 0,
                mr: "4px",
              }}
            >
              Sort
            </Typography>
            {[
              { label: "Name", value: "name" },
              { label: "BGG Rating", value: "bggRating" },
              { label: "Complexity", value: "complexity" },
              { label: "Play time", value: "minPlaytime" },
              { label: "Year", value: "yearPublished" },
              { label: "My Rating", value: "userStars" },
              { label: "Date Added", value: "addedAt" },
            ].map((opt) => (
              <FilterChip
                key={opt.value}
                label={
                  sortBy === opt.value ? `${opt.label} ${sortDir === "asc" ? "↑" : "↓"}` : opt.label
                }
                active={sortBy === opt.value}
                onClick={() => {
                  if (sortBy === opt.value) {
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                  } else {
                    setSortBy(opt.value);
                    setSortDir("asc");
                  }
                }}
              />
            ))}
          </Box>

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
