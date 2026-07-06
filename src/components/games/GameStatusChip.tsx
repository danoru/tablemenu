import { FONT_SANS, TEAL, TINT_TEAL } from "@/styles/theme";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { Box, Typography } from "@mui/material";

export default function GameStatusChip({
  wishlisted,
  username,
}: {
  wishlisted: boolean;
  username?: string;
}) {
  if (!wishlisted) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: "6px",
        right: "6px",
        background: TINT_TEAL,
        border: `1.5px solid ${TEAL}`,
        borderRadius: "999px",
        padding: "2px 7px",
        display: "flex",
        alignItems: "center",
        gap: "3px",
      }}
    >
      <BookmarkIcon sx={{ fontSize: "9px", color: TEAL }} />
      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "9px", color: TEAL, fontWeight: 600 }}>
        {username ? `${username} wants to play` : "On a wishlist"}
      </Typography>
    </Box>
  );
}
