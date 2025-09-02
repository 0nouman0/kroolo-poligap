import React from "react";
import { CircularProgress, SxProps } from "@mui/material";

interface LoadingSpinnerProps {
  size?: number;
  noMargin?: boolean;
  margin?: number;
  style?: React.CSSProperties;
  sx?: SxProps;
}

export default function LoadingSpinner({
  size = 20,
  noMargin = false,
  margin = 0,
  ...props
}: LoadingSpinnerProps) {
  return (
    <CircularProgress
      disableShrink
      style={{ color: "inherit" }}
      color="inherit"
      size={size}
      sx={{
        margin: noMargin ? 0 : margin,
        marginRight: noMargin ? 0 : 1,
        animation: "spin 800ms linear infinite",
        "@keyframes spin": {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg)",
          },
        },
        ...props?.sx,
      }}
    />
  );
}
