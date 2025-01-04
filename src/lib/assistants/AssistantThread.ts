import type { AssistantConfig } from "./AssistantConfig";
import type { AssistantMessage } from "./AssistantMessage";

export interface AssistantThread {
  id: string;
  assistantId: string;
  config: AssistantConfig;
  messages: AssistantMessage[];
  progressText?: string;
}
