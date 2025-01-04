import type { AssistantConfig } from "./AssistantConfig";
import { apiLimit, apiLimitCount, incrementApiLimitCount } from "./ApiLimitStore";
import { get } from "svelte/store";

export type StreamCallbacks = {
  onProgressText?: (progressText: string) => void;
  onMessageCreated?: (assistantId: string, messageId: string) => void;
  onMessageDelta?: (messageId: string, delta: string) => void;
  onToolCallCreated?: (toolCall: { type: string }) => void;
  onToolCallDelta?: (delta: any, snapshot: any) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
};

export class RateLimitError extends Error {
  constructor(message: string = 'API call limit reached') {
    super(message);
    this.name = 'RateLimitError';
  }
}

const EVENT_PREFIX = 'event: ';
const DATA_PREFIX = 'data: ';

export class AssistantClient {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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
  async addUserMessage(threadId: string, content: string) {
    await this.checkLimit();

    const data = {
      role: 'user',
      content
    };

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
  async streamRun(threadId: string, assistantId: string, callbacks: StreamCallbacks) {
    await this.checkLimit();

    const data = {
      assistant_id: assistantId,
      stream: true,
    };

    const response = await this.fetch(`/threads/${threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Failed to get reader from response');
    }

    // Create a new TextDecoder to handle the stream
    let runId: string | undefined = undefined;
    const decoder = new TextDecoder();
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
              this.handleEvent(runId, event, data, callbacks);
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
  }

  private async handleEvent(runId: string | undefined, eventType: string, data: any, callbacks: StreamCallbacks) {
    switch (eventType) {
      case 'thread.run.requires_action':
        callbacks.onToolCallCreated?.(data.required_action.submit_tool_outputs.tool_calls[0]);
        break;
      case 'thread.run.created':
        callbacks.onProgressText?.('Run created...');
        break;
      case 'thread.run.queued':
        callbacks.onProgressText?.('Run queued...');
        break;
      case 'thread.run.in_progress':
        callbacks.onProgressText?.('Run in progress...');
        break;
      case 'thread.run.step.created':
        callbacks.onProgressText?.('Step created...');
        break;
      case 'thread.run.step.in_progress':
        callbacks.onProgressText?.('Step in progress...');
        break;
      case 'thread.run.step.delta':
        callbacks.onProgressText?.('Step delta...');
        break;
      case 'thread.message.created':
        callbacks.onMessageCreated?.(data.assistant_id, data.id);
        break;
      case 'thread.message.in_progress':
        callbacks.onProgressText?.('Typing...');
        break;
      case 'thread.message.delta':
        callbacks.onProgressText?.('Typing...');

        if (data.delta.content.length != 1)
          console.warn('Unexpected content length (expecting 1):', data.delta.content.length, data);
        else if (data.delta.content[0].type != 'text')
            console.warn('Unexpected content type (expecting text):', data.delta.content[0].type, data);
        else
          callbacks.onMessageDelta?.(data.id, data.delta.content[0].text.value);

        break;
      case 'thread.message.completed':
      case 'thread.run.step.completed':
        callbacks.onProgressText?.('');
        break;
      case 'thread.run.completed':
        callbacks.onProgressText?.('');
        callbacks.onComplete?.();
        break;
      default:
        console.log('Unhandled event', eventType);
    }
  }
}