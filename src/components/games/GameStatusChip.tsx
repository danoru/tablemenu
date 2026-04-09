import { BLUE, BORDER_BLUE, BG_BLUE, FONT_SANS } from "@/styles/theme";
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
        background: BG_BLUE,
        border: `1px solid ${BORDER_BLUE}`,
        borderRadius: "6px",
        padding: "2px 6px",
        display: "flex",
        alignItems: "center",
        gap: "3px",
        backdropFilter: "blur(4px)",
      }}
    >
      <BookmarkIcon sx={{ fontSize: "9px", color: BLUE }} />
      <Typography sx={{ fontFamily: FONT_SANS, fontSize: "9px", color: BLUE, fontWeight: 600 }}>
        {username ? `${username} wants to play` : "On a wishlist"}
      </Typography>
    </Box>
  );
}
