import GameArt from "@/components/game/GameArt";
import { LibraryGame } from "@pages/api/games/library";
import FilterListIcon from "@mui/icons-material/FilterList";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import TimerIcon from "@mui/icons-material/Timer";
import TuneIcon from "@mui/icons-material/Tune";
import { Box, Button, Collapse, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────

const AMBER = "#c8962a";
const AMBER_DIM = "rgba(200,150,42,0.12)";
const AMBER_BORDER = "rgba(180,140,60,0.28)";
const AMBER_BORDER_FAINT = "rgba(180,140,60,0.15)";
const BG = "#0f0c08";
const BG_CARD = "#1a1610";
const BG_ELEVATED = "#211d14";
const TEXT = "#f0e6cc";
const TEXT_DIM = "rgba(232,223,200,0.55)";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SERIF = "'Playfair Display', serif";
const FONT_SANS = "'DM Sans', sans-serif";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filters {
  q: string;
  players: string;
  maxTime: string;
  complexity: string;
}

// ─── Game card ────────────────────────────────────────────────────────────────

function GameCard({ game }: { game: LibraryGame }) {
  return (
    <Link href={`/games/${game.gameId}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          background: BG_CARD,
          border: `1px solid ${AMBER_BORDER_FAINT}`,
          borderRadius: "10px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            borderColor: AMBER_BORDER,
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          },
        }}
      >
        <GameArt
          game={
            {
              ...game,
              gameId: game.gameId,
              userGameId: 0,
              addedAt: "",
              weight: 1,
              notes: null,
              description: null,
              mechanics: [],
              designers: [],
              publishers: [],
              userStars: null,
            } as LibraryGame
          }
          size={120}
        />
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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}>
              {game.minPlayers === game.maxPlayers
                ? `${game.minPlayers}p`
                : `${game.minPlayers}–${game.maxPlayers}p`}
              {" · "}
              {game.minPlaytime === game.maxPlaytime
                ? `${game.minPlaytime}m`
                : `${game.minPlaytime}–${game.maxPlaytime}m`}
            </Typography>
            {game.bggRating != null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <StarIcon sx={{ fontSize: "10px", color: AMBER }} />
                <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}>
                  {game.bggRating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Link>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 14px",
        borderRadius: "20px",
        border: `1px solid ${active ? AMBER_BORDER : AMBER_BORDER_FAINT}`,
        background: active ? AMBER_DIM : "transparent",
        color: active ? AMBER : TEXT_FAINT,
        fontFamily: FONT_SANS,
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        userSelect: "none",
        "&:hover": { borderColor: AMBER_BORDER, color: TEXT_DIM },
      }}
    >
      {label}
    </Box>
  );
}

// ─── Slider label ─────────────────────────────────────────────────────────────

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontFamily: FONT_SANS,
        fontSize: "11px",
        fontWeight: 600,
        color: AMBER,
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        mb: "10px",
      }}
    >
      {children}
    </Typography>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GamesIndexPage() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [games, setGames] = React.useState<LibraryGame[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const [filters, setFilters] = React.useState<Filters>({
    q: "",
    players: "",
    maxTime: "",
    complexity: "",
  });

  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Player count quick-select options
  const playerOptions = ["1", "2", "3", "4", "5", "6+"];
  // Max playtime quick-select options
  const timeOptions = [
    { label: "≤ 30 min", value: "30" },
    { label: "≤ 60 min", value: "60" },
    { label: "≤ 90 min", value: "90" },
    { label: "≤ 2 hrs", value: "120" },
    { label: "≤ 3 hrs", value: "180" },
  ];
  // Complexity quick-select
  const complexityOptions = [
    { label: "Light", value: "1.5" },
    { label: "Medium", value: "2.5" },
    { label: "Heavy", value: "5" },
  ];

  // ── Fetch ───────────────────────────────────────────────────────────────────

  async function fetchGames(f: Filters, p: number, append = false) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.q) params.set("q", f.q);
      if (f.players) params.set("players", f.players === "6+" ? "6" : f.players);
      if (f.maxTime) params.set("maxTime", f.maxTime);
      if (f.complexity) params.set("complexity", f.complexity);
      params.set("page", String(p));

      const res = await fetch(`/api/games?${params.toString()}`);
      const data = await res.json();

      setGames((prev) => (append ? [...prev, ...data.games] : data.games));
      setTotal(data.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  React.useEffect(() => {
    fetchGames(filters, 0);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleSearchChange(value: string) {
    const next = { ...filters, q: value };
    setFilters(next);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchGames(next, 0), 350);
  }

  function handleFilterChange(key: keyof Filters, value: string) {
    // Toggle off if same value clicked again
    const next = { ...filters, [key]: filters[key] === value ? "" : value };
    setFilters(next);
    fetchGames(next, 0);
  }

  function handleClearFilters() {
    const cleared = { q: filters.q, players: "", maxTime: "", complexity: "" };
    setFilters(cleared);
    fetchGames(cleared, 0);
  }

  function handleLoadMore() {
    fetchGames(filters, page + 1, true);
  }

  const hasActiveFilters = !!(filters.players || filters.maxTime || filters.complexity);
  const hasMore = games.length < total;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>Games — Tablekeeper</title>
      </Head>

      <Box sx={{ background: BG, minHeight: "100vh" }}>
        {/* Ambient glow */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "40vh",
            background:
              "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(34,85,48,0.15) 0%, transparent 70%)",
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
          {/* ── Header ──────────────────────────────────────────────────── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "flex-end" },
              flexDirection: { xs: "column", sm: "row" },
              gap: "12px",
              mb: "28px",
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
                Games
              </Typography>
              <Typography
                sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT, mt: "4px" }}
              >
                {total > 0 ? `${total.toLocaleString()} games in the database` : "Loading…"}
              </Typography>
            </Box>

            <Button
              onClick={() => setFiltersOpen((o) => !o)}
              startIcon={<TuneIcon />}
              sx={{
                background: hasActiveFilters ? AMBER_DIM : "transparent",
                border: `1px solid ${hasActiveFilters ? AMBER_BORDER : AMBER_BORDER_FAINT}`,
                borderRadius: "8px",
                color: hasActiveFilters ? AMBER : TEXT_DIM,
                fontFamily: FONT_SANS,
                fontSize: "14px",
                fontWeight: 500,
                padding: "8px 16px",
                textTransform: "none",
                "&:hover": { borderColor: AMBER_BORDER, color: TEXT },
              }}
            >
              Filters{hasActiveFilters ? " •" : ""}
            </Button>
          </Box>

          {/* ── Search ──────────────────────────────────────────────────── */}
          <OutlinedInput
            fullWidth
            value={filters.q}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search games…"
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
              background: "rgba(255,255,255,0.03)",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: AMBER_BORDER_FAINT },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: AMBER_BORDER },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: AMBER,
                borderWidth: "1px",
              },
              "& input::placeholder": { color: TEXT_FAINT },
            }}
          />

          {/* ── Filter panel ────────────────────────────────────────────── */}
          <Collapse in={filtersOpen}>
            <Box
              sx={{
                background: BG_ELEVATED,
                border: `1px solid ${AMBER_BORDER_FAINT}`,
                borderRadius: "12px",
                padding: "24px",
                mb: "20px",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                gap: "28px",
              }}
            >
              {/* Player count */}
              <Box>
                <FilterLabel>
                  <PeopleIcon sx={{ fontSize: "12px", mr: "4px", verticalAlign: "middle" }} />
                  Players
                </FilterLabel>
                <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {playerOptions.map((p) => (
                    <FilterChip
                      key={p}
                      label={p}
                      active={filters.players === p}
                      onClick={() => handleFilterChange("players", p)}
                    />
                  ))}
                </Box>
              </Box>

              {/* Playtime */}
              <Box>
                <FilterLabel>
                  <TimerIcon sx={{ fontSize: "12px", mr: "4px", verticalAlign: "middle" }} />
                  Play time
                </FilterLabel>
                <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {timeOptions.map((t) => (
                    <FilterChip
                      key={t.value}
                      label={t.label}
                      active={filters.maxTime === t.value}
                      onClick={() => handleFilterChange("maxTime", t.value)}
                    />
                  ))}
                </Box>
              </Box>

              {/* Complexity */}
              <Box>
                <FilterLabel>
                  <FilterListIcon sx={{ fontSize: "12px", mr: "4px", verticalAlign: "middle" }} />
                  Complexity
                </FilterLabel>
                <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {complexityOptions.map((c) => (
                    <FilterChip
                      key={c.value}
                      label={c.label}
                      active={filters.complexity === c.value}
                      onClick={() => handleFilterChange("complexity", c.value)}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {hasActiveFilters && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: "16px" }}>
                <Typography
                  onClick={handleClearFilters}
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "13px",
                    color: TEXT_FAINT,
                    cursor: "pointer",
                    "&:hover": { color: TEXT_DIM },
                  }}
                >
                  Clear filters ×
                </Typography>
              </Box>
            )}
          </Collapse>

          {/* ── Empty state ──────────────────────────────────────────────── */}
          {!loading && games.length === 0 && (
            <Box sx={{ textAlign: "center", py: "80px" }}>
              <Typography sx={{ fontFamily: FONT_SERIF, fontSize: "22px", color: TEXT_DIM }}>
                No games found
              </Typography>
              <Typography
                sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_FAINT, mt: "8px" }}
              >
                Try adjusting your search or filters
              </Typography>
            </Box>
          )}

          {/* ── Game grid ────────────────────────────────────────────────── */}
          {games.length > 0 && (
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
              {games.map((game) => (
                <GameCard key={game.gameId} game={game} />
              ))}
            </Box>
          )}

          {/* ── Load more ────────────────────────────────────────────────── */}
          {hasMore && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: "40px" }}>
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                sx={{
                  background: "transparent",
                  border: `1px solid ${AMBER_BORDER}`,
                  borderRadius: "8px",
                  color: TEXT_DIM,
                  fontFamily: FONT_SANS,
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "10px 32px",
                  textTransform: "none",
                  "&:hover": {
                    background: AMBER_DIM,
                    color: AMBER,
                    borderColor: AMBER,
                  },
                }}
              >
                {loading ? "Loading…" : `Load more · ${total - games.length} remaining`}
              </Button>
            </Box>
          )}

          {/* ── Loading skeleton hint ────────────────────────────────────── */}
          {loading && games.length === 0 && (
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
              {Array.from({ length: 24 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    background: BG_CARD,
                    border: `1px solid ${AMBER_BORDER_FAINT}`,
                    borderRadius: "10px",
                    height: "200px",
                    opacity: 1 - i * 0.03,
                    animation: "pulse 1.6s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 0.4 - i * 0.01 },
                      "50%": { opacity: 0.2 - i * 0.005 },
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
