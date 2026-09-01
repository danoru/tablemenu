import GameArt from "@/components/games/GameArt";
import { avatarColor } from "@/lib/helpers";
import type { FriendActivityEvent } from "@/services/friendActivity";
import { BORDER_INK, FONT_SANS, FONT_SERIF, INK, TEXT_DIM, TEXT_FAINT } from "@/styles/theme";
import { Box, Divider, Typography } from "@mui/material";
import { useRouter } from "next/router";

/** "just now" / "4h ago" / "3d ago" / a plain date once it stops being news. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const minutes = Math.floor((Date.now() - then) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
  if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / (60 * 24))}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function verb(event: FriendActivityEvent): string {
  switch (event.kind) {
    case "ADDED":
      return "added";
    case "WISHLISTED":
      return "wants to play";
    case "RATED":
      return `rated ${event.stars}★`;
    case "PLAYED":
      return "played";
    case "ACHIEVEMENT":
      return "earned";
  }
}

export default function FriendActivityFeed({ events }: { events: FriendActivityEvent[] }) {
  const router = useRouter();

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        border: BORDER_INK,
        borderRadius: "13px",
        overflow: "hidden",
      }}
    >
      {events.map((event, i) => (
        <Box key={event.id}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 18px",
              "&:hover": { background: "rgba(51,39,26,0.05)" },
              transition: "background 0.15s",
            }}
          >
            <Box
              onClick={() => router.push(`/players/${event.username}`)}
              sx={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: avatarColor(event.username),
                border: BORDER_INK,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "rgba(255,251,240,0.9)",
                  userSelect: "none",
                }}
              >
                {event.username.slice(0, 1).toUpperCase()}
              </Typography>
            </Box>

            <Typography
              sx={{
                flex: 1,
                minWidth: 0,
                fontFamily: FONT_SANS,
                fontSize: "13px",
                color: TEXT_DIM,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Box
                component="span"
                onClick={() => router.push(`/players/${event.username}`)}
                sx={{ fontWeight: 700, color: INK, cursor: "pointer" }}
              >
                {event.username}
              </Box>{" "}
              {verb(event)}{" "}
              {event.game ? (
                <Box
                  component="span"
                  onClick={() => router.push(`/games/${event.game!.gameId}`)}
                  sx={{ fontWeight: 500, color: INK, cursor: "pointer" }}
                >
                  {event.game.name}
                </Box>
              ) : (
                <Box component="span" sx={{ fontWeight: 500, color: INK }}>
                  {event.achievement?.icon} {event.achievement?.name}
                </Box>
              )}
            </Typography>

            {event.game && (
              <GameArt game={{ name: event.game.name, imageUrl: event.game.imageUrl }} size={30} />
            )}

            <Typography
              sx={{
                fontFamily: FONT_SANS,
                fontSize: "11px",
                color: TEXT_FAINT,
                flexShrink: 0,
                minWidth: "52px",
                textAlign: "right",
              }}
            >
              {timeAgo(event.at)}
            </Typography>
          </Box>
          {i < events.length - 1 && <Divider sx={{ borderColor: "divider", mx: "18px" }} />}
        </Box>
      ))}
    </Box>
  );
}
