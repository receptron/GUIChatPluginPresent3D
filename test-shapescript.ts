// Quick test for ShapeScript implementation
// Run with: npx tsx test-shapescript.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { parseShapeScript } from './src/shapescript/parser';
import { astToThreeJS } from './src/shapescript/toThreeJS';
import { SceneNode } from './src/shapescript/types';
import { samples } from './src/core/samples';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const examplesDir = path.join(__dirname, 'src/shapescript/examples');

interface ShapeScriptExample {
  name: string;
  file: string;
  script: string;
  lines: number;
}

interface TestResult {
  example: ShapeScriptExample;
  success: boolean;
  nodes?: SceneNode[];
  error?: Error;
  parseTime?: number;
}

interface TransformTestCase {
  description: string;
  script: string;
  expectedPositions: [number, number, number][];
}

// Read all .shape files from the examples directory
function loadExamples(): ShapeScriptExample[] {
  const files = fs.readdirSync(examplesDir);
  const shapeFiles = files.filter((file) => file.endsWith('.shape'));

  return shapeFiles.map((file) => {
    const filePath = path.join(examplesDir, file);
    const script = fs.readFileSync(filePath, 'utf-8');
    const name = file.replace('.shape', '');

    return {
      name,
      file,
      script,
      lines: script.split('\n').length,
    };
  });
}

// Test parsing a single example
function testExample(example: ShapeScriptExample): TestResult {
  const startTime = performance.now();

  try {
    const nodes = parseShapeScript(example.script);
    const parseTime = performance.now() - startTime;

    return {
      example,
      success: true,
      nodes,
      parseTime,
    };
  } catch (error) {
    const parseTime = performance.now() - startTime;

    return {
      example,
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      parseTime,
    };
  }
}

// Count nodes recursively
function countNodes(nodes: SceneNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count++;
    if ('children' in node && node.children) {
      count += countNodes(node.children);
    }
    if ('body' in node && node.body) {
      count += countNodes(node.body);
    }
    if (node.type === 'if' && node.elseBody) {
      count += countNodes(node.elseBody);
    }
  }
  return count;
}

console.log('ShapeScript Parser Test\n');
console.log('='.repeat(70));
console.log('\nLoading examples from:', examplesDir);

const examples = loadExamples();
console.log(`\nFound ${examples.length} example files\n`);

console.log('Running parser tests...\n');
console.log('='.repeat(70));

const results: TestResult[] = [];

for (const example of examples) {
  const result = testExample(example);
  results.push(result);

  if (result.success) {
    const nodeCount = countNodes(result.nodes!);
    console.log(`✅ ${example.name.padEnd(15)} | ${example.lines.toString().padStart(3)} lines | ${nodeCount.toString().padStart(3)} nodes | ${result.parseTime!.toFixed(2)}ms`);
  } else {
    console.log(`❌ ${example.name.padEnd(15)} | ${example.lines.toString().padStart(3)} lines | FAILED`);
  }
}

console.log('\n' + '='.repeat(70));

// Summary
const passed = results.filter((r) => r.success).length;
const failed = results.filter((r) => !r.success).length;

console.log(`\nSummary: ${passed}/${examples.length} tests passed`);

if (failed > 0) {
  console.log('\nFailed tests:\n');
  for (const result of results.filter((r) => !r.success)) {
    console.log(`\n${result.example.name} (${result.example.file}):`);
    console.log(`Error: ${result.error!.message}`);
    if (result.error && 'line' in result.error && 'column' in result.error) {
      console.log(`Location: line ${result.error.line}, column ${result.error.column}`);
    }
  }
} else {
  console.log('\n✨ All tests passed!');

  // Show statistics
  const totalNodes = results.reduce((sum, r) => sum + (r.nodes ? countNodes(r.nodes) : 0), 0);
  const totalLines = results.reduce((sum, r) => sum + r.example.lines, 0);
  const totalTime = results.reduce((sum, r) => sum + (r.parseTime || 0), 0);

  console.log(`\nStatistics:`);
  console.log(`  Total lines parsed: ${totalLines}`);
  console.log(`  Total AST nodes: ${totalNodes}`);
  console.log(`  Total parse time: ${totalTime.toFixed(2)}ms`);
  console.log(`  Average time per file: ${(totalTime / examples.length).toFixed(2)}ms`);
}

console.log('\nRunning ShapeScript transform regression tests...\n');
const transformFailures = runTransformRegressionTests();

console.log('\nParsing the scripts this plugin ships as samples...\n');
const sampleFailures = parseSamples();

