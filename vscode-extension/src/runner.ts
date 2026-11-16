// Spawns the bundled CAVE engine as `cave verify --json`.
// No `vscode` import, so it can be unit tested with Jest.

import { spawn } from 'node:child_process';
import * as path from 'node:path';

export type RunResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

export type RunOptions = {
  /** Absolute path of the engine entry script inside the extension. */
  enginePath: string;
  /** Directory to analyse; the engine scans its cwd. */
  projectRoot: string;
  /** Node binary. Inside VSCode this is the Electron binary (see env below). */
  nodePath?: string;
  timeoutMs?: number;
};

/**
 * Resolve the folder to analyse: the `cave.projectRoot` setting (absolute,
 * or relative to the workspace folder) or the workspace folder itself.
 */
export function resolveProjectRoot(
  workspaceRoot: string,
  setting: string | undefined
): string {
  const trimmed = setting?.trim();
  if (!trimmed) return workspaceRoot;
  return path.resolve(workspaceRoot, trimmed);
}

/** Run the engine once and collect its output. Rejects only if it can't start or times out. */
export function runEngine(options: RunOptions): Promise<RunResult> {
  const {
    enginePath,
    projectRoot,
    nodePath = process.execPath,
    timeoutMs = 120_000,
  } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(nodePath, [enginePath, 'verify', '--json'], {
      cwd: projectRoot,
      // VSCode's process.execPath is Electron; this makes it behave as plain Node.
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });

    const timer = setTimeout(() => {
      child.kill();
      reject(
        new Error(
          `CAVE analysis timed out after ${Math.round(timeoutMs / 1000)}s.`
        )
      );
    }, timeoutMs);

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode });
    });
  });
}
