import { FONT_SANS, INK, MUSTARD, SHADOW_HARD } from "@/styles/theme";
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
        padding: "4px 14px",
        border: `2px solid ${active ? INK : "rgba(51,39,26,0.3)"}`,
        borderRadius: "999px",
        background: active ? MUSTARD : "background.paper",
        boxShadow: active ? SHADOW_HARD : "none",
        color: active ? INK : "text.secondary",
        fontFamily: FONT_SANS,
        fontSize: "13px",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.12s ease",
        userSelect: "none",
        "&:hover": {
          borderColor: INK,
          color: INK,
          transform: active ? "none" : "translate(-1px, -1px)",
        },
      }}
    >
      {label}
    </Box>
  );
}
