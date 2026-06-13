import { MUSTARD } from "@/styles/theme";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Box } from "@mui/material";
import React from "react";

export default function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = React.useState(0);
  return (
    <Box sx={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <Box
            key={star}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange?.(star)}
            sx={{
              cursor: readonly ? "default" : "pointer",
              color: filled ? MUSTARD : "rgba(51,39,26,0.3)",
              display: "flex",
              transition: "color 0.15s",
              "& svg": { fontSize: "22px" },
              "& svg path": filled ? { stroke: "rgba(51,39,26,0.6)", strokeWidth: 0.5 } : {},
            }}
          >
            {filled ? <StarIcon /> : <StarBorderIcon />}
          </Box>
        );
      })}
    </Box>
  );
}
