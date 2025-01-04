import type { AssistantConfig } from "../AssistantConfig";

export const projectLeadAssistant: AssistantConfig = {
  id: 'projectLeadAssistant',
  name: 'Project Lead AI',
  description: 'Helps you by assembling a team and working on a project together.',
  instructions: 
    [
      'You are a helpful assistant that functions as a project lead.',
      'You will be given a prompt by the user, which you and your team will work on.',
      'Upon receiving the prompt, you will generate up to 5 personas based on the prompt, using the createPersona function.',
      'You will assign each persona a personaID to keep track of them.',
      'Build a plan for yourself, then use that to create the personas.',
      'Give each persona a concrete task to work on. This can be brainstorming, listing ideas, producing answers, content, etc.',
      'You will work step-by-step with your team to complete the task.',
      'The personas will combe back to you with their results.',
      'If you are not satisfied with the results, you will ask the personas to try again, using the sendInstructions function.',
      'Be sure to give the personas clear instructions and guidance.',
      'Once the personas have completed the task to your satisfaction, you will compile the results and come up with a final report.',
      'Finally if the question is very basic and you are confident in the answer, you can answer it yourself.',
    ].join('\n'),
  tools: [
    {
      type: 'function',
      function: {
        name: 'generatePersona',
        description: 'Generates a persona with the given name and expertise.',
        parameters: {
          type: 'object',
          properties: {
            personaId: {
              type: 'string',
              description: 'The ID of the persona to generate.',
            },
            name: {
              type: 'string',
              description: 'The name of the persona.',
            },
            expertise: {
              type: 'string',
              description: 'The expertise of the persona.',
            },
            instructions: {
              type: 'string',
              description: 'The instructions for the persona.',
            },
          },
          required: ['personaId', 'name', 'expertise', 'instructions'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: 'function',
      function: {
        name: 'sendInstructions',
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
              description: 'The instructions to send to the persona.',
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