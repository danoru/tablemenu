import { gameColor, initials } from "@/lib/helpers";
import { FONT_SANS, FONT_SERIF, TEXT_FAINT } from "@/styles/theme";
import type { RoomSuggestion } from "@api/rooms/[code]/index";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import GameStatusChip from "../games/GameStatusChip";

export default function GameDetailSuggestions({
  suggestion,
  isHost,
  currentUserId,
  onVote,
  onToggleBring,
  loadingGameId,
  playedLastSession,
}: {
  suggestion: RoomSuggestion;
  isHost: boolean;
  currentUserId: number;
  onVote: (gameId: number, interested: boolean) => void;
  onToggleBring: (gameId: number) => void;
  loadingGameId: number | null;
  playedLastSession?: boolean;
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
        border: `1px solid ${suggestion.bringing ? "rgba(60,160,80,0.2)" : "divider"}`,
        transition: "all 0.15s",
        mb: "8px",
      }}
    >
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <Box
          sx={{
            width: "44px",
            height: "44px",
            borderRadius: "8px",
            background: gameColor(suggestion.name),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
        <GameStatusChip
          wishlisted={suggestion.wishlistedBy?.length > 0}
          username={suggestion.wishlistedBy?.length === 1 ? suggestion.wishlistedBy[0] : undefined}
        />
      </Box>
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
          {suggestion.name}
        </Typography>
        <Box sx={{ display: "flex", gap: "8px", mt: "3px", alignItems: "center" }}>
          {suggestion.bringing && (
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "11px", color: "secondary.light" }}>
              ✓ In the pool
            </Typography>
          )}
          {playedLastSession && (
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "11px",
                color: "rgba(200,150,42,0.7)",
                background: "rgba(200,150,42,0.08)",
                border: "1px solid rgba(200,150,42,0.18)",
                borderRadius: "4px",
                padding: "0px 5px",
                lineHeight: "18px",
              }}
            >
              played last session
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
          <ThumbUpIcon sx={{ fontSize: "11px", color: "secondary.light" }} />
          <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: "secondary.light" }}>
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
              border: `1px solid ${isBringing ? "rgba(60,160,80,0.3)" : "divider"}`,
              borderRadius: "7px",
              color: isBringing ? "primary.light" : TEXT_FAINT,
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
              border: `1px solid ${suggestion.myVote === true ? "rgba(94,201,122,0.3)" : "divider"}`,
              borderRadius: "7px",
              color: suggestion.myVote === true ? "primary.light" : TEXT_FAINT,
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
              border: `1px solid ${suggestion.myVote === false ? "rgba(220,80,80,0.25)" : "divider"}`,
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
