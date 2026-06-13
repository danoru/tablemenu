import {
  FONT_SANS,
  FONT_SERIF,
  INK,
  OLIVE,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_MUSTARD,
  TINT_OLIVE,
} from "@/styles/theme";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Slide,
  Snackbar,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { LibraryGame } from "@pages/api/games/library";
import React from "react";
import { useDebouncedCallback } from "use-debounce";

interface SearchResult {
  bggId: number;
  name: string;
  yearPublished: number | null;
}
export function cleanText(input: string): string {
  if (!input) return "";

  return input
    .replace(/&#0*39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "")
    .trim();
}
const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface AddGameModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (game: LibraryGame) => void;
}

export default function AddGameModal({ open, onClose, onAdded }: AddGameModalProps) {
  const [query, setQuery] = React.useState("");
  const [exactMatch, setExactMatch] = React.useState(false);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [adding, setAdding] = React.useState<number | null>(null);
  const [added, setAdded] = React.useState<Set<number>>(new Set());
  const [searchError, setSearchError] = React.useState("");
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const runSearch = useDebouncedCallback(async (q: string, exact: boolean) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    setSearchError("");
    try {
      const params = new URLSearchParams({ q: q.trim() });
      if (exact) params.set("exact", "1");

      const res = await fetch(`/api/bgg/search?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.results ?? []);
      } else {
        setSearchError(data.error ?? "Search failed.");
        setResults([]);
      }
    } catch {
      setSearchError("Could not reach the search service.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, 400);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (q.trim().length >= 2) setSearching(true);
    runSearch(q, exactMatch);
  }

  function handleExactToggle() {
    const next = !exactMatch;
    setExactMatch(next);
    if (query.trim().length >= 2) {
      setSearching(true);
      runSearch(query, next);
    }
  }
  async function handleAdd(result: SearchResult) {
    setAdding(result.bggId);
    try {
      const detailRes = await fetch(`/api/bgg/${result.bggId}`);
      const detailData = await detailRes.json();
      if (!detailRes.ok || !detailData.game) {
        setSnackbar({ open: true, message: "Failed to fetch game details.", severity: "error" });
        return;
      }

      const game = detailData.game;

      const addRes = await fetch("/api/games/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bggId: game.bggId,
          name: cleanText(game.name),
          description: game.description,
          imageUrl: game.imageUrl,
          minPlayers: game.minPlayers,
          maxPlayers: game.maxPlayers,
          minPlaytime: game.minPlaytime,
          maxPlaytime: game.maxPlaytime,
          complexity: game.complexity,
          bggRating: game.bggRating,
          categories: game.categories,
          mechanics: game.mechanics,
          designers: game.designers,
          publishers: game.publishers,
          countries: game.countries,
          yearPublished: game.yearPublished,
        }),
      });

      const addData = await addRes.json();
      const gameName = cleanText(game.name);

      if (addRes.ok) {
        setAdded((prev) => new Set(prev).add(result.bggId));
        setSnackbar({
          open: true,
          message: addData.alreadyInLibrary
            ? `${cleanText(gameName)} is already in your library.`
            : `${cleanText(gameName)} added to your library!`,
          severity: "success",
        });
        if (!addData.alreadyInLibrary) onAdded(game);
      } else {
        setSnackbar({
          open: true,
          message: addData.error ?? "Failed to add game.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "Something went wrong.", severity: "error" });
    } finally {
      setAdding(null);
    }
  }

  function handleClose() {
    setQuery("");
    setExactMatch(false);
    setResults([]);
    setSearching(false);
    setAdded(new Set());
    setSearchError("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} TransitionComponent={SlideUp} fullWidth maxWidth="sm">
      <DialogContent sx={{ padding: "28px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "20px",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: "22px",
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              Add a game
            </Typography>
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT, mt: "2px" }}
            >
              Powered by BoardGameGeek
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: TEXT_DIM }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <OutlinedInput
          autoFocus
          fullWidth
          value={query}
          onChange={handleQueryChange}
          placeholder="Search 100,000+ games…"
          startAdornment={
            <InputAdornment position="start">
              {searching ? (
                <CircularProgress size={16} sx={{ color: TEXT_FAINT }} />
              ) : (
                <SearchIcon sx={{ color: TEXT_FAINT, fontSize: "18px" }} />
              )}
            </InputAdornment>
          }
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "14px",
            color: "text.primary",
            mb: "10px",
          }}
        />

        <Box sx={{ mb: "16px" }}>
          <Chip
            label="Exact match"
            size="small"
            onClick={handleExactToggle}
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "11px",
              height: "24px",
              cursor: "pointer",
              transition: "all 0.15s",
              ...(exactMatch
                ? {
                    background: TINT_MUSTARD,
                    color: INK,
                    fontWeight: 500,
                    border: `1.5px solid ${INK}`,
                    "&:hover": { background: TINT_MUSTARD },
                  }
                : {
                    background: "transparent",
                    color: TEXT_FAINT,
                    border: "1.5px solid",
                    borderColor: "divider",
                    "&:hover": {
                      background: "rgba(51,39,26,0.05)",
                      borderColor: INK,
                      color: TEXT_DIM,
                    },
                  }),
            }}
          />
        </Box>

        {searchError && (
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "13px",
              color: "error.main",
              mb: "12px",
            }}
          >
            {searchError}
          </Typography>
        )}

        {!searching && query.trim().length < 2 && (
          <Box sx={{ textAlign: "center", py: "32px" }}>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
              Start typing to search BoardGameGeek
            </Typography>
          </Box>
        )}

        {!searching && query.trim().length >= 2 && results.length === 0 && !searchError && (
          <Box sx={{ textAlign: "center", py: "32px" }}>
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT }}>
              No games found for "{query}"
              {exactMatch && (
                <Box component="span" sx={{ display: "block", mt: "6px", fontSize: "12px" }}>
                  Try turning off exact match for broader results.
                </Box>
              )}
            </Typography>
          </Box>
        )}

        {results.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {results.map((result, i) => {
              const isAdded = added.has(result.bggId);
              const isAdding = adding === result.bggId;

              return (
                <Box
                  key={result.bggId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: i % 2 === 0 ? "rgba(51,39,26,0.03)" : "transparent",
                    border: `1px solid ${isAdded ? OLIVE : "transparent"}`,
                    transition: "all 0.15s",
                    "&:hover": { background: "rgba(51,39,26,0.05)" },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: FONT_SANS,
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cleanText(result.name)}
                    </Typography>
                    {result.yearPublished && (
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "11px",
                          color: TEXT_FAINT,
                          mt: "1px",
                        }}
                      >
                        {result.yearPublished}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    onClick={() => !isAdded && !isAdding && handleAdd(result)}
                    disabled={isAdded || isAdding}
                    size="small"
                    startIcon={
                      isAdding ? (
                        <CircularProgress size={12} sx={{ color: "inherit" }} />
                      ) : isAdded ? null : (
                        <AddIcon sx={{ fontSize: "14px !important" }} />
                      )
                    }
                    sx={{
                      minWidth: "80px",
                      fontFamily: FONT_SANS,
                      fontSize: "12px",
                      fontWeight: 500,
                      textTransform: "none",
                      borderRadius: "999px",
                      padding: "5px 12px",
                      flexShrink: 0,
                      ...(isAdded
                        ? {
                            background: TINT_OLIVE,
                            color: INK,
                            border: `1.5px solid ${OLIVE}`,
                          }
                        : {
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                            border: `1.5px solid ${INK}`,
                            "&:hover": { backgroundColor: "primary.light" },
                          }),
                      "&.Mui-disabled": { opacity: isAdded ? 1 : 0.5 },
                    }}
                  >
                    {isAdding ? "Adding…" : isAdded ? "Added ✓" : "Add"}
                  </Button>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ fontFamily: FONT_SANS }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
