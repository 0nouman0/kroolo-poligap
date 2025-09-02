import { FileText, Link } from "lucide-react";
import { IoLogoYoutube } from "react-icons/io5";
import dayjs from "dayjs";
import useAiAgentsStore from "@/stores/ai-agents-store";
import { useAgentRevampStore } from "@/stores/agent-revamp-store";
import LoadingSpinner from "./knowledge-loader/LoadingSpinner";
import TertiaryButton from "./kb-components/TertiaryButton";
import useGetMediaInfo, { MediaItem } from "./hooks/useGetMediaInfo";
import type { IMedia } from "@/models/media.model";
import { useCompanyStore } from "@/stores/company-store";

const AgentTrainCard = () => {
  const { createdAgentDetailData } = useAiAgentsStore();
  const { traineAgentKnowledge, isTrainingAgent } = useAgentRevampStore();
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const companyId = selectedCompany?.companyId;

  // Explicitly type media as IMedia[]
  const media = (createdAgentDetailData?.media ?? []) as IMedia[];
  const data = useGetMediaInfo(media as unknown as MediaItem[]);

  const handleTraineKnowledge = () => {
    const requestData = {
      user_id: localStorage.getItem("user_id"),
      organization_id: companyId,
      allowed_files:
        media.length > 0
          ? media
              .filter(
                (file: IMedia) =>
                  file?.fileType !== "Project" && file?.fileType !== "Doc"
              )
              .map((file: IMedia) => file?._id)
          : [],
      agent_id:
        createdAgentDetailData?.trained &&
        !createdAgentDetailData?.preCreated &&
        !createdAgentDetailData?.preDefault
          ? createdAgentDetailData?.agnoId
          : createdAgentDetailData?.agentName,
    };
    traineAgentKnowledge(requestData, createdAgentDetailData?._id, true);
  };

  return (
    <div className="w-80 h-min bg-transparent border border-[var(--card-border)] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[var(--secondary-text-color)] text-[13px] font-semibold ">
          SOURCES
        </p>
        <span className="text-xs text-[var(--text-color)]">
          {data?.total_count}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--secondary-text-color)]" />
            <span className="text-xs text-[var(--text-color)]">
              {" "}
              {data?.files.count} {data?.files.count > 1 ? " Files" : " File"}{" "}
            </span>
          </div>
          <span className="text-xs font-semibold text-[var(--text-color)]">
            {" "}
            {data?.total_size_formatted}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-[var(--secondary-text-color)]" />
            <span className="text-xs text-[var(--text-color)]">
              {data?.link.count} {data?.link.count > 1 ? " Links" : " Link"}{" "}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoLogoYoutube className="w-4 h-4 text-[var(--secondary-text-color)]" />
            <span className="text-xs text-[var(--text-color)]">
              {" "}
              {data?.youtube.count}{" "}
              {data?.youtube.count > 1 ? " Youtube links" : " Youtube link"}{" "}
            </span>
          </div>
        </div>

        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[var(--secondary-text-color)]" />
            <span className="text-xs text-[var(--text-color)]">
              {data?.sources.count}{" "}
              {data?.sources.count > 1
                ? " Internal Sources"
                : " Internal Source"}{" "}
            </span>
          </div>
        </div> */}
      </div>
      <div className="border-t border-dashed border-[var(--secondary-text-color)] my-4"></div>
      <div className="flex items-center justify-between ">
        <span className="text-[13px] font-medium text-[var(--text-color)]">
          Total size:
        </span>
        <span className="text-sm  font-semibold text-[var(--text-color)]">
          {data?.total_size_formatted}
        </span>
      </div>
      <div className="flex flex-col w-full mt-2 gap-3">
        <TertiaryButton
          disabled={
            isTrainingAgent || createdAgentDetailData?.media?.length === 0
          }
          startIcon={isTrainingAgent ? <LoadingSpinner size={18} /> : null}
          sx={{
            padding: "0px 8px",
            width: "100%",
            pointerEvents: isTrainingAgent ? "none" : "auto",
          }}
          onClick={handleTraineKnowledge}
        >
          {isTrainingAgent
            ? "Training"
            : createdAgentDetailData.isKnowledgeTrained
            ? "Retrain agent"
            : "Train agent"}
        </TertiaryButton>
        <p className="text-[13px] font-medium text-[var(--secondary-text-color)]">
          Last trained on{" "}
          {dayjs(createdAgentDetailData?.lastTrained).format(
            "h:mm A MMM D, YYYY"
          )}
        </p>
      </div>
    </div>
  );
};

export default AgentTrainCard;
