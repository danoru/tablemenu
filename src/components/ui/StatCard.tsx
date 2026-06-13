import { BRICK, FONT_SANS, INK, SHADOW_HARD, TINT_MUSTARD } from "@/styles/theme";
import { Box, Typography } from "@mui/material";

export default function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        border: `2px solid ${INK}`,
        borderRadius: "13px",
        boxShadow: SHADOW_HARD,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: TINT_MUSTARD,
          border: `2px solid ${INK}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: BRICK,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "24px",
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "11px",
            fontWeight: 500,
            color: "text.secondary",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            mt: "3px",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}
