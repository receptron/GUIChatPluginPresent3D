import type { ToolResult } from "gui-chat-protocol";

export interface Present3DToolData {
  script: string;
}

export interface Present3DArgs {
  title: string;
  script: string;
}

export type Present3DResult = ToolResult<Present3DToolData>;
