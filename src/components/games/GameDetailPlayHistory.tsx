import { FONT_SANS, TEXT_DIM, TEXT_FAINT } from "@/styles/theme";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box, Tooltip, Typography } from "@mui/material";
import { useRouter } from "next/router";

interface PlaySession {
  id: number;
  playedAt: string;
  durationMin: number | null;
  notes: string | null;
  won: boolean | null;
  roomName: string | null;
  roomCode: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PlayHistoryRow({
  session,
  isCompetitive,
}: {
  session: PlaySession;
  isCompetitive?: boolean;
}) {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid divider",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isCompetitive !== false && session.won === true ? (
          <Tooltip title="Won this session">
            <EmojiEventsIcon sx={{ color: "primary.main", fontSize: "18px" }} />
          </Tooltip>
        ) : (
          <Box sx={{ width: "18px" }} />
        )}
        <Box>
          <Typography sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: "text.primary" }}>
            {formatDate(session.playedAt)}
          </Typography>
          <Box sx={{ display: "flex", gap: "8px", alignItems: "center", mt: "2px" }}>
            {session.roomName && (
              <Typography
                onClick={() => router.push(`/rooms/${session.roomCode}`)}
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "11px",
                  color: TEXT_FAINT,
                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                }}
              >
                {session.roomName}
              </Typography>
            )}
            {session.notes && (
              <Typography
                sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_DIM, mt: "2px" }}
              >
                {session.notes}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {session.durationMin && (
        <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT }}>
          {session.durationMin} min
        </Typography>
      )}
    </Box>
  );
}
