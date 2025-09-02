import {
  Box,
  CircularProgress,
  Typography,
  circularProgressClasses,
} from "@mui/material";
import React from "react";

interface CircularProgressWithLabelProps {
  progress: number;
  progressSize?: number;
  fromComp?: string;
  fontSize?: string;
  [key: string]: unknown; // for other props
}

export default function CircularProgressWithLabel({
  progress,
  progressSize = 15,
  fromComp,
  fontSize = "7px",
  ...props
}: CircularProgressWithLabelProps) {
  // progress => decides the filled progress
  // progressSize => size of ring
  // fontSize => label font size of progress
  // other props will be spread to the CircularProgress
  return (
    <Box sx={{ position: "relative" }}>
      <CircularProgress
        variant="determinate"
        sx={{
          color: "#EAECF0",
        }}
        size={progressSize}
        thickness={3}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="determinate"
        sx={{
          color: progress > 50 ? "#039855" : "#F97066",
          position: "absolute",
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: "round",
          },
        }}
        size={progressSize}
        thickness={3}
        value={progress}
        {...props}
      />
      <Box
        sx={{
          top: 1,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: `${progressSize}px`,
          height: `${progressSize ? progressSize : 24}px`,
        }}
      >
        <Typography
          className="themed-text-color font-family"
          fontSize={fontSize}
          fontWeight={600}
          // paddingBottom={fromComp === "GoalList" ? "3px" : "0px"}
          lineHeight={fromComp === "GoalList" ? "0px" : "18px"}
          sx={{ marginBottom: "2px" }}
        >
          {Math.round(+progress)}%
        </Typography>
      </Box>
    </Box>
  );
}
