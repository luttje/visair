import type { AssistantConfig } from "./AssistantConfig";
import { apiLimit, apiLimitCount, incrementApiLimitCount } from "./ApiLimitStore";
import { get } from "svelte/store";
import type { ToolResult } from "./Tools";

export type StreamCallbacks = {
  onProgressText?: (threadId: string, progressText: string) => void;
  onHandleToolCall?: (threadId: string, name: string, parameters: any) => Promise<string | undefined>;
  onMessageCreated?: (threadId: string, assistantId: string, messageId: string) => void;
  onMessageDelta?: (threadId: string, messageId: string, delta: string) => void;
  onError?: (threadId: string, error: Error) => void;
  onComplete?: (threadId: string) => void;
};

export class RateLimitError extends Error {
  constructor(message: string = 'API call limit reached') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export type MessageRequest = {
  role: 'user' | 'assistant',
  content: string
};

const EVENT_PREFIX = 'event: ';
const DATA_PREFIX = 'data: ';

export class AssistantClient {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  private callbacks: StreamCallbacks = {};

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public setCallbacks(callbacks: StreamCallbacks) {
    this.callbacks = callbacks;
  }

  private async checkLimit() {
    incrementApiLimitCount();

    if (get(apiLimitCount) >= get(apiLimit)) {
      throw new RateLimitError();
    }
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Create a new assistant, returning the ID
   */
  async createAssistant(config: Omit<AssistantConfig, 'id'>) {
    await this.checkLimit();

    const data = {
      name: config.name,
      instructions: config.instructions,
      model: config.model || 'gpt-4o-mini',
      tools: config.tools,
    };

    const response = await this.fetch('/assistants', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const result = await response.json();

    return result.id as string;
  }

  /**
   * Delete an assistant
   */
  async deleteAssistant(assistantId: string) {
    await this.checkLimit();

    const response = await this.fetch(`/assistants/${assistantId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete assistantId: ${response.statusText}`);
    }
  }

  /**
   * Create a new thread, returning the ID
   */
  async createThread() {
    await this.checkLimit();

    const response = await this.fetch('/threads', {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Failed to create thread: ${response.statusText}`);
    }

    const threadData = await response.json();

    return threadData.id as string;
  }

  /**
   * Delete a thread
   */
  async deleteThread(threadId: string) {
    await this.checkLimit();

    const response = await this.fetch(`/threads/${threadId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete thread: ${response.statusText}`);
    }
  }

  /**
   * Add a message to a thread, returning the message ID
   */
  async addMessage(threadId: string, data: MessageRequest) {
    await this.checkLimit();

    const response = await this.fetch(`/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const result = await response.json();

    return result.id as string;
  }

  /**
   * Gets all messages in a thread
   */
  async getMessages(threadId: string) {
    // return await this.fetch(`/threads/${threadId}/messages`).then(res => res.json());
    const response = await this.fetch(`/threads/${threadId}/messages`);

    const result = await response.json();

    console.log('getMessages response', result);

    return result;
  }

  /**
   * Streams a run, calling the provided callbacks.
   * Be sure to have added messages to the thread before calling this.
   */
  async streamRun(threadId: string, assistantId: string) {
    await this.checkLimit();

    const data = {
      assistant_id: assistantId,
      stream: true,
    };

    const response = await this.fetch(`/threads/${threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    return await this.processStreamResponse(threadId, response);
  }

  async processStreamResponse(threadId: string, response: Response, runId?: string) {
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Failed to get reader from response');
    }

    // Create a new TextDecoder to handle the stream
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    let event: string | undefined = undefined;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.length === 0) {
            continue;
          }

          if (line.substring(0, EVENT_PREFIX.length) === EVENT_PREFIX) {
            event = line.substring(EVENT_PREFIX.length);

            if (event === 'done') {
              break;
            }
          } else if (line.substring(0, DATA_PREFIX.length) === DATA_PREFIX) {
            const dataString = line.substring(DATA_PREFIX.length);
            const data = JSON.parse(dataString);

            if (!runId && data.object === 'thread.run') {
              runId = data.id;
            }

            if (event) {
              if (!runId) {
                console.warn(`Ignoring Event. No runId yet for event: ${event}`);
              } else {
                const delta = await this.handleEvent(threadId, runId, event, data);

                if (typeof delta === 'string') {
                  fullText += delta;
                }
              }
              event = undefined;
            } else {
              throw new Error(`Data without event: ${line}`);
            }
          } else {
            throw new Error(`Invalid line: ${line}`);
          }
        }
      }
    }

    return fullText;
  }

  private async submitToolOutputs(runId: string, threadId: string, toolOutputs: ToolResult[]) {
    await this.checkLimit();

    const data = {
      tool_outputs: toolOutputs,
      stream: true,
    };

    const response = await this.fetch(`/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    return await this.processStreamResponse(threadId, response, runId);
  }

  private async handleEvent(threadId: string, runId: string, eventType: string, data: any) {
    switch (eventType) {
      case 'thread.run.requires_action':
        this.callbacks.onProgressText?.(threadId, 'Using tools...');

        console.log(data);

        if (!this.callbacks.onHandleToolCall) {
          console.error('No onHandleToolCall callback provided, but tool call required:', data);
          return;
        }

        const toolOutputs: ToolResult[] = await Promise.all(data.required_action.submit_tool_outputs.tool_calls.map(async (toolCall: any) => {
          if (toolCall.type !== 'function') {
            console.warn('Unexpected tool call type:', toolCall.type);
            return 'unknown';
          }

          const name = toolCall.function.name;
          const parameters = JSON.parse(toolCall.function.arguments);
          const result = await this.callbacks.onHandleToolCall!(threadId, name, parameters);

          if (result === undefined) {
            console.error('Unhandled tool call:', toolCall);
            throw new Error(`Unhandled tool call: ${name}`);
          }

          return {
            tool_call_id: toolCall.id,
            output: result,
          };
        }));

        this.callbacks.onProgressText?.(threadId, 'Submiting tool outputs...');

        const result = await this.submitToolOutputs(runId, threadId, toolOutputs);

        console.log('tool outputs submitted completely', result);

        break;
      case 'thread.run.created':
        this.callbacks.onProgressText?.(threadId, 'Run created...');
        break;
      case 'thread.run.queued':
        this.callbacks.onProgressText?.(threadId, 'Run queued...');
        break;
      case 'thread.run.in_progress':
        this.callbacks.onProgressText?.(threadId, 'Run in progress...');
        break;
      case 'thread.run.step.created':
        this.callbacks.onProgressText?.(threadId, 'Step created...');
        break;
      case 'thread.run.step.in_progress':
        this.callbacks.onProgressText?.(threadId, 'Step in progress...');
        break;
      case 'thread.run.step.delta':
        this.callbacks.onProgressText?.(threadId, 'Step delta...');
        break;
      case 'thread.message.created':
        this.callbacks.onMessageCreated?.(threadId, data.assistant_id, data.id);
        break;
      case 'thread.message.in_progress':
        this.callbacks.onProgressText?.(threadId, 'Typing...');
        break;
      case 'thread.message.delta':
        this.callbacks.onProgressText?.(threadId, 'Typing...');

        if (data.delta.content.length != 1)
          console.warn('Unexpected content length (expecting 1):', data.delta.content.length, data);
        else if (data.delta.content[0].type != 'text')
          console.warn('Unexpected content type (expecting text):', data.delta.content[0].type, data);
        else {
          const delta = data.delta.content[0].text.value;
          this.callbacks.onMessageDelta?.(threadId, data.id, delta);

          return delta as string;
        }

        break;
      case 'thread.message.completed':
      case 'thread.run.step.completed':
        this.callbacks.onProgressText?.(threadId, '');
        break;
      case 'thread.run.completed':
        this.callbacks.onProgressText?.(threadId, '');
        this.callbacks.onComplete?.(threadId);
        break;
      default:
        console.log('Unhandled event', eventType);
    }
  }

  /**
   * Creates a transient assistant and thread, runs with a stream,
   * and then deletes the assistant and thread.
   */
  async messageTransientAssistant(config: Omit<AssistantConfig, 'id'>, message: MessageRequest) {
    const assistantId = await this.createAssistant(config);
    const threadId = await this.createThread();

    try {
      await this.addMessage(threadId, message);
      return await this.streamRun(threadId, assistantId);
    } finally {
      await this.deleteAssistant(assistantId);
      await this.deleteThread(threadId);
    }
  }
}