import { Box, Typography } from "@mui/material";

const GOLD = "#e8c97a";
const BG_CARD = "#1a1610";
const BORDER = "rgba(180,140,60,0.15)";
const TEXT = "#f0e6cc";
const TEXT_FAINT = "rgba(232,223,200,0.28)";
const FONT_SANS = "'DM Sans', sans-serif";

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
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: "12px",
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
          background: "rgba(180,110,30,0.18)",
          border: `1px solid rgba(180,140,60,0.2)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: GOLD,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "22px",
            fontWeight: 500,
            color: TEXT,
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ fontFamily: FONT_SANS, fontSize: "12px", color: TEXT_FAINT, mt: "2px" }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}
