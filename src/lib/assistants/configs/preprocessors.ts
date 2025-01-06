import type { AssistantClient } from "../AssistantClient";
import type { PreprocessingProcessor } from "../Preprocessing";
import promptBreakIntoParts from './prompts/breakIntoParts.md?raw';
import promptOrganizeForExperts from './prompts/organizeForExperts.md?raw';

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
        `Input: """${promptResult ?? originalPrompt}"""\n`,
      ].join('\n');

      console.log('Prompt:', prompt, this.instructions);

      const result = await client.messageTransientAssistant(
        {
          name: this.name,
          instructions: this.instructions,
        },
        {
          content: prompt,
          role: 'user',
        }
      );

      // Return the original prompt so it stays un-mangled by the preprocessor.
      return `Input Task: ${originalPrompt}\n\n${result}`;
    },
  },

  /**
   * This second preprocessor organizes the sub-steps of th previous preprocessor into expert groups.
   */
  {
    name: 'Organize for Experts',
    color: { text: 'text-blue-400', background: 'bg-blue-400' },
    instructions: promptOrganizeForExperts,
    process: async function (client: AssistantClient, promptResult: string | undefined, originalPrompt: string) {
      const prompt = [
        '<input>',
        promptResult ?? originalPrompt,
        '</input>\n',
      ].join('\n');

      console.log('Prompt:', prompt, this.instructions);

      const result = await client.messageTransientAssistant(
        {
          name: this.name,
          instructions: this.instructions,
        },
        {
          content: prompt,
          role: 'user',
        }
      );

      return [
        // Return the original prompt so it stays un-mangled by the preprocessor.
        `Input Task: ${originalPrompt}\n`,
        result, // Will contain the expertise grouped output, starting with: `GROUPS:` ...
      ].join('\n');;
    },
  },
];
