import * as path from 'node:path';
import {
  describeUnlocated,
  parseReport,
  planReport,
  type VerifyReport,
  type Violation,
} from '../src/report';

const root = path.resolve('/projects/student');

function violation(overrides: Partial<Violation> = {}): Violation {
  return {
    id: 'Login/v-0',
    type: 'INCORRECT_DEPENDENCY',
    message: 'LoginController (controller) depends on entities.',
    suggestion: '',
    related_edge_id: 'controller->entities',
    use_case: 'Login',
    file_context: {
      file: 'LoginController.java',
      path: 'src/interface_adapter/Login/LoginController.java',
      line_number: 3,
      snippet: 'import entity.User;',
    },
    ...overrides,
  };
}

function report(overrides: Partial<VerifyReport> = {}): VerifyReport {
  return {
    schema_version: 1,
    status: 'violations',
    project_root: root,
    use_cases: ['Login'],
    violations: [violation()],
    ...overrides,
  };
}

describe('parseReport', () => {
  it('parses a valid report (with trailing newline)', () => {
    const r = report();
    expect(parseReport(`${JSON.stringify(r)}\n`)).toEqual(r);
  });

  it('rejects non-JSON output', () => {
    expect(() => parseReport('Directory views not found')).toThrow(
      'did not return valid JSON'
    );
  });

  it('rejects an unexpected shape', () => {
    expect(() => parseReport('{"status":"weird"}')).toThrow(
      'unexpected report format'
    );
  });

  it('rejects an unsupported schema version', () => {
    expect(() =>
      parseReport(JSON.stringify(report({ schema_version: 2 })))
    ).toThrow('Unsupported CAVE report version 2');
  });
});

describe('planReport', () => {
  it('returns clean with the number of use cases', () => {
    expect(
      planReport(report({ status: 'clean', violations: [] }), root)
    ).toEqual({ kind: 'clean', useCaseCount: 1 });
  });

  it('returns no_layout', () => {
    expect(
      planReport(
        report({ status: 'no_layout', use_cases: [], violations: [] }),
        root
      )
    ).toEqual({ kind: 'no_layout' });
  });

  it('maps a located violation to a 0-based line in an absolute file', () => {
    const plan = planReport(report(), root);
    expect(plan).toEqual({
      kind: 'violations',
      unlocated: [],
      diagnostics: [
        {
          absolutePath: path.join(
            root,
            'src/interface_adapter/Login/LoginController.java'
          ),
          line: 2,
          message: 'LoginController (controller) depends on entities.',
          code: 'controller → entities',
        },
      ],
    });
  });

  it('keeps violations without a location out of the diagnostics', () => {
    const unlocated = violation({ file_context: undefined });
    const plan = planReport(report({ violations: [unlocated] }), root);
    expect(plan).toEqual({
      kind: 'violations',
      diagnostics: [],
      unlocated: [unlocated],
    });
  });

  it('falls back to the edge when the engine sent no message', () => {
    const plan = planReport(
      report({ violations: [violation({ message: '' })] }),
      root
    );
    expect(plan.kind === 'violations' && plan.diagnostics[0].message).toBe(
      'Incorrect dependency: controller → entities.'
    );
  });
});

describe('describeUnlocated', () => {
  it('prefixes the use case', () => {
    expect(describeUnlocated(violation())).toBe(
      '[Login] LoginController (controller) depends on entities.'
    );
  });
});
