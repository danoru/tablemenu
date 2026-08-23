import { Box, Typography } from "@mui/material";

import { FONT_SANS, INK, SURFACE } from "@/styles/theme";

// Ink flag-ribbon with notched ends — the section-header treatment shared with
// the PDF menu (which draws the same shape as an Svg polygon).
const RIBBON_CLIP = "polygon(0 0, 100% 0, calc(100% - 12px) 50%, 100% 100%, 0 100%, 12px 50%)";

export default function RibbonLabel({
  label,
  icon,
  fullWidth = false,
}: {
  label: string;
  icon?: string;
  fullWidth?: boolean;
}) {
  return (
    <Box
      sx={{
        display: fullWidth ? "flex" : "inline-flex",
        width: fullWidth ? "100%" : "auto",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        backgroundColor: INK,
        clipPath: RIBBON_CLIP,
        padding: fullWidth ? "7px 24px" : "8px 32px",
      }}
    >
      {icon ? (
        <Box component="span" sx={{ fontSize: "13px", lineHeight: 1 }}>
          {icon}
        </Box>
      ) : null}
      <Typography
        sx={{
          fontFamily: FONT_SANS,
          fontSize: "11px",
          fontWeight: 700,
          color: SURFACE,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
