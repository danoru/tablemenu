import { FONT_SANS, TEXT_FAINT } from "@/styles/theme";
import { Box, Typography } from "@mui/material";
import FriendMiniAvatar from "../players/FriendMiniAvatar";

interface FriendEntry {
  id: number;
  username: string;
  image: string | null;
}

export default function FriendActivityRow({
  label,
  friends,
  accentColor,
  onNavigate,
}: {
  label: { plural: string; singular: string };
  friends: FriendEntry[];
  accentColor: string;
  onNavigate: (username: string) => void;
}) {
  if (friends.length === 0) return null;

  const displayLabel =
    friends.length === 1
      ? `1 friend ${label.singular}`
      : `${friends.length} friends ${label.plural}`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 0",
        borderBottom: "1px solid divider",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT_SANS,
          fontSize: "12px",
          color: accentColor,
          fontWeight: 500,
          flex: 1,
          minWidth: 0,
        }}
      >
        {displayLabel}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        {friends.slice(0, 6).map((f, i) => (
          <Box key={f.id} sx={{ ml: i > 0 ? "-6px" : 0, zIndex: friends.length - i }}>
            <FriendMiniAvatar friend={f} onClick={() => onNavigate(f.username)} />
          </Box>
        ))}
        {friends.length > 6 && (
          <Box
            sx={{
              ml: "-6px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: `1.5px solid rgba(180,140,60,0.25)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontFamily: FONT_SANS, fontSize: "9px", color: TEXT_FAINT }}>
              +{friends.length - 6}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
