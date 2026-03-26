import type { RoomSuggestion } from "@api/rooms/[code]/index";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN_BRIGHT = "#5ec97a";
const BORDER = "rgba(180,140,60,0.15)";
const TEXT = "#f0e6cc";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SERIF = "'Playfair Display', serif";
const FONT_SANS = "'DM Sans', sans-serif";

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

export default function SuggestionRow({
  suggestion,
  isHost,
  currentUserId,
  onVote,
  onToggleBring,
  loadingGameId,
}: {
  suggestion: RoomSuggestion;
  isHost: boolean;
  currentUserId: number;
  onVote: (gameId: number, interested: boolean) => void;
  onToggleBring: (gameId: number) => void;
  loadingGameId: number | null;
}) {
  const isBringing = suggestion.suggestedBy === currentUserId;
  const isLoading = loadingGameId === suggestion.gameId;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 18px",
        borderRadius: "10px",
        background: suggestion.bringing ? "rgba(34,85,48,0.1)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${suggestion.bringing ? "rgba(60,160,80,0.2)" : BORDER}`,
        transition: "all 0.15s",
        mb: "8px",
      }}
    >
      <Box
        sx={{
          width: "44px",
          height: "44px",
          borderRadius: "8px",
          background: gameColour(suggestion.name),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontFamily: FONT_SERIF,
            fontSize: "14px",
            fontWeight: 700,
            color: "rgba(232,223,200,0.5)",
            userSelect: "none",
          }}
        >
          {initials(suggestion.name)}
        </Typography>
      </Box>
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
          {suggestion.name}
        </Typography>
        <Box sx={{ display: "flex", gap: "8px", mt: "3px", alignItems: "center" }}>
          {suggestion.bringing && (
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: GREEN_BRIGHT }}>
              ✓ In the pool
            </Typography>
          )}
          <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: TEXT_FAINT }}>
            {suggestion.minPlayers}–{suggestion.maxPlayers}p
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            background: "rgba(94,201,122,0.1)",
            border: "1px solid rgba(94,201,122,0.18)",
            borderRadius: "6px",
            padding: "3px 8px",
          }}
        >
          <ThumbUpIcon sx={{ fontSize: "11px", color: GREEN_BRIGHT }} />
          <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: GREEN_BRIGHT }}>
            {suggestion.interestedCount}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            background: "rgba(220,80,80,0.08)",
            border: "1px solid rgba(220,80,80,0.15)",
            borderRadius: "6px",
            padding: "3px 8px",
          }}
        >
          <ThumbDownIcon sx={{ fontSize: "11px", color: "rgba(220,120,120,0.8)" }} />
          <Typography
            sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: "rgba(220,120,120,0.8)" }}
          >
            {suggestion.vetoCount}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        <Tooltip title={isBringing ? "Remove from tonight" : "I'm bringing this"} placement="top">
          <IconButton
            onClick={() => onToggleBring(suggestion.gameId)}
            disabled={isLoading}
            size="small"
            sx={{
              background: isBringing ? "rgba(34,85,48,0.3)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${isBringing ? "rgba(60,160,80,0.3)" : BORDER}`,
              borderRadius: "7px",
              color: isBringing ? GREEN_BRIGHT : TEXT_FAINT,
              "&:hover": {
                background: isBringing ? "rgba(34,85,48,0.5)" : "rgba(255,255,255,0.08)",
              },
            }}
          >
            <DirectionsWalkIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="I want to play this" placement="top">
          <IconButton
            onClick={() => onVote(suggestion.gameId, true)}
            disabled={isLoading}
            size="small"
            sx={{
              background:
                suggestion.myVote === true ? "rgba(94,201,122,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${suggestion.myVote === true ? "rgba(94,201,122,0.3)" : BORDER}`,
              borderRadius: "7px",
              color: suggestion.myVote === true ? GREEN_BRIGHT : TEXT_FAINT,
              "&:hover": { background: "rgba(94,201,122,0.15)" },
            }}
          >
            <ThumbUpIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="I'd rather not play this" placement="top">
          <IconButton
            onClick={() => onVote(suggestion.gameId, false)}
            disabled={isLoading}
            size="small"
            sx={{
              background:
                suggestion.myVote === false ? "rgba(220,80,80,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${suggestion.myVote === false ? "rgba(220,80,80,0.25)" : BORDER}`,
              borderRadius: "7px",
              color: suggestion.myVote === false ? "rgba(220,120,120,0.9)" : TEXT_FAINT,
              "&:hover": { background: "rgba(220,80,80,0.1)" },
            }}
          >
            <ThumbDownIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
