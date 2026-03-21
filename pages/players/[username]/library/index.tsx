import { authOptions } from "@api/auth/[...nextauth]";
import { MOCK_USER_LIBRARY, MOCK_SEARCH_POOL, MockGame } from "@data/mockGameData";
import AddIcon from "@mui/icons-material/Add";
import CasinoIcon from "@mui/icons-material/Casino";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Slide,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = "#e8c97a";
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

function weightedPick(games: MockGame[]): MockGame {
  const total = games.length;
  let rand = Math.random() * total;
  for (const g of games) {
    rand -= 1;
    if (rand <= 0) return g;
  }
  return games[games.length - 1];
}

// ─── Game art placeholder ─────────────────────────────────────────────────────

function GameArt({ game, size = 120 }: { game: MockGame; size?: number }) {
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

function GameCard({ game }: { game: MockGame }) {
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

// ─── Slide transition ─────────────────────────────────────────────────────────

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ─── Add Game modal ───────────────────────────────────────────────────────────

function AddGameModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (game: MockGame) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [added, setAdded] = React.useState<Set<number>>(new Set());

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_SEARCH_POOL.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  function handleAdd(game: MockGame) {
    onAdd(game);
    setAdded((prev) => new Set(prev).add(game.id));
  }

  function handleClose() {
    setQuery("");
    setAdded(new Set());
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={SlideUp}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          background: BG_ELEVATED,
          border: `1px solid ${BORDER_MED}`,
          borderRadius: "14px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        },
      }}
    >
      <DialogContent sx={{ padding: "28px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "20px",
          }}
        >
          <Typography
            sx={{ fontFamily: FONT_SERIF, fontSize: "22px", fontWeight: 700, color: TEXT }}
          >
            Add a game
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: TEXT_DIM }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <OutlinedInput
          autoFocus
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by game title…"
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ color: TEXT_FAINT, fontSize: "18px" }} />
            </InputAdornment>
          }
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "14px",
            color: TEXT,
            mb: "16px",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER_MED },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: AMBER },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: AMBER,
              borderWidth: "1px",
            },
            "& input::placeholder": { color: TEXT_FAINT },
          }}
        />

        {query.trim() === "" && (
          <Box sx={{ textAlign: "center", py: "32px" }}>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
              Start typing to search for games
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "12px",
                color: TEXT_FAINT,
                mt: "4px",
                fontStyle: "italic",
              }}
            >
              BGG-powered search coming soon
            </Typography>
          </Box>
        )}

        {query.trim() !== "" && results.length === 0 && (
          <Box sx={{ textAlign: "center", py: "32px" }}>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
              No games found for "{query}"
            </Typography>
          </Box>
        )}

        {results.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {results.map((game, i) => {
              const isAdded = added.has(game.id);
              return (
                <Box
                  key={game.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                    border: `1px solid ${isAdded ? "rgba(94,201,122,0.2)" : "transparent"}`,
                    "&:hover": { background: "rgba(180,140,60,0.06)" },
                  }}
                >
                  <GameArt game={game} size={40} />
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
                      {game.name}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => !isAdded && handleAdd(game)}
                    disabled={isAdded}
                    size="small"
                    sx={{
                      minWidth: "72px",
                      fontFamily: FONT_SANS,
                      fontSize: "12px",
                      fontWeight: 500,
                      textTransform: "none",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      ...(isAdded
                        ? {
                            background: "rgba(94,201,122,0.15)",
                            color: GREEN_BRIGHT,
                            border: `1px solid rgba(94,201,122,0.25)`,
                          }
                        : {
                            background: AMBER,
                            color: "#0f0c08",
                            "&:hover": { background: AMBER_HOVER },
                          }),
                    }}
                  >
                    {isAdded ? "Added ✓" : "Add"}
                  </Button>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Quick Gen modal ──────────────────────────────────────────────────────────

const TIME_OPTIONS = [
  { label: "Any", min: 0, max: Infinity },
  { label: "< 30 min", min: 0, max: 30 },
  { label: "30–60 min", min: 30, max: 60 },
  { label: "1–2 hrs", min: 60, max: 120 },
  { label: "2+ hrs", min: 120, max: Infinity },
];

const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

function chipSx(active: boolean) {
  return {
    fontFamily: FONT_SANS,
    fontSize: "13px",
    fontWeight: active ? 500 : 400,
    height: "32px",
    background: active ? "rgba(200,150,42,0.2)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? AMBER : BORDER}`,
    color: active ? GOLD : TEXT_DIM,
    cursor: "pointer",
    transition: "all 0.15s",
    "&:hover": {
      background: active ? "rgba(200,150,42,0.3)" : "rgba(255,255,255,0.07)",
      borderColor: AMBER,
    },
    "& .MuiChip-label": { padding: "0 10px" },
  };
}

function QuickGenModal({
  open,
  onClose,
  library,
}: {
  open: boolean;
  onClose: () => void;
  library: MockGame[];
}) {
  const [players, setPlayers] = React.useState<number | null>(null);
  const [timeIdx, setTimeIdx] = React.useState(0);
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState<MockGame | null>(null);
  const [noResults, setNoResults] = React.useState(false);

  function getPool() {
    return library.filter((g) => {
      const timeOk =
        timeIdx === 0 ||
        (g.maxPlaytime <= TIME_OPTIONS[timeIdx].max && g.minPlaytime >= TIME_OPTIONS[timeIdx].min);
      const playerOk = players === null || (g.minPlayers <= players && g.maxPlayers >= players);
      return timeOk && playerOk;
    });
  }

  function spin() {
    const pool = getPool();
    if (pool.length === 0) {
      setNoResults(true);
      setResult(null);
      return;
    }
    setNoResults(false);
    setSpinning(true);
    setResult(null);

    let flashes = 0;
    const interval = setInterval(() => {
      setResult(pool[Math.floor(Math.random() * pool.length)]);
      flashes++;
      if (flashes >= 12) {
        clearInterval(interval);
        setResult(weightedPick(pool));
        setSpinning(false);
      }
    }, 80);
  }

  function handleClose() {
    setPlayers(null);
    setTimeIdx(0);
    setSpinning(false);
    setResult(null);
    setNoResults(false);
    onClose();
  }

  const pool = getPool();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={SlideUp}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          background: BG_ELEVATED,
          border: `1px solid ${BORDER_MED}`,
          borderRadius: "14px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,85,48,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <DialogContent sx={{ padding: "28px", position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "24px",
          }}
        >
          <Box>
            <Typography
              sx={{ fontFamily: FONT_SERIF, fontSize: "22px", fontWeight: 700, color: TEXT }}
            >
              Quick Gen
            </Typography>
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT, mt: "2px" }}
            >
              {pool.length} game{pool.length !== 1 ? "s" : ""} in pool
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: TEXT_DIM }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "12px",
            fontWeight: 500,
            color: TEXT_DIM,
            mb: "8px",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          Players
        </Typography>
        <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", mb: "20px" }}>
          <Chip label="Any" onClick={() => setPlayers(null)} sx={chipSx(players === null)} />
          {PLAYER_OPTIONS.map((n) => (
            <Chip
              key={n}
              label={n}
              onClick={() => setPlayers(players === n ? null : n)}
              sx={chipSx(players === n)}
            />
          ))}
        </Box>

        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "12px",
            fontWeight: 500,
            color: TEXT_DIM,
            mb: "8px",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          Time budget
        </Typography>
        <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", mb: "28px" }}>
          {TIME_OPTIONS.map((opt, i) => (
            <Chip
              key={opt.label}
              label={opt.label}
              onClick={() => setTimeIdx(i)}
              sx={chipSx(timeIdx === i)}
            />
          ))}
        </Box>

        <Divider sx={{ borderColor: BORDER, mb: "28px" }} />

        <Box
          sx={{
            minHeight: "160px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          {!result && !spinning && !noResults && (
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "14px",
                color: TEXT_FAINT,
                fontStyle: "italic",
              }}
            >
              Set your filters and spin
            </Typography>
          )}
          {noResults && (
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: "rgba(220,100,100,0.8)" }}
            >
              No games match those filters.
            </Typography>
          )}
          {(result || spinning) && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                opacity: spinning ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {result && <GameArt game={result} size={100} />}
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "24px",
                  fontWeight: 700,
                  color: spinning ? TEXT_DIM : GOLD,
                  textAlign: "center",
                  maxWidth: "320px",
                }}
              >
                {result?.name}
              </Typography>
              {!spinning && result && (
                <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
                  {result.minPlayers === result.maxPlayers
                    ? `${result.minPlayers} players`
                    : `${result.minPlayers}–${result.maxPlayers} players`}
                  {" · "}
                  {result.minPlaytime === result.maxPlaytime
                    ? `${result.minPlaytime} min`
                    : `${result.minPlaytime}–${result.maxPlaytime} min`}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: "10px", mt: "24px" }}>
          <Button
            fullWidth
            onClick={spin}
            disabled={spinning}
            startIcon={
              spinning ? <CircularProgress size={16} sx={{ color: "#0f0c08" }} /> : <CasinoIcon />
            }
            sx={{
              background: AMBER,
              borderRadius: "8px",
              color: "#0f0c08",
              fontFamily: FONT_SANS,
              fontSize: "15px",
              fontWeight: 500,
              padding: "12px",
              textTransform: "none",
              "&:hover": { background: AMBER_HOVER },
              "&.Mui-disabled": { background: "rgba(200,150,42,0.35)", color: "rgba(15,12,8,0.5)" },
            }}
          >
            {spinning ? "Picking…" : result ? "Spin again" : "Spin"}
          </Button>
          {result && !spinning && (
            <Button
              onClick={spin}
              startIcon={<ShuffleIcon />}
              sx={{
                background: "transparent",
                border: `1px solid ${BORDER_MED}`,
                borderRadius: "8px",
                color: TEXT_DIM,
                fontFamily: FONT_SANS,
                fontSize: "15px",
                fontWeight: 500,
                padding: "12px 20px",
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": { background: "rgba(180,140,60,0.08)", color: TEXT },
              }}
            >
              Re-roll
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  profileUsername: string;
  isSelf: boolean;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UserLibraryPage({ profileUsername, isSelf }: Props) {
  const router = useRouter();
  const [library, setLibrary] = React.useState<MockGame[]>(MOCK_USER_LIBRARY);
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [quickGenOpen, setQuickGenOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return library;
    const q = search.toLowerCase();
    return library.filter((g) => g.name.toLowerCase().includes(q));
  }, [library, search]);

  function handleAddGame(game: MockGame) {
    setLibrary((prev) => {
      if (prev.find((g) => g.id === game.id)) return prev;
      return [{ ...game, id: Date.now() }, ...prev];
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
                <GameCard key={game.id} game={game} />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {isSelf && (
        <AddGameModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddGame} />
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

  return {
    props: {
      profileUsername: username,
      isSelf: currentUsername === username,
    },
  };
};
