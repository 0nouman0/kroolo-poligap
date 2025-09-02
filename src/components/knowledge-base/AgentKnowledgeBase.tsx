"use client";
import useAiAgentsStore from "@/stores/ai-agents-store";
import React, { useEffect } from "react";
import { AgentKnowledgeTab } from "./AgentKnowledgeTab";

// Get companyId and userId from their respective stores
import { useCompanyStore } from "@/stores/company-store";

const AgentKnowledgeBase = () => {
  const {
    createdAgentDetailData,
    updateEnabledKnowledge,
    fetchEnabledKnowledge,
  } = useAiAgentsStore();
  const companyId = useCompanyStore(
    (state) => state.selectedCompany?.companyId
  );

  // Fetch enabledKnowledge status when component mounts
  useEffect(() => {
    if (companyId) {
      fetchEnabledKnowledge();
    }
  }, [companyId, fetchEnabledKnowledge]);

  // Handler to update enabledKnowledge in the store
  const handleSetEnabledKnowledge = async (checked: boolean) => {
    console.log("Switch toggled:", checked);
    await updateEnabledKnowledge(checked);
  };

  return (
    <AgentKnowledgeTab
      from="chat-with-agent"
      id={companyId!}
      enabledKnowledge={createdAgentDetailData?.enabledKnowledge ?? false}
      setEnabledKnowledge={handleSetEnabledKnowledge}
    />
  );
};

export default AgentKnowledgeBase;
