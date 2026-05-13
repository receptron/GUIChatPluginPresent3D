// Test the wave script that was causing issues
import { parseShapeScript } from "./src/shapescript/parser.ts";

const waveScript = `
// Define wave parameters
define amplitude 2
define frequency 1

// Loop along the x-axis from -10 to 10
for x in -10 to 10 step 0.3 {
    // Calculate the y position using sine
    define y (sin(x * frequency) * amplitude)

    // Map y from range [-2, 2] to [0, 1] for color
    define colorVal ((y / amplitude + 1) / 2)

    // Create a sphere at the calculated position
    sphere {
        position x y 0
        size 0.25
        color colorVal 0.3 (1 - colorVal)
    }
}

// Add a reference line for the X-axis
cube {
    position 0 0 0
    size 20 0.05 0.05
    color 0.5 0.5 0.5
}
`;

console.log("Testing wave script...");
try {
  const ast = parseShapeScript(waveScript);
  console.log("✓ Script parsed successfully!");
  console.log(`  Nodes: ${ast.length}`);
  console.log("  AST structure looks good");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.log("✗ Parse error:", message);
  process.exit(1);
}
