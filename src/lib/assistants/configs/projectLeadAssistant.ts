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
              description: 'The ID of the persona to track them, their expertise is contained in this ID.',
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
              description: 'Clear instructions for the persona to follow with their expertise.',
            },
            relevantNewData: {
              type: 'string',
              description: 'All data this persona needs to know to complete their task, like data from previous personas.',
            }
          },
          required: ['personaId', 'name', 'emoji', 'expertise', 'instructions', 'relevantNewData'],
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
            relevantNewData: {
              type: 'string',
              description: 'All data this persona needs to know to complete their task, like data from previous personas.',
            }
          },
          required: ['personaId', 'instructions', 'relevantNewData'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  ],
};
