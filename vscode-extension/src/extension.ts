import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import {
  describeUnlocated,
  parseReport,
  planReport,
  type ReportPlan,
} from './report';
import { resolveProjectRoot, runEngine } from './runner';

const SOURCE = 'CAVE';

let diagnostics: vscode.DiagnosticCollection;
let output: vscode.OutputChannel;
let running = false;

// --- CAVE terminal -------------------------------------------------------
// A pseudoterminal: VSCode shows it in the Terminal panel, but no shell or
// Node install is needed because the extension writes the text itself.
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const UNDERLINE = '\x1b[4m';
const RESET = '\x1b[0m';
const SEPARATOR = '-'.repeat(60);

let terminal: vscode.Terminal | undefined;
let terminalWriter: vscode.EventEmitter<string> | undefined;
let terminalReady: Promise<void> | undefined;

function caveTerminal(): Promise<void> {
  if (terminal && terminal.exitStatus === undefined && terminalReady) {
    return terminalReady;
  }
  const writer = new vscode.EventEmitter<string>();
  let markReady!: () => void;
  terminalReady = new Promise((resolve) => (markReady = resolve));
  terminalWriter = writer;
  terminal = vscode.window.createTerminal({
    name: 'CAVE',
    pty: {
      onDidWrite: writer.event,
      open: () => markReady(),
      close: () => {
        terminal = undefined;
        terminalWriter = undefined;
        terminalReady = undefined;
      },
    },
  });
  return terminalReady;
}

async function printToTerminal(lines: string[]): Promise<void> {
  const ready = caveTerminal();
  terminal?.show(true); // true: keep focus in the editor
  await ready;
  terminalWriter?.fire(
    [SEPARATOR, ...lines, SEPARATOR].join('\r\n') + '\r\n\r\n'
  );
}

function terminalReport(plan: ReportPlan, projectRoot: string): string[] {
  const header = `${BOLD}CAVE${RESET} ${DIM}${new Date().toLocaleTimeString()} · ${projectRoot}${RESET}`;
  if (plan.kind === 'clean') {
    return [header, `${GREEN}✓ Project adheres to Clean Architecture${RESET} (${plan.useCaseCount} use case(s) checked).`];
  }
  if (plan.kind === 'no_layout') {
    return [
      header,
      `${YELLOW}⚠ CAVE could not find a Clean Architecture layout.${RESET}`,
      '  It looks for src/use_case (one folder per use case) and src/interface_adapter,',
      '  or a "features" folder. If your project is in a sub-folder, set "cave.projectRoot".',
    ];
  }
  const total = plan.diagnostics.length + plan.unlocated.length;
  const lines = [header, `${YELLOW}${BOLD}⚠ CAVE found ${total} Clean Architecture violation(s):${RESET}`, ''];
  for (const d of plan.diagnostics) {
    // "file:line" is clickable in the VSCode terminal.
    const where = `${path.relative(projectRoot, d.absolutePath)}:${d.line + 1}`;
    lines.push(`  ${YELLOW}⚠${RESET} ${UNDERLINE}${where}${RESET}`, `    Clean Architecture Violation: ${d.message} ${DIM}(${d.code})${RESET}`);
  }
  for (const v of plan.unlocated) {
    lines.push(`  ${YELLOW}⚠${RESET} (no file location)`, `    Clean Architecture Violation: ${describeUnlocated(v)}`);
  }
  return lines;
}

export function activate(context: vscode.ExtensionContext): void {
  diagnostics = vscode.languages.createDiagnosticCollection('cave');
  output = vscode.window.createOutputChannel('CAVE');

  const statusItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusItem.text = '$(checklist) CAVE';
  statusItem.tooltip = 'Verify Clean Architecture';
  statusItem.command = 'cave.verify';
  statusItem.show();

  context.subscriptions.push(
    diagnostics,
    output,
    { dispose: () => terminal?.dispose() },
    statusItem,
    vscode.commands.registerCommand('cave.verify', () => verify(context))
  );
}

export function deactivate(): void {}

async function pickWorkspaceFolder(): Promise<
  vscode.WorkspaceFolder | undefined
> {
  const folders = vscode.workspace.workspaceFolders ?? [];
  if (folders.length <= 1) return folders[0];
  // Prefer the folder of the active editor in a multi-root workspace.
  const activeUri = vscode.window.activeTextEditor?.document.uri;
  const active = activeUri && vscode.workspace.getWorkspaceFolder(activeUri);
  return active ?? vscode.window.showWorkspaceFolderPick();
}

