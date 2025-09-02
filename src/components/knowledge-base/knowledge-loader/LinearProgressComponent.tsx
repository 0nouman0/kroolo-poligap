import React, { useState, useEffect } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface LinearProgressWithLabelProps {
  value: number;
  [key: string]: unknown;
}

export function LinearProgressWithLabel(props: LinearProgressWithLabelProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box
        sx={{ width: "100%", mr: 1 }}
        className={`Pro-bar-${props.value > 50 ? "success" : "error"}`}
      >
        <LinearProgress
          variant="determinate"
          {...props}
          style={{
            height: "8px",
            // width: "134px",
            borderRadius: "4px",
            backgroundColor: "#D0D5DD",
          }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: "var(--text-color)", fontSize: "13px !important" }}
        >{`${Math.round(+props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

interface LinearProgressComponentProps {
  progressValue: number;
}

export default function LinearProgressComponent(
  props: LinearProgressComponentProps
) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(props.progressValue);
  }, [props?.progressValue]);

  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgressWithLabel value={progress} />
    </Box>
  );
}