// The examples above live as .shape files; these live inside samples.ts, and
// nothing parsed them before — so a parser change could reject the plugin's own
// starting points while every example still passed.
function parseSamples(): number {
  let failures = 0;
  for (const [index, sample] of samples.entries()) {
    const script = String((sample.args as { script?: string } | undefined)?.script ?? '');
    if (!script) {
      console.log(`- ${sample.name}: no script to parse`);
      continue;
    }
    try {
      parseShapeScript(script);
      console.log(`\u2705 ${sample.name}`);
    } catch (error) {
      failures += 1;
      console.log(`\u274C ${sample.name} (sample ${index}) - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(`\nSample scripts: ${samples.length - failures}/${samples.length} parsed`);
  return failures;
}

// Reported and then exited 0 is how a broken parse or a changed transform stayed
// green in CI. The counts above are the report; this is what makes them a gate.

console.log('\nParsing the snippets this plugin SHOWS people...\n');
const snippetFailures = parseEmbeddedSnippets();

// Two sweeps over the examples this plugin shows a person or hands the model, both
// deciding by RUNNING the parser rather than by matching a shape:
//
//   - every fenced block in the README, which is unambiguous to extract;
//   - every block written on ONE line in the README, the tool definition or the
//     system prompt. That is the form the one-statement-per-line rule rejects, and
//     the form the tool was teaching the model to write when this core arrived.
//
// Nothing parsed either before, so the tool could teach a script the parser refuses.
//
// What it does NOT cover, named so the next reader knows the shape of the hole: a
// line with two statements INSIDE a multi-line block in one of these prose strings
// (`cube {` / `  size 1 color 1 0 0` / `}`). Detecting that means deciding which
// prose lines are script lines, and a sweep that guesses wrong reports a snippet
// that is not one — worse than the gap. The fenced blocks and the samples are
// parsed whole, so this only reaches snippets written inline in prose.
function parseEmbeddedSnippets(): number {
  const files = ['README.md', 'src/core/definition.ts', 'src/vue/index.ts'];
  const shapeWord = 'cube|sphere|cylinder|cone|torus|group|difference|union|intersection|path|extrude|lathe|fill|text';
  let failures = 0;

  const report = (label: string, snippets: string[]): void => {
    let bad = 0;
    for (const snippet of snippets) {
      try {
        parseShapeScript(snippet);
      } catch (error) {
        bad += 1;
        failures += 1;
        console.log(`\u274C ${label} - ${error instanceof Error ? error.message : String(error)}`);
        console.log(`   ${snippet.trim().split('\n')[0]}`);
      }
    }
    console.log(`${bad === 0 ? '\u2705' : '\u274C'} ${label}: ${snippets.length - bad}/${snippets.length} parsed`);
  };

  // The fence's own language tag decides — a `typescript` block that happens to
  // start with a word this language also uses is not a script.
  const readme = fs.readFileSync('README.md', 'utf8');
  const fenced: string[] = [];
  let language: string | null = null;
  let current: string[] = [];
  for (const line of readme.split('\n')) {
    if (line.trim().startsWith('```')) {
      if (language !== null) {
        if (language === 'shapescript' || language === 'shape') fenced.push(current.join('\n'));
        language = null;
      } else {
        language = line.trim().slice(3).trim().toLowerCase();
      }
      current = [];
      continue;
    }
    if (language !== null) current.push(line);
  }
  report('README.md shapescript blocks', fenced);

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const oneLine = new RegExp(`\\b(?:${shapeWord})\\s*\\{[^{}]*\\}`, 'g');
    report(`${file} one-line blocks`, [...text.matchAll(oneLine)].map((match) => match[0]));
  }
  return failures;
}

if (failed > 0 || transformFailures > 0 || sampleFailures > 0 || snippetFailures > 0) {
  console.log(`\n${failed} example(s), ${transformFailures} transform test(s), ${sampleFailures} sample script(s) and ${snippetFailures} shown snippet(s) failed.`);
  process.exit(1);
}

function runTransformRegressionTests(): number {
  const tests: TransformTestCase[] = [
    {
      // `rotate` takes roll yaw pitch in HALF-TURNS about Z, Y and X, as the
      // language itself does — so a roll of 0.5 is a quarter turn about Z and
      // the translate that follows goes along the rotated axes. (A pitch about
      // X, which is what `rotate 0 0 0.25` is, would leave an X translate where
      // it was, which is why the old script tested nothing here.)
      description: 'rotate then translate uses rotated axes',
      script: `
        rotate 0.5 0 0
        translate 1 0 0
        cube
      `,
      expectedPositions: [[0, -1, 0]],
    },
    {
      description: 'scale affects subsequent translations',
      script: `
        scale 0.5
        translate 2 0 0
        cube
      `,
      expectedPositions: [[1, 0, 0]],
    },
    {
      description: 'absolute position composes with relative translate',
      script: `
        translate 1 0 0
        cube { position 1 0 0 }
      `,
      expectedPositions: [[2, 0, 0]],
    },
  ];

  let passed = 0;

  for (const test of tests) {
    try {
      const nodes = parseShapeScript(test.script);
      const group = astToThreeJS(nodes);
      const positions = collectMeshPositions(group);

      if (positions.length < test.expectedPositions.length) {
        throw new Error(
          `Expected at least ${test.expectedPositions.length} meshes, found ${positions.length}`,
        );
      }

      const allMatch = test.expectedPositions.every((expected, index) =>
        vectorsAlmostEqual(positions[index], new THREE.Vector3(...expected)),
      );

      if (allMatch) {
        passed++;
        console.log(`✅ ${test.description}`);
      } else {
        console.log(`❌ ${test.description} (unexpected positions)`);
        positions.forEach((pos, idx) => {
          console.log(
            `  Mesh ${idx}: (${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)})`,
          );
        });
      }
    } catch (error) {
      console.log(`❌ ${test.description}`);
      console.log(`   ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log(`\nTransform tests: ${passed}/${tests.length} passed`);
  return tests.length - passed;
}

function collectMeshPositions(root: THREE.Object3D): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      positions.push(object.position.clone());
    }
  });
  return positions;
}

function vectorsAlmostEqual(a: THREE.Vector3, b: THREE.Vector3, epsilon = 1e-6): boolean {
  return (
    Math.abs(a.x - b.x) <= epsilon &&
    Math.abs(a.y - b.y) <= epsilon &&
    Math.abs(a.z - b.z) <= epsilon
  );
}
