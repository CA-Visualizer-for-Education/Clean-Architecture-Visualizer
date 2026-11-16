// Pure logic for interpreting `cave verify --json` output.
// Deliberately has no `vscode` import so it can be unit tested with Jest.
// The report shape mirrors
// clean-architecture-visualizer/src/interface_adapter/verifyJson/verifyJsonPresenter.ts
// (see docs/adr/0001-vscode-extension-json-seam.md).

import * as path from 'node:path';

export const SUPPORTED_SCHEMA_VERSION = 1;

export type VerifyStatus = 'clean' | 'violations' | 'no_layout';

export type FileContext = {
  file: string;
  path: string;
  line_number?: number;
  snippet?: string;
};

export type Violation = {
  id: string;
  type: string;
  message: string;
  suggestion: string;
  related_edge_id: string;
  use_case: string;
  file_context?: FileContext;
};

export type VerifyReport = {
  schema_version: number;
  status: VerifyStatus;
  project_root: string;
  use_cases: string[];
  violations: Violation[];
};

/**
 * Parse and sanity-check the engine's stdout.
 * @throws Error with a readable message if the output isn't a usable report.
 */
export function parseReport(stdout: string): VerifyReport {
  let data: unknown;
  try {
    data = JSON.parse(stdout.trim());
  } catch {
    throw new Error('The CAVE engine did not return valid JSON.');
  }
  const report = data as Partial<VerifyReport> | null;
  if (
    !report ||
    typeof report !== 'object' ||
    typeof report.schema_version !== 'number' ||
    !['clean', 'violations', 'no_layout'].includes(report.status as string) ||
    !Array.isArray(report.violations)
  ) {
    throw new Error('The CAVE engine returned an unexpected report format.');
  }
  if (report.schema_version !== SUPPORTED_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported CAVE report version ${report.schema_version} (expected ${SUPPORTED_SCHEMA_VERSION}).`
    );
  }
  return report as VerifyReport;
}

/** One warning anchored to a whole line (the engine gives no column). */
export type PlannedDiagnostic = {
  /** Absolute path of the file to put the squiggle in. */
  absolutePath: string;
  /** 0-based line index, as VSCode expects. */
  line: number;
  message: string;
  /** Shown in the Problems panel next to the message, e.g. "entities → controller". */
  code: string;
};

export type ReportPlan =
  | { kind: 'clean'; useCaseCount: number }
  | { kind: 'no_layout' }
  | {
      kind: 'violations';
      diagnostics: PlannedDiagnostic[];
      /** Violations with no file/line: summarised, never a phantom squiggle. */
      unlocated: Violation[];
    };

function edgeLabel(v: Violation): string {
  return v.related_edge_id.replace('->', ' → ');
}

function fallbackMessage(v: Violation): string {
  return v.message || `Incorrect dependency: ${edgeLabel(v)}.`;
}

/**
 * Decide what the extension should show for a report: located violations
 * become line diagnostics; violations without a location are listed
 * separately so they can be summarised.
 * @param projectRoot the root the engine analysed; relative paths resolve
 *   against it.
 */
export function planReport(
  report: VerifyReport,
  projectRoot: string
): ReportPlan {
  if (report.status === 'no_layout') return { kind: 'no_layout' };
  if (report.status === 'clean' || report.violations.length === 0) {
    return { kind: 'clean', useCaseCount: report.use_cases.length };
  }

  const diagnostics: PlannedDiagnostic[] = [];
  const unlocated: Violation[] = [];
  for (const v of report.violations) {
    const ctx = v.file_context;
    if (!ctx?.path || !ctx.line_number || ctx.line_number < 1) {
      unlocated.push(v);
      continue;
    }
    diagnostics.push({
      absolutePath: path.resolve(projectRoot, ctx.path),
      line: ctx.line_number - 1,
      message: fallbackMessage(v),
      code: edgeLabel(v),
    });
  }
  return { kind: 'violations', diagnostics, unlocated };
}

/** One line per unlocated violation, for the output channel. */
export function describeUnlocated(v: Violation): string {
  return `[${v.use_case}] ${fallbackMessage(v)}`;
}
