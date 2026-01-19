export type { Present3DToolData, Present3DArgs, Present3DResult } from "./types";
export { TOOL_NAME, TOOL_DEFINITION } from "./definition";
export { pluginCore, present3D, executePresent3D } from "./plugin";
export { samples } from "./samples";

// Re-export ShapeScript utilities
export { parseShapeScript } from "../shapescript/parser";
export { astToThreeJS } from "../shapescript/toThreeJS";
export type { SceneNode } from "../shapescript/types";
