// 1. Centralized Integration Names
export const INTEGRATIONS = {
  GOOGLE_DRIVE: "Google Drive",
  SHAREPOINT: "Microsoft SharePoint",
  CONFLUENCE: "Confluence",
  DROPBOX: "Dropbox",
  SLACK: "Slack",
  TEAMS: "Microsoft Teams",
  JIRA: "Jira",
  DOCUMENT_360: "Document 360",
  ZENDESK: "Zendesk",
  SITEMAP: "sitemap",
  BITBUCKET: "Bitbucket",
  GITHUB: "GitHub",
  GOOGLE_CALENDAR: "Google Calendar",
  OUTLOOK: "Outlook",
} as const;

// Type based on INTEGRATIONS
export type IntegrationName = (typeof INTEGRATIONS)[keyof typeof INTEGRATIONS];

export interface FilterCategory {
  id: string;
  label: string;
  integrations: IntegrationName[];
}

// Filter categories configuration
export const filterCategories: FilterCategory[] = [
  { id: "all", label: "All", integrations: [] },
  {
    id: "docs",
    label: "Docs & Files",
    integrations: [
      INTEGRATIONS.GOOGLE_DRIVE,
      INTEGRATIONS.SHAREPOINT,
      INTEGRATIONS.CONFLUENCE,
      INTEGRATIONS.DROPBOX,
      INTEGRATIONS.DOCUMENT_360,
    ],
  },
  {
    id: "collaboration",
    label: "Collaboration",
    integrations: [INTEGRATIONS.SLACK, INTEGRATIONS.TEAMS],
  },
  {
    id: "engineering",
    label: "Engineering",
    integrations: [INTEGRATIONS.JIRA],
  },
  {
    id: "servicesops",
    label: "ServicesOps",
    integrations: [INTEGRATIONS.ZENDESK],
  },
  {
    id: "devtools",
    label: "Developer Tools",
    integrations: [INTEGRATIONS.BITBUCKET, INTEGRATIONS.GITHUB],
  },
  {
    id: "calendar",
    label: "Calendar & Scheduling",
    integrations: [INTEGRATIONS.GOOGLE_CALENDAR, INTEGRATIONS.OUTLOOK],
  },
];

// Add a name-to-slug mapping for integrations to connect to pipedream
export const integrationNameToSlug: Record<IntegrationName, string> = {
  [INTEGRATIONS.JIRA]: "jira",
  [INTEGRATIONS.SLACK]: "slack",
  [INTEGRATIONS.GOOGLE_DRIVE]: "google_drive",
  [INTEGRATIONS.DROPBOX]: "dropbox",
  [INTEGRATIONS.CONFLUENCE]: "confluence",
  [INTEGRATIONS.SHAREPOINT]: "sharepoint",
  [INTEGRATIONS.TEAMS]: "microsoft_teams",
  [INTEGRATIONS.DOCUMENT_360]: "document360",
  [INTEGRATIONS.ZENDESK]: "zendesk",
  [INTEGRATIONS.SITEMAP]: "sitemap",
  [INTEGRATIONS.BITBUCKET]: "bitbucket",
  [INTEGRATIONS.GITHUB]: "github",
  [INTEGRATIONS.GOOGLE_CALENDAR]: "google_calendar",
  [INTEGRATIONS.OUTLOOK]: "outlook",
};
