import type { Member } from "$lib/Member";

export type AssistantConfig = Member & {
  model?: string;
  description?: string;
  instructions?: string;
};
