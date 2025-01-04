import type { Member } from "$lib/Member";

export interface AssistantMessage {
  content: string;
  timestamp: string;
  sender?: Member; // If not specified, then the primary assistant in the thread is the sender
}