import type { ToolSample } from "gui-chat-protocol";

export const samples: ToolSample[] = [
  {
    name: "Basic Shapes",
    args: {
      title: "Basic 3D Shapes",
      script: `// Basic shapes demonstration
cube { position -2 0 0 size 1 color (1 0.3 0.3) }
sphere { position 0 0 0 size 1 color (0.3 1 0.3) }
cylinder { position 2 0 0 size 0.5 1 color (0.3 0.3 1) }`,
    },
  },
  {
    name: "Circular Pattern",
    args: {
      title: "Circular Pattern",
      script: `// Create a circular pattern of cubes
define count 12
for i in 1 to count {
    define angle ((i / count) * 6.283)
    cube {
        position (cos(angle) * 3) 0 (sin(angle) * 3)
        color (i / count) 0.5 (1 - i / count)
        size 0.5
    }
}`,
    },
  },
  {
    name: "CSG Difference",
    args: {
      title: "Hollow Sphere",
      script: `// Create a hollow sphere using CSG difference
difference {
    sphere { size 2 color (1 0.5 0) }
    sphere { size 1.7 color (1 1 1) }
    cube { position 0 0 2 size 2 }
}`,
    },
  },
];
