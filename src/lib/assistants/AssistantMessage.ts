import type { Member } from "$lib/Member";

export interface AssistantMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | string; // User or the assistant id
}