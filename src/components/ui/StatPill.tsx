import { INK } from "@/styles/theme";
import { Box, Typography } from "@mui/material";

export default function GamePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: "background.paper",
        border: `2px solid ${INK}`,
        borderRadius: "999px",
        padding: "6px 14px",
      }}
    >
      <Box sx={{ color: "primary.main", display: "flex", "& svg": { fontSize: "15px" } }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "text.primary" }}>
        {label}
      </Typography>
    </Box>
  );
}
