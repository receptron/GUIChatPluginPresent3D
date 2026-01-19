# @gui-chat-plugin/present3d

[![npm version](https://badge.fury.io/js/%40gui-chat-plugin%2Fpresent3d.svg)](https://www.npmjs.com/package/@gui-chat-plugin/present3d)

3D shape presentation plugin using ShapeScript for GUI Chat applications. Create interactive 3D visualizations with a powerful DSL.

![Screenshot](https://raw.githubusercontent.com/receptron/GUIChatPluginPresent3D/main/images/screen.png)

## Features

- Full ShapeScript language support (variables, expressions, control flow)
- Interactive 3D viewport with camera controls
- Wireframe and grid toggle
- CSG operations (union, difference, intersection)
- Built-in math and trigonometric functions
- Inline script editing

## Installation

```bash
yarn add @gui-chat-plugin/present3d
```

## Usage

### Vue Integration

```typescript
// In src/tools/index.ts
import Present3DPlugin from "@gui-chat-plugin/present3d/vue";

const pluginList = [
  // ... other plugins
  Present3DPlugin,
];

// In src/main.ts
import "@gui-chat-plugin/present3d/style.css";
```

### Core-only Usage

```typescript
import { executePresent3D, TOOL_DEFINITION } from "@gui-chat-plugin/present3d";

// Create a 3D visualization
const result = await executePresent3D(context, {
  title: "Circular Pattern",
  script: `
define count 12
for i in 1 to count {
    define angle ((i / count) * 6.283)
    cube {
        position (cos(angle) * 3) 0 (sin(angle) * 3)
        color (i / count) 0.5 (1 - i / count)
        size 0.5
    }
}
  `,
});
```

## API

### Present3DArgs

```typescript
interface Present3DArgs {
  title: string;   // Title for the visualization
  script: string;  // ShapeScript code
}
```

### Present3DToolData

```typescript
interface Present3DToolData {
  script: string;  // The ShapeScript source code
}
```

## ShapeScript Language

### Primitives
- `cube`, `sphere`, `cylinder`, `cone`, `torus`

### Properties
- `position X Y Z` - 3D position
- `rotation X Y Z` - Rotation in half-turns
- `size X Y Z` - Scale
- `color R G B` - RGB color (0-1)
- `opacity` - Transparency (0-1)

### Variables & Expressions
```shapescript
define radius 2
define red (1 0 0)
sphere { size radius color red }
```

### Control Flow
```shapescript
for i in 1 to 5 {
    cube { position (i * 2) 0 0 }
}

if condition {
    sphere
} else {
    cube
}
```

### CSG Operations
```shapescript
difference {
    sphere { size 2 }
    cube { size 1.5 }
}
```

### Built-in Functions
- Math: `round`, `floor`, `ceil`, `abs`, `sqrt`, `pow`, `min`, `max`
- Trig: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`

## Development

```bash
# Install dependencies
yarn install

# Run demo
yarn dev

# Build
yarn build

# Lint
yarn lint
```

## Test Prompts

Try these prompts to test the plugin:

1. "Create a 3D visualization of a simple house with a roof"
2. "Show me a 3D spiral staircase"
3. "Generate a 3D model of the solar system with planets orbiting the sun"

## License

MIT
