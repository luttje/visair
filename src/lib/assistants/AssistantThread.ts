import type { AssistantConfig } from "./AssistantConfig";
import type { AssistantMessage } from "./AssistantMessage";

export interface AssistantThread {
  id: string;
  assistantId: string;
  config: AssistantConfig;
  messages: AssistantMessage[];
  progressText?: string;
}

/**
 * Creates a hash for a thread to detect changes.
 */
export function createThreadHash(thread: AssistantThread) {
  // Note that message content can change, so we will hash the length of the last message
  let lastMessageLength = 0;

  if (thread.messages.length > 0) {
    const lastMessage = thread.messages[thread.messages.length - 1];
    lastMessageLength = lastMessage.content.length
  }

  return `${thread.id}:${thread.assistantId}:${thread.progressText}:${thread.messages.length}:${lastMessageLength}`;
}
