import type { AssistantClient } from "../AssistantClient";
import type { PreprocessingProcessor } from "../Preprocessing";
import promptBreakIntoParts from './prompts/breakIntoParts.md?raw';

export const preprocessors: PreprocessingProcessor[] = [
  /**
   * This first preprocessor breaks up the prompt into sub-steps.
   */
  {
    name: 'Breakdown Prompt',
    color: { text: 'text-amber-400', background: 'bg-amber-400' },
    instructions: promptBreakIntoParts,
    process: async function (client: AssistantClient, promptResult: string | undefined, originalPrompt: string) {
      const prompt = [
        'Break down this prompt into sub-steps:',
        `Input: """${promptResult ?? originalPrompt}"""`,
      ].join('\n');

      const result = await client.messageTransientAssistant(
        {
          name: this.name,
          instructions: this.instructions,
        },
        {
          content: prompt,
          role: 'user',
        }
      )

      return result;
    },
  },
];
