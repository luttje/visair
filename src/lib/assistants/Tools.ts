export type ToolsConfig = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters?: {
      type: "object";
      properties: {
        [key: string]: {
          type: string;
          description: string;
          enum?: string[];
        };
      };
      required: string[];
      additionalProperties: false;
    };
    strict: true;
  };
}

export type ToolResult = {
  tool_call_id: string;
  output: string;
}
