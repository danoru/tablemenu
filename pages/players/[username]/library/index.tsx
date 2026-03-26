import { authOptions } from "@/lib/authOptions";
import AddGameModal from "@/components/modals/AddGameModal";
import QuickGenModal from "@/components/modals/QuickGenModal";
import { LibraryGame } from "@pages/api/games/library";
import AddIcon from "@mui/icons-material/Add";
import CasinoIcon from "@mui/icons-material/Casino";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { getUserLibrary } from "@/data/games";

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Game art placeholder ─────────────────────────────────────────────────────

function GameArt({ game, size = 120 }: { game: LibraryGame; size?: number }) {
  if (game.imageUrl) {
    return (
      <Box
        component="img"
        src={game.imageUrl}
        alt={game.name}
        sx={{ width: size, height: size, objectFit: "cover", borderRadius: "8px 8px 0 0" }}
      />
    );
  }
  return (
    <Box
      sx={{
        width: size,
        height: size,
        background: gameColour(game.name),
        borderRadius: "8px 8px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${BORDER}`,
        borderBottom: "none",
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT_SERIF,
          fontSize: size > 80 ? "28px" : "18px",
          fontWeight: 700,
          color: "rgba(232,223,200,0.5)",
          userSelect: "none",
        }}
      >
        {initials(game.name)}
      </Typography>
    </Box>
  );
}

// ─── Game card ────────────────────────────────────────────────────────────────

function GameCard({ game }: { game: LibraryGame }) {
  return (
    <Box
      sx={{
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: "10px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s, transform 0.2s",
        "&:hover": { borderColor: BORDER_MED, transform: "translateY(-2px)" },
      }}
    >
      <GameArt game={game} size={120} />
      <Box sx={{ padding: "10px 12px 12px", flex: 1 }}>
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "13px",
            fontWeight: 500,
            color: TEXT,
            lineHeight: 1.35,
            mb: "6px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {game.name}
        </Typography>
        <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}>
          {game.minPlayers === game.maxPlayers
            ? `${game.minPlayers} players`
            : `${game.minPlayers}–${game.maxPlayers} players`}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  isSelf: boolean;
  profileUsername: string;
  userGames: LibraryGame[];
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UserLibraryPage({ isSelf, profileUsername, userGames }: Props) {
  const router = useRouter();
  const [library, setLibrary] = React.useState<LibraryGame[]>(userGames);
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [quickGenOpen, setQuickGenOpen] = React.useState(false);

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

      <Box sx={{ background: BG, minHeight: "100vh", position: "relative" }}>
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
          {/* Back link */}
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

          {/* Header */}
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
                  color: TEXT,
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
                  color: GREEN_BRIGHT,
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

              {/* Only show Add button to library owner */}
              {isSelf && (
                <Button
                  onClick={() => setAddOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{
                    background: AMBER,
                    borderRadius: "8px",
                    color: "#0f0c08",
                    fontFamily: FONT_SANS,
                    fontSize: "14px",
                    fontWeight: 500,
                    padding: "9px 18px",
                    textTransform: "none",
                    "&:hover": { background: AMBER_HOVER },
                  }}
                >
                  Add game
                </Button>
              )}
            </Box>
          </Box>

          {/* Search */}
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
              color: TEXT,
              mb: "28px",
              background: "rgba(255,255,255,0.03)",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: BORDER_MED },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: AMBER,
                borderWidth: "1px",
              },
              "& input::placeholder": { color: TEXT_FAINT },
            }}
          />

          {/* Empty search state */}
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

          {/* Game grid */}
          {filtered.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(auto-fill, minmax(130px, 1fr))",
                  sm: "repeat(auto-fill, minmax(150px, 1fr))",
                  md: "repeat(auto-fill, minmax(160px, 1fr))",
                },
                gap: "14px",
              }}
            >
              {filtered.map((game) => (
                <GameCard key={game.gameId} game={game} />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {isSelf && (
        <AddGameModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={handleAddGame} />
      )}

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
