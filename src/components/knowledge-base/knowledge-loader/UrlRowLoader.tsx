import LinearProgressComponent from "./LinearProgressComponent";
import { useEffect, useState } from "react";
import { Box } from "@mui/system";

const UrlRowLoader = () => {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const duration = 300000;
    const interval = 100;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);
  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      sx={{
        paddingLeft: "2px",
        "& .MuiLinearProgress-bar": {
          backgroundColor: "var(--btn-color-base) !important",
        },
      }}
    >
      <LinearProgressComponent progressValue={progress} />
    </Box>
  );
};

export default UrlRowLoader;
