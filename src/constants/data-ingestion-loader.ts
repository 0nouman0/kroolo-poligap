import { Step } from "@/components/data-ingestion-loader";

// Example steps for a multi-step process
export const exampleSteps: Step[] = [
  {
    id: "extract",
    title: "Extracting Data",
    description: "Reading from source database",
  },
  {
    id: "transform",
    title: "Transforming Data",
    description: "Applying business rules and formatting",
  },
  {
    id: "validate",
    title: "Validating Data",
    description: "Checking for errors and inconsistencies",
  },
  {
    id: "load",
    title: "Loading Data",
    description: "Writing to destination database",
  },
  {
    id: "verify",
    title: "Verifying Results",
    description: "Ensuring data integrity",
  },
];

// Engaging messages that rotate during processing
export const engagingMessages = [
  "Connecting the dots — syncing Google Drive to your enterprise brain.",
  "Ingesting intelligence... your data's taking a deep dive.",
  "Lifting your files from Drive to warp-speed searchability.",
  "One moment while we train your search to think smarter.",
  "Packing knowledge into your custom-built command center.",
  "Elevating documents to a higher plane of discovery.",
  "Indexing like a machine. Because it is one.",
  "Organizing chaos into context. Sit tight.",
  "Mapping your files to fast, fluid, future-ready search.",
  "Data's on the move. Insight's on the way.",
];
