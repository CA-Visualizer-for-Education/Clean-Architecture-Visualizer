// Builds the extension and bundles the CAVE engine into it, so students only
// install the .vsix (no `npm i -g`). The engine is bundled straight from this
// repo's source on every build, which keeps the two versions in lockstep.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const engineDir = path.resolve(root, '../clean-architecture-visualizer');
const outDir = path.join(root, 'dist');

fs.rmSync(outDir, { recursive: true, force: true });

// 1. The extension itself (CommonJS; `vscode` is provided by the editor).
await esbuild.build({
  entryPoints: [path.join(root, 'src/extension.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  external: ['vscode'],
  outfile: path.join(outDir, 'extension.js'),
  sourcemap: true,
});

// 2. The engine CLI as one ESM file. It keeps the same relative layout as the
//    engine's tsc output (dist/src/app/index.js) because the CLI reads its
//    version from '../../package.json' next to that file.
await esbuild.build({
  entryPoints: [path.join(engineDir, 'src/app/index.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  outfile: path.join(outDir, 'engine/src/app/index.mjs'),
  // Only `cave start` in development mode loads vite (via a dynamic import);
  // the extension only runs `cave verify --json`, so leave it out.
  external: ['vite'],
  // Bundled CommonJS deps (e.g. express) call require() for Node built-ins,
  // which needs a real require function inside an ES module.
  banner: {
    js: "import { createRequire as __caveCreateRequire } from 'node:module'; const require = __caveCreateRequire(import.meta.url);",
  },
  logOverride: { 'empty-import-meta': 'silent' },
});

const enginePkg = JSON.parse(
  fs.readFileSync(path.join(engineDir, 'package.json'), 'utf8')
);
fs.writeFileSync(
  path.join(outDir, 'engine/package.json'),
  `${JSON.stringify({ name: enginePkg.name, version: enginePkg.version, type: 'module' }, null, 2)}\n`
);

console.log(`Built extension + CAVE engine ${enginePkg.version} into dist/`);
