import type { ToolContext, ToolPluginCore } from "gui-chat-protocol";
import type { Present3DArgs, Present3DToolData, Present3DResult } from "./types";
import { TOOL_NAME, TOOL_DEFINITION } from "./definition";

export const present3D = async (
  _context: ToolContext,
  args: Present3DArgs,
): Promise<Present3DResult> => {
  const { script, title } = args;

  // Validate that script is provided
  if (!script || script.trim() === "") {
    throw new Error("ShapeScript code is required but was not provided");
  }

  return {
    message: `Created 3D visualization: ${title}`,
    title,
    data: { script },
    instructions:
      "Acknowledge that the 3D visualization has been created and is displayed to the user. They can interact with it by rotating, zooming, and panning the camera.",
  };
};

export const pluginCore: ToolPluginCore<Present3DToolData, unknown, Present3DArgs> = {
  toolDefinition: TOOL_DEFINITION,
  execute: present3D,
  generatingMessage: "Creating 3D visualization...",
  waitingMessage:
    "Tell the user that the 3D visualization was created and will be presented shortly.",
  isEnabled: () => true,
};

export { TOOL_NAME, TOOL_DEFINITION };
export const executePresent3D = present3D;
