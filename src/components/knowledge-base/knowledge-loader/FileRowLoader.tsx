import { useEffect, useState } from "react";
// import useAiAgentsStore from "../../../../../../store/ai-agents-store";
// import CircularProgressWithLabel from "../../../../../commonComponents/CircularProgressWithLabel";
import useAiAgentsStore from "@/stores/ai-agents-store";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

const FileRowLoader = () => {
  const { isUploadingFileName } = useAiAgentsStore();
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
    <div className="flex items-center justify-start mb-2">
      <div className="flex items-center space-x-3 ">
        <div className="relative top-[4px] left-[3px]">
          <CircularProgressWithLabel
            progress={progress}
            nochangecolor={false}
            progressSize={38}
            fontSize={"12px"}
            fromComp={"notGoal"}
          />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-[var(--text-color)]">
            {isUploadingFileName}
          </div>
          <div className="text-xs text-[var(--secondary-text-color)]">
            Uploading
          </div>
        </div>
      </div>
    </div>
  );
};
export default FileRowLoader;
