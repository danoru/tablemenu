import type { TasteProfile } from "@/services/tasteProfile";
import {
  AMBER_DIM,
  BG_ELEVATED,
  BORDER_AMBER,
  FONT_SANS,
  FONT_SERIF,
  GOLD,
  GOLD_FADED,
  TEXT_DIM,
  TEXT_FAINT,
} from "@/styles/theme";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import {
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  IconButton,
  Slide,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";

interface Props {
  profile: TasteProfile;
  username: string;
  isSelf: boolean;
}

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function StatBlock({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <Box sx={{ flex: 1, minWidth: "100px" }}>
      <Typography
        sx={{
          fontFamily: FONT_SANS,
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: TEXT_FAINT,
          mb: "4px",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: FONT_SERIF,
          fontSize: "20px",
          fontWeight: 700,
          color: "text.primary",
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
      {sublabel && (
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "11px",
            color: TEXT_FAINT,
            mt: "2px",
          }}
        >
          {sublabel}
        </Typography>
      )}
    </Box>
  );
}

function TagRow({
  label,
  items,
  color = TEXT_DIM,
}: {
  label: string;
  items: string[];
  color?: string;
}) {
  if (items.length === 0) return null;
  return (
    <Box sx={{ mb: "10px" }}>
      <Typography
        sx={{
          fontFamily: FONT_SANS,
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: TEXT_FAINT,
          mb: "6px",
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {items.map((it) => (
          <Box
            key={it}
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "12px",
              color,
              padding: "4px 10px",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "999px",
              background: "transparent",
            }}
          >
            {it}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function TasteProfileBody({ profile, username }: { profile: TasteProfile; username: string }) {
  const complexityLabel = profile.complexity
    ? `${profile.complexity.tier}${profile.complexity.specialist ? " (specialist)" : ""}`
    : "—";
  const complexityValue = profile.complexity
    ? `${profile.complexity.value.toFixed(1)} / 5`
    : undefined;

  const attentionLabel = profile.attention ? profile.attention.tier : "—";
  const attentionValue = profile.attention
    ? `${profile.attention.medianMinutes} min median`
    : undefined;

  const sweetLabel = profile.sweetSpot ? `${profile.sweetSpot} players` : "—";

  return (
    <>
      <Box sx={{ position: "relative", textAlign: "center", mb: "20px" }}>
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: GOLD_FADED,
            mb: "6px",
          }}
        >
          The Palate of {username}
        </Typography>
        <Typography
          sx={{
            fontFamily: FONT_SERIF,
            fontSize: { xs: "26px", md: "32px" },
            fontWeight: 900,
            color: GOLD,
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
            mb: "6px",
          }}
        >
          {profile.archetype.name}
        </Typography>
        <Typography
          sx={{
            fontFamily: FONT_SERIF,
            fontSize: "14px",
            fontStyle: "italic",
            color: TEXT_DIM,
          }}
        >
          {profile.archetype.tagline}
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          padding: "16px 0",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
          mb: "20px",
        }}
      >
        <StatBlock label="Complexity" sublabel={complexityValue} value={complexityLabel} />
        <StatBlock label="Attention" sublabel={attentionValue} value={attentionLabel} />
        <StatBlock label="Sweet Spot" value={sweetLabel} />
        {profile.era && <StatBlock label="Era" value={profile.era} />}
      </Box>

      <Box sx={{ position: "relative" }}>
        <TagRow color={GOLD} items={profile.loves} label="Loves" />
        <TagRow items={profile.allergies} label="Allergic to" />

        {profile.highlights.length > 0 && (
          <Box
            sx={{
              mt: "12px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: AMBER_DIM,
              border: "1px solid",
              borderColor: BORDER_AMBER,
            }}
          >
            {profile.highlights.map((h) => (
              <Typography
                key={h}
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "13px",
                  color: TEXT_DIM,
                  lineHeight: 1.7,
                  "&:not(:last-of-type)": {
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: "6px",
                    mb: "6px",
                  },
                }}
              >
                {h}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      <Typography
        sx={{
          fontFamily: FONT_SANS,
          fontSize: "11px",
          color: TEXT_FAINT,
          textAlign: "center",
          mt: "16px",
        }}
      >
        Based on {profile.ownedCount} game{profile.ownedCount === 1 ? "" : "s"}
        {profile.ratedCount > 0 ? ` · ${profile.ratedCount} rated` : ""}
      </Typography>
    </>
  );
}

export default function TasteProfileCard({ profile, username, isSelf }: Props) {
  const [open, setOpen] = React.useState(false);

  const ready = profile.ready;
  const headlineLabel = ready
    ? profile.archetype.name
    : isSelf
      ? "Build your palate"
      : "Palate not ready";
  const subline = ready
    ? profile.archetype.tagline
    : isSelf
      ? "Add 5+ games to reveal it"
      : `${username} hasn't built one up yet`;

  return (
    <>
      <ButtonBase
        sx={{
          width: "100%",
          textAlign: "left",
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: ready ? BORDER_AMBER : "divider",
          borderRadius: "12px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          transition: "border-color 0.15s, transform 0.15s",
          "&:hover": {
            borderColor: ready ? GOLD_FADED : BORDER_AMBER,
            transform: "translateY(-1px)",
          },
        }}
        onClick={() => setOpen(true)}
      >
        <Box
          sx={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: AMBER_DIM,
            border: "1px solid",
            borderColor: BORDER_AMBER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <RestaurantMenuIcon sx={{ fontSize: "18px", color: GOLD }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: GOLD_FADED,
              mb: "2px",
            }}
          >
            Palate
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_SERIF,
              fontSize: "16px",
              fontWeight: 700,
              color: ready ? "text.primary" : TEXT_DIM,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {headlineLabel}
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "12px",
              fontStyle: "italic",
              color: TEXT_FAINT,
              mt: "1px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subline}
          </Typography>
        </Box>
        <ArrowForwardIcon sx={{ fontSize: "16px", color: GOLD_FADED, flexShrink: 0 }} />
      </ButtonBase>

      <Dialog
        fullWidth
        TransitionComponent={SlideUp}
        maxWidth="sm"
        open={open}
        PaperProps={{
          sx: {
            background: BG_ELEVATED,
            border: `1px solid ${BORDER_AMBER}`,
            borderRadius: "14px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            overflow: "hidden",
          },
        }}
        onClose={() => setOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "180px",
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(200,150,42,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <IconButton
          sx={{
            position: "absolute",
            top: "12px",
            right: "12px",
            color: TEXT_FAINT,
            zIndex: 1,
            "&:hover": { color: TEXT_DIM },
          }}
          onClick={() => setOpen(false)}
        >
          <CloseIcon sx={{ fontSize: "20px" }} />
        </IconButton>
        <DialogContent sx={{ padding: { xs: "32px 24px", md: "40px 36px" }, position: "relative" }}>
          {ready ? (
            <TasteProfileBody profile={profile} username={username} />
          ) : (
            <Box sx={{ textAlign: "center", py: "24px" }}>
              <Typography
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: GOLD_FADED,
                  mb: "8px",
                }}
              >
                The Palate of {username}
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "text.primary",
                  mb: "10px",
                }}
              >
                {profile.archetype.name}
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT_SANS,
                  fontSize: "14px",
                  fontStyle: "italic",
                  color: TEXT_DIM,
                  maxWidth: "320px",
                  margin: "0 auto",
                }}
              >
                {isSelf
                  ? "Add at least 5 games to your library to reveal your palate."
                  : `${username} hasn't built up a palate yet.`}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
