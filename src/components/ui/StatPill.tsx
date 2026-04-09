import { Box, Typography } from "@mui/material";

export default function GamePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(255,255,255,0.04)",
        border: "divider",
        borderRadius: "20px",
        padding: "6px 14px",
      }}
    >
      <Box sx={{ color: "primary.main", display: "flex", "& svg": { fontSize: "15px" } }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>{label}</Typography>
    </Box>
  );
}
