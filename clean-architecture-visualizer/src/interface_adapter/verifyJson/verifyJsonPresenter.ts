import type { ViolationEntry } from '../../use_case/getViolations/GetViolationsInteractor.js';

/**
 * Bump when the shape of `VerifyJsonReport` changes in a way consumers
 * (e.g. the VSCode extension) must know about. See docs/adr/0001.
 */
export const VERIFY_JSON_SCHEMA_VERSION = 1;

/**
 * - `clean`: at least one use case was found and none has a violation.
 * - `violations`: at least one incorrect-dependency violation was found.
 * - `no_layout`: no use cases were found, so the project doesn't look like a
 *   Clean Architecture layout the engine recognises.
 */
export type VerifyStatus = 'clean' | 'violations' | 'no_layout';

export type VerifyJsonViolation = ViolationEntry & {
  use_case: string;
};

export type VerifyJsonReport = {
  schema_version: number;
  status: VerifyStatus;
  /** Absolute path of the analysed project root (the engine's cwd). */
  project_root: string;
  use_cases: string[];
  violations: VerifyJsonViolation[];
};

/**
 * Combines the per-use-case violation lists into the single report printed by
 * `cave verify --json`.
 * @param projectRoot absolute path that was analysed.
 * @param useCases each use case's name and the violations found in it.
 */
export function buildVerifyJsonReport(
  projectRoot: string,
  useCases: { name: string; violations: ViolationEntry[] }[]
): VerifyJsonReport {
  // Violation ids from GetViolations are only unique within one use case,
  // so prefix them with the use case to keep them unique in the report.
  const violations = useCases.flatMap(({ name, violations }) =>
    violations.map((v) => ({ ...v, id: `${name}/${v.id}`, use_case: name }))
  );

  let status: VerifyStatus;
  if (useCases.length === 0) status = 'no_layout';
  else if (violations.length > 0) status = 'violations';
  else status = 'clean';

  return {
    schema_version: VERIFY_JSON_SCHEMA_VERSION,
    status,
    project_root: projectRoot,
    use_cases: useCases.map((u) => u.name),
    violations,
  };
}
