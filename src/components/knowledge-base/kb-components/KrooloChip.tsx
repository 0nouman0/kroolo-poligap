import tinycolor from "tinycolor2";
import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material/Chip";

function needColorInterchange(color: string): boolean {
  const c = tinycolor(color);
  return c.isLight();
}

// Omit 'color' from ChipProps to avoid conflict with our custom color prop
export function MetaInfoChip({
  color = "#7073FC",
  label,
  ...props
}: { color?: string; label: string } & Omit<ChipProps, "color">) {
  return (
    <Chip
      {...props}
      label={label}
      sx={{
        flexShrink: 0,
        width: "fit-content",
        height: "22px",
        maxWidth: "100%",
        borderRadius: "32px",
        padding: "0px 8px",
        transition: "ease-in-out 0.35s all",
        fontSize: 12,
        "& .MuiChip-label": {
          p: 0,
          color: needColorInterchange(color) ? "#000" : "#FFF",
          fontSize: 12,
          fontWeight: 400,
          lineHeight: "20px",
        },
        background: color,
        "&.Mui-disabled": {
          opacity: 0.75,
          backgroundColor: `${color} !important`,
        },
        "&.MuiChip-clickable:hover:not(.Mui-disabled)": {
          filter: "brightness(1.1)",
          backgroundColor: `${color} !important`,
        },
        "& .MuiChip-deleteIcon": {
          backgroundColor: `${color} !important`,
          color: needColorInterchange(color)
            ? "#000 !important"
            : "#FFF !important",
          fontSize: 12,
          borderRadius: "32px",
          margin: 0,
          position: "absolute",
          top: 0,
          bottom: 0,
          right: "1px",
          display: "none",
          "& > *": {
            opacity: 0.5,
            "&:hover": { opacity: 0.75 },
          },
        },
        "&:hover .MuiChip-deleteIcon": { display: "grid" },
        ...props?.sx,
      }}
    />
  );
}
