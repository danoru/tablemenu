import { FONT_SANS, GOLD, TEXT_FAINT } from "@/styles/theme";
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
        background: "background.paper",
        border: "1px solid",
        borderColor: "divider",
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
            color: "text.primary",
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
