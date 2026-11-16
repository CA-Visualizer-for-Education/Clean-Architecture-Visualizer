# CAVE: Clean Architecture Verifier for VSCode

Check that your project follows Clean Architecture without leaving the editor.

## Usage

1. Open your project folder in VSCode.
2. Run **CAVE: Verify Clean Architecture** from the Command Palette
   (`Ctrl/Cmd+Shift+P`), or click **CAVE** in the status bar.
3. Each incorrect dependency shows up as a **warning** on the `import` line that
   breaks the rule, and in the **Problems** panel, with an explanation such as:

   > EnrollStudentController (controller) depends on use case interactor. In Clean
   > Architecture, a controller may only depend on input data or input boundary.

If everything checks out you'll see **"✓ Project adheres to Clean Architecture."**

CAVE looks for a `src` folder containing `use_case` (one sub-folder per use case)
and `interface_adapter`, or a `features` folder when packaging by module. Java is
the best-supported language; Python, JavaScript and TypeScript also work.

### Settings

| Setting | Default | Description |
| --- | --- | --- |
| `cave.projectRoot` | *(workspace folder)* | Folder to analyse, absolute or relative to the workspace folder. Use this when your project is in a sub-folder. |

### Limitations

- Analysis is heuristic: a file's role is guessed from its name, and imports are
  matched line by line, so results can be approximate.
- Only the **first** offending import in a file is marked, on the whole line.
- Some violations can't be traced to a line; they're listed in the **CAVE** output
  channel instead.
- Analysis runs only when you run the command, not on save.

## Development

The extension calls the CAVE engine in `../clean-architecture-visualizer` as
`cave verify --json` (see `docs/adr/0001-vscode-extension-json-seam.md`). The build
bundles the engine from source into `dist/engine/`, so the two always match.

```bash
cd clean-architecture-visualizer && npm ci   # engine dependencies (bundled at build time)
cd ../vscode-extension && npm ci
npm run build       # dist/extension.js + dist/engine/
npm test            # unit tests (no VSCode needed)
npm run typecheck
npm run package     # produces cave-vscode-<version>.vsix
```

To try it, open `vscode-extension/` in VSCode and press **F5**, then open a
project (e.g. one from `cave-test-repo`) in the new window.

Install a packaged build with **Extensions → … → Install from VSIX…**.
