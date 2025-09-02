"use client";
import { useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import useAiAgentsStore from "../../stores/ai-agents-store";
import { FileUploadSection } from "./knowledge-types/FileUploadSection";
import { ScrapURLSection } from "./knowledge-types/ScrapURLSection";
import { UploadYoutubeSection } from "./knowledge-types/UploadYoutubeSection";
// import { UploadFromKrooloSection } from "./knowledge-types/UploadFromKrooloSection";
import AgentTrainCard from "./AgentTrainCard";
import { Switch } from "../ui/switch";
// Minimal WarningStrip stub (replace with real one later)
const WarningStrip = ({ message }: { message: string }) => (
  <div
    style={{
      background: "#ffeeba",
      padding: "8px",
      borderRadius: "4px",
      color: "#856404",
      margin: "8px 0",
    }}
  >
    {message}
  </div>
);

const AgentKnowledgeHeader = () => {
  return (
    <Stack direction="column">
      <p
        // fontWeight={500}
        // fontSize="16px"
        // lineHeight="24px"
        // color="var(--text-color)"
        className="text-md"
      >
        Knowledge
      </p>
      <p
        // fontWeight={500}
        // fontSize="12px"
        // lineHeight="16px"
        // color="var(--action-icon-color)"
        className="text-xs"
      >
        Enhance agent’s knowledge by adding files, media, links, videos, project
        references, for better results.
      </p>
    </Stack>
  );
};

const AgentKnowledgeSwitch = ({
  enabledKnowledge,
  setEnabledKnowledge,
  isUpdating,
}: {
  enabledKnowledge: boolean;
  setEnabledKnowledge: (checked: boolean) => void;
  isUpdating: boolean;
}) => {
  return (
    <Stack direction="column" width="100%" gap={1}>
      <Stack
        sx={{
          border: "1px solid var(--card-border)",
          background: "transparent",
          borderRadius: "8px",
          padding: "4px 8px",
          cursor: "pointer",
          "&:hover": {
            background: "var(--agent-background-color)",
          },
        }}
        gap={1}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography
          fontWeight={600}
          fontSize="13px"
          lineHeight="20px"
          className="themed-text-color"
        >
          Enable Knowledge
        </Typography>
        <Stack
          sx={{
            justifyContent: "center",
            alignItems: "center",
            height: "32px !important",
          }}
        >
          <Switch
            checked={enabledKnowledge}
            onCheckedChange={setEnabledKnowledge}
            disabled={isUpdating}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export interface AgentKnowledgeTabProps {
  from: string;
  id: string;
  enabledKnowledge: boolean;
  setEnabledKnowledge: (checked: boolean) => void;
  // TODO: Add documentList if needed in the future
}

export const AgentKnowledgeTab = ({
  from,
  id,
  enabledKnowledge,
  setEnabledKnowledge,
}: AgentKnowledgeTabProps) => {
  const { showWarning, isUpdatingKnowledge } = useAiAgentsStore();

  useEffect(() => {
    if (showWarning) {
      setTimeout(() => {
        useAiAgentsStore.setState({ showWarning: false });
      }, 3000);
    }
  }, [showWarning]);

  return (
    <Stack
      direction="column"
      p={from === "chat-with-agent" ? 1.5 : 0}
      pt={1}
      pb={from === "chat-with-agent" ? 3 : 1}
      gap={2}
    >
      <AgentKnowledgeHeader />
      <Stack direction="row" gap={1.5}>
        <Stack
          direction="column"
          gap={1.5}
          justifyContent="space-between"
          width={from === "chat-with-agent" ? "calc(100% - 320px)" : "100%"}
        >
          <AgentKnowledgeSwitch
            enabledKnowledge={enabledKnowledge}
            setEnabledKnowledge={setEnabledKnowledge}
            isUpdating={isUpdatingKnowledge}
          />
          <FileUploadSection
            from={from}
            id={id}
            enabledKnowledge={enabledKnowledge}
          />
          <ScrapURLSection
            from={from}
            id={id}
            enabledKnowledge={enabledKnowledge}
          />
          <UploadYoutubeSection
            from={from}
            id={id}
            enabledKnowledge={enabledKnowledge}
          />
          {showWarning && (
            <WarningStrip message={"You can only add one " + showWarning} />
          )}
          {/* <UploadFromKrooloSection
            from={from}
            id={id}
            enabledKnowledge={enabledKnowledge}
          /> */}
        </Stack>
        {from === "chat-with-agent" && <AgentTrainCard />}
      </Stack>
    </Stack>
  );
};
