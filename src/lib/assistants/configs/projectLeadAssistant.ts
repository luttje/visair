import type { AssistantConfig } from "../AssistantConfig";
import promptProjectLead from './prompts/projectLead.md?raw';

export const createPersonaFunctionName = 'createPersona';
export const sendInstructionsFunctionName = 'sendInstructions';

export const projectLeadAssistant: Omit<AssistantConfig, 'id'> = {
  name: 'Project Lead AI',
  description: 'Helps you by assembling a team and working on a project together.',
  avatar: '🤓',
  instructions: promptProjectLead
    .replaceAll('FUNC_CREATE_PERSONA', createPersonaFunctionName)
    .replaceAll('FUNC_SEND_INSTRUCTIONS', sendInstructionsFunctionName),
  tools: [
    {
      type: 'function',
      function: {
        name: createPersonaFunctionName,
        description: 'Generates a persona with the given name and expertise.',
        parameters: {
          type: 'object',
          properties: {
            personaId: {
              type: 'string',
              description: 'The ID of the persona so you can keep track of them.',
            },
            name: {
              type: 'string',
              description: 'A fun and memorable name for the persona.',
            },
            emoji: {
              type: 'string',
              description: 'An fun and fitting emoji to represent the persona.',
            },
            expertise: {
              type: 'string',
              description: 'The area of expertise of the persona. Instructions should be tailored to this expertise.',
            },
            instructions: {
              type: 'string',
              description: 'Clear, step-by-step instructions for the persona to follow with their expertise.',
            },
          },
          required: ['personaId', 'name', 'emoji', 'expertise', 'instructions'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: 'function',
      function: {
        name: sendInstructionsFunctionName,
        description: 'Sends instructions to a persona.',
        parameters: {
          type: 'object',
          properties: {
            personaId: {
              type: 'string',
              description: 'The ID of the persona to send instructions to.',
            },
            instructions: {
              type: 'string',
              description: 'Follow-up instructions for the persona to improve their work.',
            },
          },
          required: ['personaId', 'instructions'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  ],
};
