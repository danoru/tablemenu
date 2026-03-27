import type { BGGCollectionGame } from "@api/bgg/collection";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  OutlinedInput,
  Slide,
  Snackbar,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = "#e8c97a";
const AMBER = "#c8962a";
const AMBER_HOVER = "#dba535";
const GREEN_BRIGHT = "#5ec97a";
const BG_ELEVATED = "#221e14";
const BG_CARD = "#1a1610";
const BORDER = "rgba(180,140,60,0.15)";
const BORDER_MED = "rgba(180,140,60,0.28)";
const TEXT = "#f0e6cc";
const TEXT_DIM = "rgba(232,223,200,0.55)";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SERIF = "'Playfair Display', serif";
const FONT_SANS = "'DM Sans', sans-serif";

// ─── Slide transition ─────────────────────────────────────────────────────────

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "input" | "preview" | "importing" | "done";

interface ImportResult {
  added: number;
  skipped: number;
  failed: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BggImportModal({ open, onClose, onImported }: Props) {
  const [step, setStep] = React.useState<Step>("input");
  const [bggUsername, setBggUsername] = React.useState("");
  const [fetching, setFetching] = React.useState(false);
  const [games, setGames] = React.useState<BGGCollectionGame[]>([]);
  const [fetchError, setFetchError] = React.useState("");
  const [importResult, setImportResult] = React.useState<ImportResult | null>(null);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  function handleClose() {
    if (step === "importing") return; // don't allow close mid-import
    setStep("input");
    setBggUsername("");
    setGames([]);
    setFetchError("");
    setImportResult(null);
    onClose();
  }

  // ── Step 1: fetch collection preview ──────────────────────────────────────
  async function handleFetch() {
    if (!bggUsername.trim()) return;
    setFetching(true);
    setFetchError("");
    try {
      const res = await fetch(
        `/api/bgg/collection?username=${encodeURIComponent(bggUsername.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setFetchError(data.error ?? "Failed to fetch collection.");
        return;
      }

      if (!data.games || data.games.length === 0) {
        setFetchError(
          `No owned games found for BGG user "${bggUsername}". Make sure your collection is public.`
        );
        return;
      }

      setGames(data.games);
      setStep("preview");
    } catch {
      setFetchError("Could not reach BGG. Please try again.");
    } finally {
      setFetching(false);
    }
  }

  // ── Step 2: confirm import ────────────────────────────────────────────────
  async function handleImport() {
    setStep("importing");
    try {
      // Send in batches of 50 to avoid request size limits
      const BATCH_SIZE = 50;
      let totalAdded = 0;
      let totalSkipped = 0;
      let totalFailed = 0;

      for (let i = 0; i < games.length; i += BATCH_SIZE) {
        const batch = games.slice(i, i + BATCH_SIZE);
        const res = await fetch("/api/games/bulkAdd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ games: batch }),
        });
        const data = await res.json();
        if (res.ok) {
          totalAdded += data.added;
          totalSkipped += data.skipped;
          totalFailed += data.failed;
        } else {
          totalFailed += batch.length;
        }
      }

      setImportResult({ added: totalAdded, skipped: totalSkipped, failed: totalFailed });
      setStep("done");
      if (totalAdded > 0) onImported();
    } catch {
      setSnackbar({
        open: true,
        message: "Import failed unexpectedly. Please try again.",
        severity: "error",
      });
      setStep("preview");
    }
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
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: "24px",
          }}
        >
          <Box>
            <Typography
              sx={{ fontFamily: FONT_SERIF, fontSize: "22px", fontWeight: 700, color: TEXT }}
            >
              Import from BGG
            </Typography>
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT, mt: "3px" }}
            >
              Import your BoardGameGeek collection in one click
            </Typography>
          </Box>
          {step !== "importing" && (
            <IconButton onClick={handleClose} size="small" sx={{ color: TEXT_DIM }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* ── Step: input ─────────────────────────────────────────────────── */}
        {step === "input" && (
          <>
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "13px",
                color: TEXT_DIM,
                mb: "16px",
                lineHeight: 1.6,
              }}
            >
              Enter your BoardGameGeek username to preview your owned games collection. Make sure
              your collection is set to{" "}
              <Box component="span" sx={{ color: GOLD }}>
                public
              </Box>{" "}
              on BGG.
            </Typography>

            <OutlinedInput
              autoFocus
              fullWidth
              value={bggUsername}
              onChange={(e) => {
                setBggUsername(e.target.value);
                setFetchError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder="Your BGG username"
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: TEXT_FAINT, fontSize: "18px" }} />
                </InputAdornment>
              }
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "15px",
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

            {fetchError && (
              <Typography
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "13px",
                  color: "rgba(220,100,100,0.9)",
                  mb: "16px",
                }}
              >
                {fetchError}
              </Typography>
            )}

            <Button
              fullWidth
              onClick={handleFetch}
              disabled={fetching || !bggUsername.trim()}
              startIcon={
                fetching ? <CircularProgress size={16} sx={{ color: "#0f0c08" }} /> : <SearchIcon />
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
                "&.Mui-disabled": {
                  background: "rgba(200,150,42,0.35)",
                  color: "rgba(15,12,8,0.5)",
                },
              }}
            >
              {fetching ? "Fetching collection…" : "Preview collection"}
            </Button>

            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "11px",
                color: TEXT_FAINT,
                textAlign: "center",
                mt: "16px",
              }}
            >
              BGG may take a few seconds to prepare your collection on first request.
            </Typography>
          </>
        )}

        {/* ── Step: preview ───────────────────────────────────────────────── */}
        {step === "preview" && (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: "16px",
              }}
            >
              <Box>
                <Typography
                  sx={{ fontFamily: FONT_SANS, fontSize: "14px", fontWeight: 500, color: TEXT }}
                >
                  Found {games.length} games
                </Typography>
                <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}>
                  BGG collection for{" "}
                  <Box component="span" sx={{ color: GOLD }}>
                    {bggUsername}
                  </Box>
                </Typography>
              </Box>
              <Button
                onClick={() => {
                  setStep("input");
                  setGames([]);
                }}
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "12px",
                  color: TEXT_DIM,
                  textTransform: "none",
                  "&:hover": { color: TEXT },
                }}
              >
                ← Change username
              </Button>
            </Box>

            {/* Game preview list */}
            <Box
              sx={{
                maxHeight: "280px",
                overflowY: "auto",
                background: BG_CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: "10px",
                mb: "20px",
              }}
            >
              {games.map((game, i) => (
                <Box key={game.bggId}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                    }}
                  >
                    {game.imageUrl ? (
                      <Box
                        component="img"
                        src={game.imageUrl}
                        alt={game.name}
                        sx={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "6px",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "6px",
                          background: "rgba(180,110,30,0.2)",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "13px",
                          fontWeight: 500,
                          color: TEXT,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {game.name}
                      </Typography>
                      {game.yearPublished && (
                        <Typography
                          sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}
                        >
                          {game.yearPublished}
                        </Typography>
                      )}
                    </Box>
                    {game.bggRating && (
                      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: GOLD }}>
                        ★ {game.bggRating.toFixed(1)}
                      </Typography>
                    )}
                  </Box>
                  {i < games.length - 1 && <Divider sx={{ borderColor: BORDER }} />}
                </Box>
              ))}
            </Box>

            <Button
              fullWidth
              onClick={handleImport}
              startIcon={<DownloadIcon />}
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
              }}
            >
              Import all {games.length} games
            </Button>
          </>
        )}

        {/* ── Step: importing ──────────────────────────────────────────────── */}
        {step === "importing" && (
          <Box sx={{ textAlign: "center", py: "24px" }}>
            <CircularProgress sx={{ color: AMBER, mb: "20px" }} />
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: "20px",
                fontWeight: 700,
                color: TEXT,
                mb: "8px",
              }}
            >
              Importing your collection…
            </Typography>
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_DIM, mb: "24px" }}
            >
              This may take a moment for large collections. Please don't close this window.
            </Typography>
            <LinearProgress
              sx={{
                borderRadius: "4px",
                background: BORDER,
                "& .MuiLinearProgress-bar": { background: AMBER },
              }}
            />
          </Box>
        )}

        {/* ── Step: done ───────────────────────────────────────────────────── */}
        {step === "done" && importResult && (
          <Box sx={{ textAlign: "center", py: "16px" }}>
            <CheckCircleIcon sx={{ fontSize: "48px", color: GREEN_BRIGHT, mb: "16px" }} />
            <Typography
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: "22px",
                fontWeight: 700,
                color: TEXT,
                mb: "8px",
              }}
            >
              Import complete
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", gap: "24px", mb: "28px" }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: FONT_SERIF,
                    fontSize: "28px",
                    fontWeight: 700,
                    color: GREEN_BRIGHT,
                  }}
                >
                  {importResult.added}
                </Typography>
                <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}>
                  added
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{ fontFamily: FONT_SERIF, fontSize: "28px", fontWeight: 700, color: GOLD }}
                >
                  {importResult.skipped}
                </Typography>
                <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}>
                  already owned
                </Typography>
              </Box>
              {importResult.failed > 0 && (
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontFamily: FONT_SERIF,
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "rgba(220,120,120,0.9)",
                    }}
                  >
                    {importResult.failed}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}>
                    failed
                  </Typography>
                </Box>
              )}
            </Box>

            <Button
              fullWidth
              onClick={handleClose}
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
              }}
            >
              Done
            </Button>
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
