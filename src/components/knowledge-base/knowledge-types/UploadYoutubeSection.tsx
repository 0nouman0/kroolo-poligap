import { Stack, Typography } from "@mui/material";
// import useAiAgentsStore from "../../../../../../store/ai-agents-store";
// import LoadingSpinner from "../../../../../LoadingSpinner";
import { useState } from "react";
import { IoLogoYoutube } from "react-icons/io5";
import UrlRowLoader from "../knowledge-loader/UrlRowLoader";
// import { isValidYoutubeUrl } from "../../../../../../util/tools";
// import { toastWarning } from "../../../../../toast";
// import useGetMediaList from "../../hooks/useGetMediaList";
import { AgentUploadUrlRow } from "../AgentUploadUrlRow";
// import TertiaryButton from "../../../../../HelpCenter/TertiaryButton";
import useAiAgentsStore from "@/stores/ai-agents-store";
import LoadingSpinner from "../knowledge-loader/LoadingSpinner";
import { toastWarning } from "@/components/toast-varients";
import useGetMediaList from "../hooks/useGetMediaList";
import TertiaryButton from "../kb-components/TertiaryButton";

interface UploadYoutubeSectionProps {
  from: string;
  id: string;
  enabledKnowledge: boolean;
}

interface YoutubeData {
  fileUrl: string;
  fileName: string;
  fileType: string;
  agentId?: string;
}

interface MediaItem {
  fileType?: string;
  _id?: string;
  [key: string]: unknown;
}

export const UploadYoutubeSection = ({
  from,
  id,
  enabledKnowledge,
}: UploadYoutubeSectionProps) => {
  const [youtubeData, setYoutubeData] = useState("");
  const {
    createdAgentDetailData,
    saveLinkAPI,
    isLoadingSavingMedia,
    uploadsArray,
  } = useAiAgentsStore();

  const mediaArray: MediaItem[] =
    from === "chat-with-agent" ? createdAgentDetailData?.media : uploadsArray;

  const isValidYoutubeUrl = (url: string): boolean => {
    return !!url.match(
      /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(?!channel\/)(?!@)(.+)?$/
    );
  };

  const handleScrapYoutube = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isValidYoutubeUrl(youtubeData)) {
      toastWarning("Invalid Youtube URL", "Enter a valid youtube URL");
    } else {
      fetch(`https://noembed.com/embed?dataType=json&url=${youtubeData}`)
        .then((res) => res.json())
        .then((data: { url?: string; title?: string }) => {
          const requestData: { [key: string]: any } = {
            fileUrl: data?.url || "",
            fileName: data?.title || "",
            fileType: "youtube",
          };
          if (from === "chat-with-agent") {
            requestData.agentId = id;
          }
          setYoutubeData("");
          saveLinkAPI(requestData, "youtube");
        });
    }
  };

  const mediaList = useGetMediaList(mediaArray, "youtube");
  return (
    <Stack
      direction="column"
      gap={1}
      width="100%"
      sx={{
        border: "1px solid var(--card-border)",
        borderRadius: "8px",
        padding: 1.5,
      }}
      className={!enabledKnowledge ? "kroolo-disabled" : ""}
    >
      <Stack direction="row" gap={0.5}>
        <IoLogoYoutube
          style={{
            width: 20,
            height: 20,
            color: "var(--secondary-text-color)",
          }}
        />{" "}
        <Typography fontWeight={500} fontSize="14px" color="var(--text-color)">
          Add Youtube
        </Typography>
      </Stack>
      <div className="px-1">
        <div className="flex gap-3 mb-3">
          <input
            type="url"
            value={youtubeData}
            onChange={(e) => {
              setYoutubeData(e.target.value);
            }}
            disabled={!enabledKnowledge}
            className={`flex-1 h-[30px] px-3 placeholder:text-[13px] placeholder:text-[var(--secondary-text-color)]  text-[var(--text-color)] text-[13px]   border border-[var(--card-border)] focus:outline-none rounded-lg ${
              !enabledKnowledge ? "opacity-50 cursor-not-allowed" : ""
            }`}
            placeholder="Paste YouTube link"
          />
          <TertiaryButton
            disabled={!enabledKnowledge || isLoadingSavingMedia === "youtube"}
            startIcon={
              isLoadingSavingMedia === "youtube" ? (
                <LoadingSpinner size={18} />
              ) : null
            }
            sx={{
              padding: "0px 8px",
              pointerEvents:
                !enabledKnowledge || isLoadingSavingMedia === "youtube"
                  ? "none"
                  : "auto",
            }}
            onClick={handleScrapYoutube}
          >
            {isLoadingSavingMedia === "youtube"
              ? "Fetching..."
              : mediaList?.length > 0
              ? "Fetch More Link"
              : "Fetch Link"}
          </TertiaryButton>
        </div>
        {isLoadingSavingMedia === "youtube" && <UrlRowLoader />}

        <p className="text-[12px] text-[var(--secondary-text-color)] mt-2 px-0.5">
          Add YouTube transcripts as knowledge.
        </p>
      </div>
      <Stack direction="column">
        {mediaList?.length > 0 &&
          mediaList?.map((media, index) => (
            <AgentUploadUrlRow
              from={from}
              id={id}
              media={
                media as unknown as {
                  _id: string;
                  fileName: string;
                  fileType: string;
                  fileUrl?: string;
                  projectColor?: string;
                  documentId?: string;
                }
              }
              key={String(media?._id || index)}
            />
          ))}
      </Stack>
    </Stack>
  );
};
