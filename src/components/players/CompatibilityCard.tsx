import { gameColor, initials } from "@/lib/helpers";
import type { Compatibility } from "@/services/compatibility";
import {
  BORDER_INK,
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  MUSTARD,
  OLIVE,
  SHADOW_HARD,
  SHADOW_HARD_HOVER,
  SHADOW_HARD_LG,
  TEXT_DIM,
  TEXT_FAINT,
  TINT_BRICK,
  TINT_OLIVE,
} from "@/styles/theme";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import HandshakeIcon from "@mui/icons-material/Handshake";
import {
  Box,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Slide,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  username: string;
}

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function scoreColor(score: number): { ring: string; text: string } {
  if (score >= 70) return { ring: OLIVE, text: OLIVE };
  if (score >= 50) return { ring: MUSTARD, text: "#a87a20" };
  return { ring: "rgba(51,39,26,0.3)", text: TEXT_FAINT };
}

function CompatibilityBody({ data }: { data: Compatibility }) {
  const router = useRouter();
  const ring = scoreColor(data.score).ring;
  const textColor = scoreColor(data.score).text;

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: "20px" }}>
        <Box
          sx={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: `3px solid ${ring}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: "12px",
            background: "transparent",
          }}
        >
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "40px",
              fontWeight: 900,
              color: textColor,
              lineHeight: 1,
            }}
          >
            {data.score}
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: TEXT_FAINT,
              mt: "2px",
            }}
          >
            Match
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: FONT_SERIF,
            fontSize: "16px",
            fontStyle: "italic",
            color: "text.primary",
            textAlign: "center",
          }}
        >
          {data.headline}
        </Typography>
      </Box>

      {data.notes.length > 0 && (
        <Box sx={{ mb: data.recommendations.length > 0 ? "20px" : 0 }}>
          {data.notes.map((n) => (
            <Typography
              key={n}
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "13px",
                color: TEXT_DIM,
                lineHeight: 1.8,
                textAlign: "center",
                "&::before": { content: '"·"', color: BRICK, mr: "6px" },
              }}
            >
              {n}
            </Typography>
          ))}
        </Box>
      )}

      {data.sharedFavorites.length > 0 && (
        <Box
          sx={{
            padding: "10px 14px",
            borderRadius: "10px",
            background: TINT_OLIVE,
            border: `1.5px solid ${OLIVE}`,
            mb: data.recommendations.length > 0 ? "20px" : 0,
          }}
        >
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: TEXT_FAINT,
              mb: "4px",
            }}
          >
            Shared favorites
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "13px",
              color: TEXT_DIM,
              lineHeight: 1.6,
            }}
          >
            {data.sharedFavorites.join(" · ")}
          </Typography>
        </Box>
      )}

      {data.recommendations.length > 0 && (
        <Box>
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: TEXT_FAINT,
              mb: "10px",
              textAlign: "center",
            }}
          >
            Bring from your shelf
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            {data.recommendations.map((rec) => (
              <Box
                key={rec.gameId}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "10px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "border-color 0.15s, transform 0.15s",
                  "&:hover": { borderColor: INK, transform: "translateY(-2px)" },
                }}
                onClick={() => router.push(`/games/${rec.gameId}`)}
              >
                {rec.imageUrl ? (
                  <Box
                    alt={rec.name}
                    component="img"
                    src={rec.imageUrl}
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      background: gameColor(rec.name),
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
                        color: "rgba(255,251,240,0.9)",
                        userSelect: "none",
                      }}
                    >
                      {initials(rec.name)}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ padding: "6px 8px" }}>
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "text.primary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rec.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "10px",
                      fontStyle: "italic",
                      color: TEXT_FAINT,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rec.reason}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </>
  );
}

export default function CompatibilityCard({ username }: Props) {
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<Compatibility | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function fetchIt() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/user/compatibility?username=${encodeURIComponent(username)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load compatibility.");
        }
        const body = await res.json();
        if (!cancelled) setData(body.compatibility);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchIt();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const ready = data?.ready ?? false;
  const teaserBorder = ready ? INK : "divider";
  const scoreText = data && ready ? scoreColor(data.score).text : TEXT_FAINT;
  const headline = loading
    ? "Calculating…"
    : error
      ? "Couldn't load match"
      : !ready
        ? "Not enough signal yet"
        : data!.headline;

  return (
    <>
      <ButtonBase
        disabled={loading || !!error || !ready}
        sx={{
          width: "100%",
          textAlign: "left",
          backgroundColor: "background.paper",
          border: "2px solid",
          borderColor: teaserBorder,
          borderRadius: "13px",
          boxShadow: ready ? SHADOW_HARD : "none",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          transition: "box-shadow 0.15s, transform 0.15s",
          "&:hover": {
            boxShadow: ready ? SHADOW_HARD_HOVER : "none",
            transform: ready ? "translate(-2px, -2px)" : "none",
          },
          "&.Mui-disabled": { opacity: 0.7, cursor: "default" },
        }}
        onClick={() => setOpen(true)}
      >
        <Box
          sx={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: TINT_BRICK,
            border: `1.5px solid ${INK}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <HandshakeIcon sx={{ fontSize: "18px", color: BRICK }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: "text.secondary",
              mb: "2px",
            }}
          >
            Compatibility
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "16px",
              fontWeight: 700,
              color: ready ? "text.primary" : TEXT_DIM,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {headline}
          </Typography>
          {ready && data && (
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "12px",
                color: TEXT_FAINT,
                mt: "1px",
              }}
            >
              {data.sharedGames} shared {data.sharedGames === 1 ? "game" : "games"}
            </Typography>
          )}
        </Box>
        {loading ? (
          <CircularProgress size={18} sx={{ color: BRICK }} />
        ) : ready && data ? (
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "22px",
              fontWeight: 900,
              color: scoreText,
              flexShrink: 0,
            }}
          >
            {data.score}%
          </Typography>
        ) : (
          <ArrowForwardIcon sx={{ fontSize: "16px", color: BRICK, flexShrink: 0 }} />
        )}
      </ButtonBase>

      <Dialog
        fullWidth
        TransitionComponent={SlideUp}
        maxWidth="sm"
        open={open && ready}
        PaperProps={{
          sx: {
            background: "background.paper",
            border: BORDER_INK,
            borderRadius: "13px",
            boxShadow: SHADOW_HARD_LG,
            overflow: "hidden",
          },
        }}
        onClose={() => setOpen(false)}
      >
        <IconButton
          sx={{
            position: "absolute",
            top: "12px",
            right: "12px",
            color: TEXT_FAINT,
            "&:hover": { color: TEXT_DIM },
          }}
          onClick={() => setOpen(false)}
        >
          <CloseIcon sx={{ fontSize: "20px" }} />
        </IconButton>
        <DialogContent sx={{ padding: { xs: "32px 24px", md: "40px 36px" }, position: "relative" }}>
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: "text.secondary",
              mb: "20px",
              textAlign: "center",
            }}
          >
            Compatibility with {username}
          </Typography>
          {data && ready && <CompatibilityBody data={data} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
