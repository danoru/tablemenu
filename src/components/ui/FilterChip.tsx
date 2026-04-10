import { AMBER_DIM, BORDER_AMBER, FONT_SANS, TEXT_DIM, TEXT_FAINT } from "@/styles/theme";
import { Box } from "@mui/material";

export default function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 14px",
        border: "1px solid",
        borderColor: `${active ? BORDER_AMBER : "divider"}`,
        borderRadius: "20px",
        background: active ? AMBER_DIM : "transparent",
        color: active ? "primary.main" : TEXT_FAINT,
        fontFamily: FONT_SANS,
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        userSelect: "none",
        "&:hover": { borderColor: BORDER_AMBER, color: TEXT_DIM },
      }}
    >
      {label}
    </Box>
  );
}
