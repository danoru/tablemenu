import { gameColor, initials } from "@/lib/helpers";
import {
  BORDER_INK,
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  OLIVE,
  SHADOW_HARD,
  TEXT_FAINT,
  TINT_BRICK,
  TINT_MUSTARD,
  TINT_OLIVE,
} from "@/styles/theme";
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
        borderRadius: "13px",
        backgroundColor: suggestion.bringing ? TINT_OLIVE : "background.paper",
        border: BORDER_INK,
        boxShadow: SHADOW_HARD,
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
              color: "rgba(255,251,240,0.9)",
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
            <Typography
              sx={{ fontFamily: FONT_SANS, fontSize: "11px", fontWeight: 700, color: OLIVE }}
            >
              ✓ In the pool
            </Typography>
          )}
          {playedLastSession && (
            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "11px",
                color: "#a87a20",
                fontWeight: 500,
                background: TINT_MUSTARD,
                border: "1px solid rgba(168,122,32,0.5)",
                borderRadius: "999px",
                padding: "0px 7px",
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
            background: TINT_OLIVE,
            border: `1.5px solid ${OLIVE}`,
            borderRadius: "999px",
            padding: "3px 9px",
          }}
        >
          <ThumbUpIcon sx={{ fontSize: "11px", color: OLIVE }} />
          <Typography
            sx={{ fontFamily: FONT_SANS, fontSize: "12px", fontWeight: 700, color: OLIVE }}
          >
            {suggestion.interestedCount}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            background: TINT_BRICK,
            border: `1.5px solid ${BRICK}`,
            borderRadius: "999px",
            padding: "3px 9px",
          }}
        >
          <ThumbDownIcon sx={{ fontSize: "11px", color: BRICK }} />
          <Typography
            sx={{ fontFamily: FONT_SANS, fontSize: "12px", fontWeight: 700, color: BRICK }}
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
              background: isBringing ? TINT_OLIVE : "transparent",
              border: `1.5px solid ${isBringing ? OLIVE : "rgba(51,39,26,0.3)"}`,
              borderRadius: "8px",
              color: isBringing ? OLIVE : TEXT_FAINT,
              "&:hover": {
                background: isBringing ? TINT_OLIVE : "rgba(51,39,26,0.05)",
                borderColor: isBringing ? OLIVE : INK,
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
              background: suggestion.myVote === true ? TINT_OLIVE : "transparent",
              border: `1.5px solid ${suggestion.myVote === true ? OLIVE : "rgba(51,39,26,0.3)"}`,
              borderRadius: "8px",
              color: suggestion.myVote === true ? OLIVE : TEXT_FAINT,
              "&:hover": { background: TINT_OLIVE, borderColor: OLIVE, color: OLIVE },
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
              background: suggestion.myVote === false ? TINT_BRICK : "transparent",
              border: `1.5px solid ${suggestion.myVote === false ? BRICK : "rgba(51,39,26,0.3)"}`,
              borderRadius: "8px",
              color: suggestion.myVote === false ? BRICK : TEXT_FAINT,
              "&:hover": { background: TINT_BRICK, borderColor: BRICK, color: BRICK },
            }}
          >
            <ThumbDownIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
