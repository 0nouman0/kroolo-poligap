import React from "react";
import "./styles/LoadingSpinner.css";
import { CircularProgress } from "@mui/material";

export default function LoadingSpinner({
  size = 20,
  noMargin = false,
  margin = 0,
  ...props
}) {
  return (
    <CircularProgress
      disableShrink
      style={{ color: "inherit" }}
      color="inherit"
      size={size}
      sx={{
        margin: noMargin ? 0 : margin,
        marginRight: noMargin ? 0 : 1,
        ...props?.style,
      }}
    />
  );
}
