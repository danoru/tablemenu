import { avatarColor } from "@/lib/helpers";
import { FONT_SERIF, INK } from "@/styles/theme";
import { Box, Tooltip, Typography } from "@mui/material";

interface FriendEntry {
  id: number;
  username: string;
  image: string | null;
}

export default function FriendMiniAvatar({
  friend,
  onClick,
}: {
  friend: FriendEntry;
  onClick: () => void;
}) {
  return (
    <Tooltip title={friend.username}>
      <Box
        onClick={onClick}
        sx={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: friend.image ? "transparent" : avatarColor(friend.username),
          border: `2px solid ${INK}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          transition: "transform 0.15s",
          "&:hover": { transform: "scale(1.1)" },
          overflow: "hidden",
        }}
      >
        {friend.image ? (
          <Box
            component="img"
            src={friend.image}
            alt={friend.username}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "11px",
              fontWeight: 700,
              color: "rgba(255,251,240,0.9)",
              userSelect: "none",
            }}
          >
            {friend.username.slice(0, 1).toUpperCase()}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}
