import { create } from "zustand";
import { persist } from "zustand/middleware";
import { integrationNameToSlug } from "@/constants/knowledge";

export interface ConnectedIntegration {
  account_id: string;
  name: string; // This will store the slug
}

interface IntegrationStoreState {
  connectedIntegrations: ConnectedIntegration[];
  connectedAccountIds: string[];
  isEnabled: boolean;
  setConnectedIntegrations: (
    integrations: Array<{ account_id: string; name: string }>
  ) => void;
  setIsEnabled: (enabled: boolean) => void;
}

// Utility function to convert integration name to slug
const convertNameToSlug = (name: string): string => {
  // First try to get the exact match from the mapping
  if (name in integrationNameToSlug) {
    return integrationNameToSlug[name as keyof typeof integrationNameToSlug];
  }

  // Fallback: convert to lowercase and replace spaces with underscores
  return name.toLowerCase().replace(/\s+/g, "_");
};

export const useIntegrationStore = create<IntegrationStoreState>()(
  persist(
    (set) => ({
      connectedIntegrations: [],
      connectedAccountIds: [],
      isEnabled: false, // Default to true
      setConnectedIntegrations: (integrations) => {
        // Convert names to slugs and store them
        const integrationsWithSlugs = integrations.map((integration) => ({
          account_id: integration.account_id,
          name: convertNameToSlug(integration.name), // Convert name to slug
        }));
        set({
          connectedIntegrations: integrationsWithSlugs,
          connectedAccountIds: integrationsWithSlugs.map((i) => i.account_id),
        });
      },
      setIsEnabled: (enabled) => {
        set({ isEnabled: enabled });
      },
    }),
    {
      name: "integration-store", // name of item in storage
    }
  )
);
