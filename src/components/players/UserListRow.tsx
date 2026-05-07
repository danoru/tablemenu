import { avatarColor } from "@/lib/helpers";
import { BORDER_AMBER, FONT_SANS, FONT_SERIF, TEXT_DIM, TEXT_FAINT } from "@/styles/theme";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

export interface UserListEntry {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  bio: string | null;
  isFollowing: boolean;
}

interface Props {
  entry: UserListEntry;
  isSelf: boolean;
  isAuthenticated: boolean;
}

export default function UserListRow({ entry, isSelf, isAuthenticated }: Props) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = React.useState(entry.isFollowing);
  const [loading, setLoading] = React.useState(false);

  const fullName = [entry.firstName, entry.lastName].filter(Boolean).join(" ");

  async function handleFollow(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isFollowing ? "unfollow" : "follow",
          followingUserId: entry.id,
        }),
      });
      if (res.ok) {
        setIsFollowing((prev) => !prev);
      }
    } catch (err) {
      console.error("Follow action failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      onClick={() => router.push(`/players/${entry.username}`)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        padding: "14px 18px",
        cursor: "pointer",
        transition: "border-color 0.15s, transform 0.15s",
        "&:hover": { borderColor: BORDER_AMBER, transform: "translateY(-1px)" },
      }}
    >
      <Box
        sx={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: entry.image ? "transparent" : avatarColor(entry.username),
          border: `1.5px solid ${BORDER_AMBER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {entry.image ? (
          <Box
            alt={entry.username}
            component="img"
            src={entry.image}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "18px",
              fontWeight: 700,
              color: "rgba(232,223,200,0.7)",
              userSelect: "none",
            }}
          >
            {entry.username.slice(0, 1).toUpperCase()}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: FONT_SERIF,
            fontSize: "16px",
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.2,
          }}
        >
          {entry.username}
        </Typography>
        {fullName && (
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "13px",
              color: TEXT_DIM,
              lineHeight: 1.3,
            }}
          >
            {fullName}
          </Typography>
        )}
        {entry.bio && (
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "12px",
              color: TEXT_FAINT,
              lineHeight: 1.4,
              mt: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {entry.bio}
          </Typography>
        )}
      </Box>

      {!isSelf && isAuthenticated && (
        <Button
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={12} sx={{ color: "inherit" }} />
            ) : isFollowing ? (
              <PersonRemoveIcon sx={{ fontSize: "14px !important" }} />
            ) : (
              <PersonAddIcon sx={{ fontSize: "14px !important" }} />
            )
          }
          onClick={handleFollow}
          sx={{
            borderRadius: "8px",
            fontFamily: FONT_SANS,
            fontSize: "12px",
            fontWeight: 500,
            padding: "6px 14px",
            textTransform: "none",
            flexShrink: 0,
            transition: "all 0.15s",
            ...(isFollowing
              ? {
                  background: "transparent",
                  border: `1px solid ${BORDER_AMBER}`,
                  color: TEXT_DIM,
                  "&:hover": {
                    borderColor: "rgba(220,80,80,0.4)",
                    color: "rgba(220,120,120,0.9)",
                    background: "rgba(220,80,80,0.06)",
                  },
                }
              : {
                  backgroundColor: "primary.main",
                  border: "none",
                  color: "background.default",
                  "&:hover": { backgroundColor: "primary.light" },
                }),
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          {loading ? "" : isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </Box>
  );
}
