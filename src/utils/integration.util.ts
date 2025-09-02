import { INTEGRATIONS } from "@/constants/knowledge";

export function getIntegrationDisplayName(type: string): string {
  return (INTEGRATIONS as Record<string, string>)[type?.toUpperCase()] || type;
}
