import { Stack, Tooltip, Typography } from "@mui/material";
import { Info } from "lucide-react";
import { PiLinkBold } from "react-icons/pi";
// import useAiAgentsStore from "../../../../../../store/ai-agents-store";
// import LoadingSpinner from "../../../../../LoadingSpinner";
// import { isValidURLWithoutScheme as validateURL } from "../../../../../Dashboard/Channels/ChannelComment";
import { useEffect, useState } from "react";
import UrlRowLoader from "../knowledge-loader/UrlRowLoader";
// import useGetMediaList from "../../hooks/useGetMediaList";
import { AgentUploadUrlRow } from "../AgentUploadUrlRow";
// import TertiaryButton from "../../../../../HelpCenter/TertiaryButton";
// import { toastWarning } from "../../../../../toast";
import useAiAgentsStore from "@/stores/ai-agents-store";
import LoadingSpinner from "../knowledge-loader/LoadingSpinner";
import useGetMediaList from "../hooks/useGetMediaList";
import TertiaryButton from "../kb-components/TertiaryButton";
import { toastWarning } from "@/components/toast-varients";

interface ScrapURLSectionProps {
  from: string;
  id: string;
  enabledKnowledge: boolean;
}

interface LinkData {
  fileUrl: string;
  fileName: string;
  fileType: string;
  agentId?: string;
}

export const ScrapURLSection = ({
  from,
  id,
  enabledKnowledge,
}: ScrapURLSectionProps) => {
  const [linkData, setLinkData] = useState("");
  const [linkError, setLinkError] = useState("");
  const {
    createdAgentDetailData,
    saveLinkAPI,
    isLoadingSavingMedia,
    uploadsArray,
  } = useAiAgentsStore();

  const mediaArray =
    from === "chat-with-agent" ? createdAgentDetailData?.media : uploadsArray;

  // handlers
  function convertToHttpsUrl(inputUrl: string): string {
    const pattern =
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+)(.*)$/;
    const replacement = "https://$3$5";
    return inputUrl.replace(pattern, replacement);
  }

  function validateURL(string: string): boolean {
    const res = string.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g
    );

    return res !== null;
  }

  useEffect(() => {
    if (linkError === "Error") {
      toastWarning("Invalid URL", "Enter a valid website URL");
      setTimeout(() => {
        setLinkError("");
      }, 500);
    }
  }, [linkError]);

  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLinkData(value);
  };

  const handleScrapUrl = () => {
    if (!validateURL(linkData)) setLinkError("Error");
    else {
      const link = linkData?.replace(/^(https?:\/\/)?(www\.)?/, "");
      const fileName = link?.split(/[./]/)[0];
      const data: { [key: string]: any } = {
        fileUrl: convertToHttpsUrl(linkData),
        fileName: fileName?.charAt(0)?.toUpperCase() + fileName?.slice(1),
        fileType: "link",
      };
      if (from === "chat-with-agent") {
        data.agentId = id;
      }
      setLinkData("");
      saveLinkAPI(data, "link");
    }
  };

  const mediaList = useGetMediaList(mediaArray, "link");

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
        <PiLinkBold
          style={{
            width: 20,
            height: 20,
            color: "var(--secondary-text-color)",
          }}
        />{" "}
        <Typography fontWeight={500} fontSize="14px" color="var(--text-color)">
          Add Website
        </Typography>
      </Stack>
      <div className="px-1">
        <div className="flex items-center gap-2 mb-2">
          <h1 className=" text-sm  font-medium text-[var(--text-color)]">
            Crawl
          </h1>
          <Tooltip title="Crawl all the links starting with the URL (not including files on the website)">
            <Info className="w-4 h-4 text-[var(--text-color)]" />
          </Tooltip>
        </div>

        <div className="flex gap-3 mb-3">
          <input
            type="url"
            value={linkData}
            onChange={handleLinkInputChange}
            disabled={!enabledKnowledge}
            className={`flex-1 h-[30px] px-3 placeholder:text-[13px] placeholder:text-[var(--secondary-text-color)] text-[13px] text-[var(--text-color)]  border  ${
              linkError ? "border-[#F04438] " : "border-[var(--card-border)]"
            }  focus:outline-none rounded-lg ${
              !enabledKnowledge ? "opacity-50 cursor-not-allowed" : ""
            }`}
            placeholder="https://www.example.com"
          />
          <TertiaryButton
            disabled={!enabledKnowledge || isLoadingSavingMedia === "link"}
            startIcon={
              isLoadingSavingMedia === "link" ? (
                <LoadingSpinner size={18} />
              ) : null
            }
            sx={{
              padding: "0px 8px",
              pointerEvents:
                !enabledKnowledge || isLoadingSavingMedia === "link"
                  ? "none"
                  : "auto",
            }}
            onClick={handleScrapUrl}
          >
            {isLoadingSavingMedia === "link"
              ? "Fetching..."
              : mediaList?.length > 0
              ? "Fetch More Link"
              : "Fetch Link"}
          </TertiaryButton>
        </div>
        {isLoadingSavingMedia === "link" && <UrlRowLoader />}

        <p className="text-[12px] text-[var(--secondary-text-color)] mt-2 px-0.5">
          This will crawl all the links starting with the URL (not including
          files on the website).
        </p>
      </div>
      <Stack direction="column">
        {mediaList?.length > 0 &&
          mediaList?.map((media, index) => (
            <AgentUploadUrlRow
              from={from}
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
              id={id}
              key={String(media?._id || index)}
            />
          ))}
      </Stack>
    </Stack>
  );
};