async function verify(context: vscode.ExtensionContext): Promise<void> {
  if (running) {
    vscode.window.showInformationMessage('CAVE is already analysing.');
    return;
  }

  const folder = await pickWorkspaceFolder();
  if (!folder) {
    vscode.window.showWarningMessage(
      'CAVE: open your project folder first, then run "CAVE: Verify Clean Architecture".'
    );
    return;
  }

  const setting = vscode.workspace
    .getConfiguration('cave', folder.uri)
    .get<string>('projectRoot');
  const projectRoot = resolveProjectRoot(folder.uri.fsPath, setting);
  if (!fs.existsSync(projectRoot)) {
    vscode.window.showErrorMessage(
      `CAVE: the folder set in "cave.projectRoot" does not exist: ${projectRoot}`
    );
    return;
  }

  const enginePath = vscode.Uri.joinPath(
    context.extensionUri,
    'dist',
    'engine',
    'src',
    'app',
    'index.mjs'
  ).fsPath;

  running = true;
  output.appendLine(`Analysing ${projectRoot} …`);
  try {
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title: 'CAVE: verifying Clean Architecture',
      },
      () => runEngine({ enginePath, projectRoot })
    );
    if (result.stderr.trim()) output.appendLine(result.stderr.trim());
    if (result.exitCode !== 0) {
      throw new Error(`The CAVE engine exited with code ${result.exitCode}.`);
    }
    const plan = planReport(parseReport(result.stdout), projectRoot);
    show(plan);
    await printToTerminal(terminalReport(plan, projectRoot));
  } catch (err) {
    diagnostics.clear();
    const message = err instanceof Error ? err.message : String(err);
    output.appendLine(`Error: ${message}`);
    const choice = await vscode.window.showErrorMessage(
      `CAVE could not analyse the project: ${message}`,
      'Show Log'
    );
    if (choice === 'Show Log') output.show();
  } finally {
    running = false;
  }
}

function show(plan: ReportPlan): void {
  // Each run replaces the previous run's results.
  diagnostics.clear();

  if (plan.kind === 'clean') {
    output.appendLine(`✓ ${plan.useCaseCount} use case(s), no violations.`);
    vscode.window.showInformationMessage(
      '✓ Project adheres to Clean Architecture.'
    );
    return;
  }

  if (plan.kind === 'no_layout') {
    output.appendLine('No recognizable Clean Architecture layout found.');
    vscode.window.showWarningMessage(
      'CAVE could not find a Clean Architecture layout. It looks for a "src" folder ' +
        'containing "use_case" (with one sub-folder per use case) and "interface_adapter", ' +
        'or a "features" folder. If your project lives in a sub-folder, set "cave.projectRoot".'
    );
    return;
  }

  const byFile = new Map<string, vscode.Diagnostic[]>();
  for (const d of plan.diagnostics) {
    const diagnostic = new vscode.Diagnostic(
      // Whole line: the engine reports a line number but no column.
      new vscode.Range(d.line, 0, d.line, Number.MAX_SAFE_INTEGER),
      // Prefix so students know the extension flagged it, not the compiler.
      `Clean Architecture Violation: ${d.message}`,
      vscode.DiagnosticSeverity.Warning
    );
    diagnostic.source = SOURCE;
    diagnostic.code = d.code;
    const list = byFile.get(d.absolutePath) ?? [];
    list.push(diagnostic);
    byFile.set(d.absolutePath, list);
  }
  for (const [file, list] of byFile) {
    diagnostics.set(vscode.Uri.file(file), list);
  }

  const total = plan.diagnostics.length + plan.unlocated.length;
  output.appendLine(`Found ${total} violation(s).`);
  for (const v of plan.unlocated) {
    output.appendLine(`  (no file location) ${describeUnlocated(v)}`);
  }

  if (plan.unlocated.length > 0) {
    vscode.window
      .showWarningMessage(
        `CAVE found ${total} Clean Architecture violation(s); ` +
          `${plan.unlocated.length} could not be traced to a specific line.`,
        'Show Details',
        'Open Problems'
      )
      .then((choice) => {
        if (choice === 'Show Details') output.show();
        if (choice === 'Open Problems') {
          vscode.commands.executeCommand('workbench.actions.view.problems');
        }
      });
  } else {
    vscode.window
      .showWarningMessage(
        `CAVE found ${total} Clean Architecture violation(s).`,
        'Open Problems'
      )
      .then((choice) => {
        if (choice) {
          vscode.commands.executeCommand('workbench.actions.view.problems');
        }
      });
  }
}
