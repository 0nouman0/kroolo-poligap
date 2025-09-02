// Gmail Notification Integration Constants
export const GMAIL_INTEGRATION = {
  NAME: "Gmail Notification",
  SLUG: "gmail_notification",
  DISPLAY_NAME: "Gmail Notifications",
  DESCRIPTION: "Receive notifications and sync data from Gmail",
  ICON: "/gmail-icon.svg"
} as const;

// Gmail specific configuration
export const GMAIL_CONFIG = {
  SCOPES: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify"
  ],
  WEBHOOK_EVENTS: [
    "message_received",
    "message_sent",
    "message_labeled"
  ]
};
