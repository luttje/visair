import type { Member } from "$lib/Member";
import type { ToolsConfig } from "./Tools";

export type AssistantConfig = Member & {
  model?: string;
  description?: string;
  instructions: string;
  tools?: ToolsConfig[];
  personaId?: string;
};
