import type { AssistantConfig } from "./AssistantConfig";
import { apiLimit, apiLimitCount, incrementApiLimitCount } from "./ApiLimitStore";
import { get } from "svelte/store";

export type StreamCallbacks = {
  onTextCreated?: () => void;
  onTextDelta?: (delta: string, fullText: string) => void;
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
    await this.checkLimit();

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
  async createAssistant(config: AssistantConfig) {
    await this.checkLimit();

    const data = {
      name: config.name,
      instructions: config.instructions,
      model: config.model || 'gpt-4o-mini',
      tools: config.tools,
    };

    console.log('createAssistant', data);

    const response = await this.fetch('/assistants', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const result = await response.json();

    console.log('createAssistant response', result);

    return result.id;
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

    console.log('createThread response', threadData);

    return threadData.id;
  }

  /**
   * Add a message to a thread, returning the message ID
   */
  async addMessage(threadId: string, content: string) {
    await this.checkLimit();

    const data = {
      role: 'user',
      content
    };

    console.log('addMessage', data);

    const response = await this.fetch(`/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const result = await response.json();

    console.log('addMessage response', result);

    return result;
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

  /*docs:
  Step 2: Create a Thread and add Messages

Create a Thread when a user starts a conversation and add Messages to the Thread as the user asks questions.

const thread = await client.beta.threads.create();
const message = client.beta.threads.messages.create(thread.id, {
role: "user",
content: "What's the weather in San Francisco today and the likelihood it'll rain?",
});

Step 3: Initiate a Run

When you initiate a Run on a Thread containing a user Message that triggers one or more functions, the Run will enter a pending status. After it processes, the run will enter a requires_action state which you can verify by checking the Run’s status. This indicates that you need to run tools and submit their outputs to the Assistant to continue Run execution. In our case, we will see two tool_calls, which indicates that the user query resulted in parallel function calling.

Note that a runs expire ten minutes after creation. Be sure to submit your tool outputs before the 10 min mark.

You will see two tool_calls within required_action, which indicates the user query triggered parallel function calling.

{
"id": "run_qJL1kI9xxWlfE0z1yfL0fGg9",
...
"status": "requires_action",
"required_action": {
  "submit_tool_outputs": {
    "tool_calls": [
      {
        "id": "call_FthC9qRpsL5kBpwwyw6c7j4k",
        "function": {
          "arguments": "{"location": "San Francisco, CA"}",
          "name": "get_rain_probability"
        },
        "type": "function"
      },
      {
        "id": "call_RpEDoB8O0FTL9JoKTuCVFOyR",
        "function": {
          "arguments": "{"location": "San Francisco, CA", "unit": "Fahrenheit"}",
          "name": "get_current_temperature"
        },
        "type": "function"
      }
    ]
  },
  ...
  "type": "submit_tool_outputs"
}
}

Run object truncated here for readability

How you initiate a Run and submit tool_calls will differ depending on whether you are using streaming or not, although in both cases all tool_calls need to be submitted at the same time. You can then complete the Run by submitting the tool outputs from the functions you called. Pass each tool_call_id referenced in the required_action object to match outputs to each function call.

For the streaming case, we create an EventHandler class to handle events in the response stream and submit all tool outputs at once with the “submit tool outputs stream” helper in the Python and Node SDKs.

class EventHandler extends EventEmitter {
constructor(client) {
  super();
  this.client = client;
}

async onEvent(event) {
  try {
    console.log(event);
    // Retrieve events that are denoted with 'requires_action'
    // since these will have our tool_calls
    if (event.event === "thread.run.requires_action") {
      await this.handleRequiresAction(
        event.data,
        event.data.id,
        event.data.thread_id,
      );
    }
  } catch (error) {
    console.error("Error handling event:", error);
  }
}

async handleRequiresAction(data, runId, threadId) {
  try {
    const toolOutputs =
      data.required_action.submit_tool_outputs.tool_calls.map((toolCall) => {
        if (toolCall.function.name === "getCurrentTemperature") {
          return {
            tool_call_id: toolCall.id,
            output: "57",
          };
        } else if (toolCall.function.name === "getRainProbability") {
          return {
            tool_call_id: toolCall.id,
            output: "0.06",
          };
        }
      });
    // Submit all the tool outputs at the same time
    await this.submitToolOutputs(toolOutputs, runId, threadId);
  } catch (error) {
    console.error("Error processing required action:", error);
  }
}

async submitToolOutputs(toolOutputs, runId, threadId) {
  try {
    // Use the submitToolOutputsStream helper
    const stream = this.client.beta.threads.runs.submitToolOutputsStream(
      threadId,
      runId,
      { tool_outputs: toolOutputs },
    );
    for await (const event of stream) {
      this.emit("event", event);
    }
  } catch (error) {
    console.error("Error submitting tool outputs:", error);
  }
}
}

const eventHandler = new EventHandler(client);
eventHandler.on("event", eventHandler.onEvent.bind(eventHandler));

const stream = await client.beta.threads.runs.stream(
threadId,
{ assistant_id: assistantId },
eventHandler,
);

for await (const event of stream) {
eventHandler.emit("event", event);
}
*/
  /**
   * Streams a run, calling the provided callbacks.
   * Be sure to have added messages to the thread before calling this.
   */
  async streamRun(threadId: string, assistantId: string, callbacks: StreamCallbacks) {
    await this.checkLimit();

    const data = {
      assistant_id: assistantId,
      stream: true,
      /*
       stream: true will cause the result to be streamed back like:

        event: thread.run.created
        data: {"id":"run_123","object":"thread.run","created_at":1710348075,"assistant_id":"asst_123","thread_id":"thread_123","status":"queued","started_at":null,"expires_at":1710348675,"cancelled_at":null,"failed_at":null,"completed_at":null,"required_action":null,"last_error":null,"model":"gpt-4o","instructions":null,"tools":[],"metadata":{},"temperature":1.0,"top_p":1.0,"max_completion_tokens":null,"max_prompt_tokens":null,"truncation_strategy":{"type":"auto","last_messages":null},"incomplete_details":null,"usage":null,"response_format":"auto","tool_choice":"auto","parallel_tool_calls":true}}

        event: thread.run.queued
        data: {"id":"run_123","object":"thread.run","created_at":1710348075,"assistant_id":"asst_123","thread_id":"thread_123","status":"queued","started_at":null,"expires_at":1710348675,"cancelled_at":null,"failed_at":null,"completed_at":null,"required_action":null,"last_error":null,"model":"gpt-4o","instructions":null,"tools":[],"metadata":{},"temperature":1.0,"top_p":1.0,"max_completion_tokens":null,"max_prompt_tokens":null,"truncation_strategy":{"type":"auto","last_messages":null},"incomplete_details":null,"usage":null,"response_format":"auto","tool_choice":"auto","parallel_tool_calls":true}}

        event: thread.run.in_progress
        data: {"id":"run_123","object":"thread.run","created_at":1710348075,"assistant_id":"asst_123","thread_id":"thread_123","status":"in_progress","started_at":1710348075,"expires_at":1710348675,"cancelled_at":null,"failed_at":null,"completed_at":null,"required_action":null,"last_error":null,"model":"gpt-4o","instructions":null,"tools":[],"metadata":{},"temperature":1.0,"top_p":1.0,"max_completion_tokens":null,"max_prompt_tokens":null,"truncation_strategy":{"type":"auto","last_messages":null},"incomplete_details":null,"usage":null,"response_format":"auto","tool_choice":"auto","parallel_tool_calls":true}}

        event: thread.run.step.created
        data: {"id":"step_001","object":"thread.run.step","created_at":1710348076,"run_id":"run_123","assistant_id":"asst_123","thread_id":"thread_123","type":"message_creation","status":"in_progress","cancelled_at":null,"completed_at":null,"expires_at":1710348675,"failed_at":null,"last_error":null,"step_details":{"type":"message_creation","message_creation":{"message_id":"msg_001"}},"usage":null}

        event: thread.run.step.in_progress
        data: {"id":"step_001","object":"thread.run.step","created_at":1710348076,"run_id":"run_123","assistant_id":"asst_123","thread_id":"thread_123","type":"message_creation","status":"in_progress","cancelled_at":null,"completed_at":null,"expires_at":1710348675,"failed_at":null,"last_error":null,"step_details":{"type":"message_creation","message_creation":{"message_id":"msg_001"}},"usage":null}

        event: thread.message.created
        data: {"id":"msg_001","object":"thread.message","created_at":1710348076,"assistant_id":"asst_123","thread_id":"thread_123","run_id":"run_123","status":"in_progress","incomplete_details":null,"incomplete_at":null,"completed_at":null,"role":"assistant","content":[],"metadata":{}}

        event: thread.message.in_progress
        data: {"id":"msg_001","object":"thread.message","created_at":1710348076,"assistant_id":"asst_123","thread_id":"thread_123","run_id":"run_123","status":"in_progress","incomplete_details":null,"incomplete_at":null,"completed_at":null,"role":"assistant","content":[],"metadata":{}}

        event: thread.message.delta
        data: {"id":"msg_001","object":"thread.message.delta","delta":{"content":[{"index":0,"type":"text","text":{"value":"Hello","annotations":[]}}]}}

        ...

        event: thread.message.delta
        data: {"id":"msg_001","object":"thread.message.delta","delta":{"content":[{"index":0,"type":"text","text":{"value":" today"}}]}}

        event: thread.message.delta
        data: {"id":"msg_001","object":"thread.message.delta","delta":{"content":[{"index":0,"type":"text","text":{"value":"?"}}]}}

        event: thread.message.completed
        data: {"id":"msg_001","object":"thread.message","created_at":1710348076,"assistant_id":"asst_123","thread_id":"thread_123","run_id":"run_123","status":"completed","incomplete_details":null,"incomplete_at":null,"completed_at":1710348077,"role":"assistant","content":[{"type":"text","text":{"value":"Hello! How can I assist you today?","annotations":[]}}],"metadata":{}}

        event: thread.run.step.completed
        data: {"id":"step_001","object":"thread.run.step","created_at":1710348076,"run_id":"run_123","assistant_id":"asst_123","thread_id":"thread_123","type":"message_creation","status":"completed","cancelled_at":null,"completed_at":1710348077,"expires_at":1710348675,"failed_at":null,"last_error":null,"step_details":{"type":"message_creation","message_creation":{"message_id":"msg_001"}},"usage":{"prompt_tokens":20,"completion_tokens":11,"total_tokens":31}}

        event: thread.run.completed
        data: {"id":"run_123","object":"thread.run","created_at":1710348075,"assistant_id":"asst_123","thread_id":"thread_123","status":"completed","started_at":1710348075,"expires_at":null,"cancelled_at":null,"failed_at":null,"completed_at":1710348077,"required_action":null,"last_error":null,"model":"gpt-4o","instructions":null,"tools":[],"metadata":{},"temperature":1.0,"top_p":1.0,"max_completion_tokens":null,"max_prompt_tokens":null,"truncation_strategy":{"type":"auto","last_messages":null},"incomplete_details":null,"usage":{"prompt_tokens":20,"completion_tokens":11,"total_tokens":31},"response_format":"auto","tool_choice":"auto","parallel_tool_calls":true}}

        event: done
        data: [DONE]

       */
    };

    console.log('streamRun', data);

    const response = await this.fetch(`/threads/${threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Failed to get reader from response');
    }

    // Create a new TextDecoder to handle the stream
    const decoder = new TextDecoder();
    let buffer = '';

    // Let's just output them for now
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (value) {
        buffer += decoder.decode(value, { stream: true });

        // Split the buffer into lines
        const lines = buffer.split('\n');

        // The last line is incomplete, so we'll keep it in the buffer
        buffer = lines.pop() || '';

        // Parse each line
        for (const line of lines) {
          if (line.length === 0) {
            continue;
          }

          console.log('streamRun line', line);
        }
      }
    }
  }
}