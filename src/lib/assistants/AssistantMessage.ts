import type { Member } from "$lib/Member";

export interface AssistantMessage {
  content: string;
  timestamp: Date;
  sender: Member;
}