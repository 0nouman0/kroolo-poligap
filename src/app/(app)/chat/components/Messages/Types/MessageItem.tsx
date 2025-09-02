import { memo, useState } from "react";

import type { MessageProps, TabData, TabType } from "./../../../types/agent";
import AgentThinkingLoader from "../Chat-Components/AgentThinkingLoader";
import { ActionTab } from "./../../../components/actions/ActionTab";
import { useAgentStore } from "./../../../store/agent-store";
import Icon from "./../../../ui/icon";
import MarkdownRenderer from "./../../../ui/typography/MarkdownRenderer";
import Audios from "./../Multimedia/Audios";
import Images from "./../Multimedia/Images";
import Videos from "./../Multimedia/Videos";
import ReferenceCards from "./ReferenceCards";
import ToolCalls from "./ToolCards";

const AgentMessage = ({
  message,
  exportReactComponentAsPDF,
  handleCreateProject,
  handleCreateDoc,
}: MessageProps) => {
  const { streamingErrorMessage, isStreaming } = useAgentStore();
  const [activeTab, setActiveTab] = useState<TabType>("content");

  const tabs: TabData[] = [{ id: "content", label: "Kroolo", icon: "kroolo" }];

  if (
    message.extra_data?.references &&
    message.extra_data.references.length > 0
  ) {
    const totalReferences = message.extra_data.references.reduce(
      (acc, ref) => acc + ref.references.length,
      0
    );
    tabs.push({
      id: "references",
      label: "Sources",
      icon: "references",
      count: totalReferences,
    });
  }

  if (message.images && message.images.length > 0) {
    tabs.push({
      id: "images",
      label: "Images",
      icon: "image",
      count: message.images.length,
    });
  }

  if (message.videos && message.videos.length > 0) {
    tabs.push({
      id: "videos",
      label: "Videos",
      icon: "video",
      count: message.videos.length,
    });
  }
  if (message.tool_calls && message.tool_calls.length > 0) {
    tabs.push({
      id: "tasks",
      label: "Tasks",
      icon: "tasks",
      count: message.tool_calls.length,
    });
  }

  if (message.audio && message.audio.length > 0) {
    tabs.push({
      id: "audio",
      label: "Audio",
      icon: "audio",
      count: message.audio.length,
    });
  }

  const renderTabContent = () => {
    if (message.streamingError) {
      return (
        <p className="text-[var(--error-red)]">
          Oops! Something went wrong while streaming.{" "}
          {streamingErrorMessage ? (
            <>{streamingErrorMessage}</>
          ) : (
            "Please try refreshing the page or try again later."
          )}
        </p>
      );
    }

    switch (activeTab) {
      case "content":
        if (message.content) {
          return (
            <div className="flex w-full flex-col gap-2">
              {isStreaming === message.id && (
                <ToolCalls
                  message={message}
                  toolCalls={message.tool_calls ?? []}
                />
              )}
              <MarkdownRenderer>{message.content}</MarkdownRenderer>
              {isStreaming !== message.id && (
                <ActionTab
                  exportReactComponentAsPDF={exportReactComponentAsPDF}
                  handleCreateProject={handleCreateProject}
                  handleCreateDoc={handleCreateDoc}
                  message={message}
                />
              )}
            </div>
          );
        } else if (message.response_audio) {
          if (!message.response_audio.transcript) {
            return (
              <div className="mt-2 flex items-start">
                <AgentThinkingLoader />
              </div>
            );
          } else {
            return (
              <MarkdownRenderer>
                {message.response_audio.transcript}
              </MarkdownRenderer>
            );
          }
        } else {
          return (
            <div className="mt-2 flex">
              <AgentThinkingLoader />
            </div>
          );
        }

      case "references":
        return (
          <ReferenceCards references={message.extra_data?.references ?? []} />
        );
      case "tasks":
        return (
          <ToolCalls message={message} toolCalls={message.tool_calls ?? []} />
        );

      case "images":
        if (message.images && message.images.length > 0) {
          return <Images images={message.images} />;
        }
        return <p className="text-muted">No images available</p>;

      case "videos":
        if (message.videos && message.videos.length > 0) {
          return <Videos videos={message.videos} />;
        }
        return <p className="text-muted">No videos available</p>;

      case "audio":
        if (message.audio && message.audio.length > 0) {
          return <Audios audio={message.audio} />;
        } else if (message.response_audio?.content) {
          return <Audios audio={[message.response_audio]} />;
        }
        return <p className="text-muted">No audio available</p>;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row items-start gap-4">
      <div className="flex w-full flex-col">
        {tabs.length > 0 && (
          <div className="sticky top-[40px] z-10 mb-4 flex border-b border-[var(--card-border-color)] bg-[var(--modal-color)] bg-opacity-80 backdrop-blur-md px-3 pt-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-[var(--text-color)] text-[var(--text-color)]"
                    : "hover:[var(--text-color)] text-[var(--secondary-text-color)]"
                }`}
              >
                <Icon
                  type={
                    tab.label === "Kroolo" && isStreaming === message.id
                      ? "loading-icon"
                      : tab.icon
                  }
                  size="xs"
                  className="text-inherit"
                />

                <p className="text-[13px] text-inherit">{tab.label}</p>
                {tab.count && (
                  <span className="text-[13px] text-inherit">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        )}
        <div className="w-full px-3 py-2">{renderTabContent()}</div>
      </div>
    </div>
  );
};
AgentMessage.displayName = "AgentMessage";

const UserMessage = memo(({ message }: MessageProps) => {
  return (
    <div className="flex items-start text-start max-md:break-words">
      <div className="line-clamp-1 flex flex-row">
        <div className="text-md line-clamp-1 py-1 text-[var(--text-color)]">
          {message.user_query}
        </div>
      </div>
    </div>
  );
});
UserMessage.displayName = "UserMessage";

export { AgentMessage, UserMessage };
