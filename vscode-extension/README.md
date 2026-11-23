# CAVE for VS Code

Check your project for Clean Architecture violations without leaving your editor.

Run one command and CAVE underlines every import that breaks a dependency rule, with an explanation of why.

> **Status:** In development (MVP).

## Usage

1. Install the extension.
2. Open your project folder in VS Code (**File → Open Folder…**).
3. Open the Command Palette: **Ctrl+Shift+P** (Windows/Linux) or **Cmd+Shift+P** (Mac). You should see `>` at the top.
4. Type **CAVE** and choose **CAVE: Verify Clean Architecture**. You can also click **CAVE** in the bottom-left status bar.

CAVE checks the whole project, not just the open file. Each violation is:

- underlined in yellow on the `import` line that breaks the rule (hover to see why),
- listed in the **Problems** panel (click to jump to the line),
- printed in the **CAVE** terminal.

Example from the CAVE terminal:

```
CAVE 11:15:18 AM
⚠ CAVE found 1 Clean Architecture violation(s):

  ⚠ src/main/java/entity/Student.java:3
    Clean Architecture Violation: Student (entities) depends on controller. In Clean Architecture, entities must not depend on any other Clean Architecture component. (entities → controller)
```

If there are no violations, you'll see **"✓ Project adheres to Clean Architecture."**

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `cave.projectRoot` | *(workspace folder)* | Folder to analyse, absolute or relative to the workspace folder. Use this when your project is in a sub-folder. |

## Supported languages

Java, Python, JavaScript, and TypeScript. Java works best!

CAVE looks for a `src` folder containing `use_case` (one sub-folder per use case) and `interface_adapter`, or a `features` folder when packaging by module.

## How it works

The extension runs the [CAVE engine](https://github.com/CA-Visualizer-for-Education/Clean-Architecture-Visualizer/tree/main/clean-architecture-visualizer) as a bundled child process (`cave verify --json`) and turns its results into VS Code warnings. No separate install needed.

## Limitations

- Analysis is heuristic: a file's role is guessed from its name, and imports are matched line by line, so results can be approximate.
- Only the **first** offending import in a file is underlined, on the whole line.
- Some violations can't be traced to a line; they're listed in the CAVE terminal with "(no file location)".
- CAVE only runs when you run the command, not on save.

## Future implementations

- Run on save
- Quick fixes

## Testing

You can also run CAVE's checks from the command line, no VS Code needed. Install the CLI (`npm install -g clean-architecture-visualizer`), then from the root of the project you want to check:

```bash
cave verify          # readable ✓ / ✗ summary per use case
cave verify --json   # the report the extension reads
```

To work on the extension itself:

```bash
cd clean-architecture-visualizer && npm ci   # engine dependencies (bundled at build time)
cd ../vscode-extension && npm ci
npm test            # unit tests (no VS Code needed)
npm run typecheck
npm run package     # builds the .vsix
```

To try your changes, open `vscode-extension/` in VS Code and press **F5**, then open a project (e.g. one from [cave-test-repo](https://github.com/CA-Visualizer-for-Education/cave-test-repo)) in the new window.
