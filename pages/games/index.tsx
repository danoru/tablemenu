import GameGrid from "@/components/games/GameGrid";
import FilterChip from "@/components/ui/FilterChip";
import {
  BORDER_AMBER,
  BG_ELEVATED,
  TEXT_DIM,
  TEXT_FAINT,
  AMBER_DIM,
  FONT_SANS,
  FONT_SERIF,
} from "@/styles/theme";
import { LibraryGame } from "@pages/api/games/library";
import FilterListIcon from "@mui/icons-material/FilterList";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import TimerIcon from "@mui/icons-material/Timer";
import TuneIcon from "@mui/icons-material/Tune";
import { Box, Button, Collapse, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import Head from "next/head";
import React from "react";

interface Filters {
  q: string;
  players: string;
  maxTime: string;
  minComplexity: string;
  maxComplexity: string;
  sortBy: string;
  sortDir: "asc" | "desc";
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontFamily: FONT_SANS,
        fontSize: "11px",
        fontWeight: 600,
        color: "primary.main",
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        mb: "10px",
      }}
    >
      {children}
    </Typography>
  );
}

export default function GamesIndexPage() {
  const [games, setGames] = React.useState<LibraryGame[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const [filters, setFilters] = React.useState<Filters>({
    q: "",
    players: "",
    maxTime: "",
    minComplexity: "",
    maxComplexity: "",
    sortBy: "name",
    sortDir: "asc",
  });

  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const playerOptions = ["1", "2", "3", "4", "5", "6+"];

  const timeOptions = [
    { label: "≤ 30 min", value: "30" },
    { label: "≤ 60 min", value: "60" },
    { label: "≤ 90 min", value: "90" },
    { label: "≤ 2 hrs", value: "120" },
    { label: "≤ 3 hrs", value: "180" },
  ];

  const complexityOptions = [
    { label: "Light", value: "1.5" },
    { label: "Medium", value: "2.5" },
    { label: "Heavy", value: "5" },
  ];

  async function fetchGames(f: Filters, p: number, append = false) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.q) params.set("q", f.q);
      if (f.players) params.set("players", f.players === "6+" ? "6" : f.players);
      if (f.maxTime) params.set("maxTime", f.maxTime);
      if (f.minComplexity) params.set("minComplexity", f.minComplexity);
      if (f.maxComplexity) params.set("complexity", f.maxComplexity);
      params.set("sortBy", f.sortBy);
      params.set("sortDir", f.sortDir);
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

  React.useEffect(() => {
    fetchGames(filters, 0);
  }, []);

  function handleSearchChange(value: string) {
    const next = { ...filters, q: value };
    setFilters(next);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchGames(next, 0), 350);
  }

  function handleFilterChange(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: filters[key] === value ? "" : value };
    setFilters(next);
    fetchGames(next, 0);
  }

  function handleClearFilters() {
    const cleared = {
      q: filters.q,
      players: "",
      maxTime: "",
      minComplexity: "",
      maxComplexity: "",
      sortBy: "name",
      sortDir: "asc" as const,
    };
    setFilters(cleared);
    fetchGames(cleared, 0);
  }

  function handleLoadMore() {
    fetchGames(filters, page + 1, true);
  }

  const hasActiveFilters = !!(
    filters.players ||
    filters.maxTime ||
    filters.minComplexity ||
    filters.maxComplexity ||
    filters.sortBy !== "name"
  );
  const hasMore = games.length < total;

  return (
    <>
      <Head>
        <title>Games — Tablekeeper</title>
      </Head>

      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
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
                  color: "text.primary",
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
                border: "1px solid",
                borderColor: `${hasActiveFilters ? BORDER_AMBER : "divider"}`,
                borderRadius: "8px",
                color: hasActiveFilters ? "primary.main" : TEXT_DIM,
                fontFamily: FONT_SANS,
                fontSize: "14px",
                fontWeight: 500,
                padding: "8px 16px",
                textTransform: "none",
                "&:hover": { borderColor: BORDER_AMBER, color: "text.primary" },
              }}
            >
              Filters{hasActiveFilters ? " •" : ""}
            </Button>
          </Box>

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
              color: "text.primary",
              mb: "16px",
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

          <Collapse in={filtersOpen}>
            <Box
              sx={{
                background: BG_ELEVATED,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "12px",
                padding: "24px",
                mb: "20px",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                gap: "28px",
              }}
            >
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

              <Box>
                <FilterLabel>
                  <FilterListIcon sx={{ fontSize: "12px", mr: "4px", verticalAlign: "middle" }} />
                  Complexity
                </FilterLabel>
                <Box sx={{ mb: "8px" }}>
                  <Typography
                    sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT, mb: "6px" }}
                  >
                    Min
                  </Typography>
                  <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {[
                      { label: "Light+", value: "1" },
                      { label: "Medium+", value: "2" },
                      { label: "Heavy+", value: "3.5" },
                    ].map((c) => (
                      <FilterChip
                        key={c.value}
                        label={c.label}
                        active={filters.minComplexity === c.value}
                        onClick={() => {
                          const next = {
                            ...filters,
                            minComplexity: filters.minComplexity === c.value ? "" : c.value,
                          };
                          setFilters(next);
                          fetchGames(next, 0);
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Typography
                    sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT, mb: "6px" }}
                  >
                    Max
                  </Typography>
                  <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {[
                      { label: "≤ Light", value: "1.5" },
                      { label: "≤ Medium", value: "2.5" },
                      { label: "≤ Heavy", value: "5" },
                    ].map((c) => (
                      <FilterChip
                        key={c.value}
                        label={c.label}
                        active={filters.maxComplexity === c.value}
                        onClick={() => {
                          const next = {
                            ...filters,
                            maxComplexity: filters.maxComplexity === c.value ? "" : c.value,
                          };
                          setFilters(next);
                          fetchGames(next, 0);
                        }}
                      />
                    ))}
                  </Box>
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
            <Box
              sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                pt: "20px",
                mt: "4px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
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
                }}
              >
                Sort by
              </Typography>
              <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", flex: 1 }}>
                {[
                  { label: "Name", value: "name" },
                  { label: "BGG Rating", value: "bggRating" },
                  { label: "Complexity", value: "complexity" },
                  { label: "Play time", value: "minPlaytime" },
                  { label: "Year", value: "yearPublished" },
                  { label: "Players", value: "minPlayers" },
                ].map((opt) => (
                  <FilterChip
                    key={opt.value}
                    label={
                      filters.sortBy === opt.value
                        ? `${opt.label} ${filters.sortDir === "asc" ? "↑" : "↓"}`
                        : opt.label
                    }
                    active={filters.sortBy === opt.value}
                    onClick={() => {
                      const next = {
                        ...filters,
                        sortBy: opt.value,
                        sortDir: (filters.sortBy === opt.value && filters.sortDir === "asc"
                          ? "desc"
                          : "asc") as "asc" | "desc",
                      };
                      setFilters(next);
                      fetchGames(next, 0);
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Collapse>

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
          <GameGrid games={games} />
          {hasMore && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: "40px" }}>
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                sx={{
                  background: "transparent",
                  border: `1px solid ${BORDER_AMBER}`,
                  borderRadius: "8px",
                  color: TEXT_DIM,
                  fontFamily: FONT_SANS,
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "10px 32px",
                  textTransform: "none",
                  "&:hover": {
                    background: AMBER_DIM,
                    color: "primary.main",
                    borderColor: "primary.main",
                  },
                }}
              >
                {loading ? "Loading…" : `Load more · ${total - games.length} remaining`}
              </Button>
            </Box>
          )}
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
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
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
