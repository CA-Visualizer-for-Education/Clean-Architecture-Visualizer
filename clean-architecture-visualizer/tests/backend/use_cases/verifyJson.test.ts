import path from 'node:path';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CleanArchAccess } from '../../../src/data_access/cleanArchInfoAccess.js';
import { FileAccess } from '../../../src/data_access/fileAccess.js';
import { SessionDBAccess } from '../../../src/data_access/sessionDBAccess.js';
import {
  buildVerifyJsonReport,
  VERIFY_JSON_SCHEMA_VERSION,
} from '../../../src/interface_adapter/verifyJson/verifyJsonPresenter.js';
import { GetViolationsInputData } from '../../../src/use_case/getViolations/GetViolationsInputData.js';
import {
  buildViolationMessage,
  GetViolationsInteractor,
  type ViolationEntry,
} from '../../../src/use_case/getViolations/GetViolationsInteractor.js';
import { GetViolationsOutputData } from '../../../src/use_case/getViolations/GetViolationsOutputData.js';

describe('buildViolationMessage', () => {
  it('names the file and lists the allowed dependencies', () => {
    expect(
      buildViolationMessage(
        'controller',
        'entities',
        ['inputData', 'inputBoundary'],
        'LoginController.java'
      )
    ).toBe(
      'LoginController (controller) depends on entities. In Clean Architecture, a controller may only depend on input data or input boundary.'
    );
  });

  it('explains that a node with no allowed dependencies must depend on nothing', () => {
    expect(
      buildViolationMessage('entities', 'controller', [], 'Student.java')
    ).toBe(
      'Student (entities) depends on controller. In Clean Architecture, entities must not depend on any other Clean Architecture component.'
    );
  });

  it('uses "an" before vowels and works without a file name', () => {
    expect(
      buildViolationMessage('inputBoundary', 'entities', ['inputData'])
    ).toBe(
      'Input boundary depends on entities. In Clean Architecture, an input boundary may only depend on input data.'
    );
  });

  it('uses "a" before "use case interactor"', () => {
    expect(
      buildViolationMessage('useCaseInteractor', 'presenter', ['inputData'])
    ).toBe(
      'Use case interactor depends on presenter. In Clean Architecture, a use case interactor may only depend on input data.'
    );
  });

  it('omits the rule when the allowed list is unknown', () => {
    expect(buildViolationMessage('presenter', 'database')).toBe(
      'Presenter depends on database.'
    );
  });
});

describe('buildVerifyJsonReport', () => {
  const violation: ViolationEntry = {
    id: 'v-0',
    type: 'INCORRECT_DEPENDENCY',
    message: 'm',
    suggestion: '',
    related_node_ids: [],
    related_edge_id: 'entities->controller',
  };

  it('reports no_layout when no use cases were found', () => {
    const report = buildVerifyJsonReport('/p', []);
    expect(report).toEqual({
      schema_version: VERIFY_JSON_SCHEMA_VERSION,
      status: 'no_layout',
      project_root: '/p',
      use_cases: [],
      violations: [],
    });
  });

  it('reports clean when use cases have no violations', () => {
    const report = buildVerifyJsonReport('/p', [
      { name: 'Login', violations: [] },
    ]);
    expect(report.status).toBe('clean');
    expect(report.use_cases).toEqual(['Login']);
  });

  it('reports violations and makes ids unique across use cases', () => {
    const report = buildVerifyJsonReport('/p', [
      { name: 'Login', violations: [violation] },
      { name: 'Signup', violations: [violation] },
    ]);
    expect(report.status).toBe('violations');
    expect(report.violations.map((v) => [v.id, v.use_case])).toEqual([
      ['Login/v-0', 'Login'],
      ['Signup/v-0', 'Signup'],
    ]);
  });
});

describe('GetViolationsInteractor file_context.path and message', () => {
  const db = new SessionDBAccess();
  const fileAccess = new FileAccess();

  beforeEach(() => {
    db.resetDB();
    jest.restoreAllMocks();
    jest
      .spyOn(fileAccess, 'getFileSnippet')
      .mockResolvedValue('import entity.Student;');
    jest.spyOn(fileAccess, 'getLineNumber').mockResolvedValue(3);
  });

  it('adds a project-relative path and a populated message', async () => {
    const absPath = path.join(
      process.cwd(),
      'src',
      'interface_adapter',
      'Login',
      'LoginController.java'
    );
    db.upsertUseCase({
      id: 'uc-0',
      name: 'Login',
      outNeighbours: {} as never,
      fileKeys: ['LoginController.java'],
      violationEdges: [['controller', 'entities']],
      missingNodes: [],
    });
    db.upsertNode({
      id: `${absPath}-Login`,
      type: 'controller',
      layer: 'interfaceAdapters',
      filePath: absPath,
      status: 'VIOLATION',
    });

    const outputData = new GetViolationsOutputData();
    await new GetViolationsInteractor(
      db,
      fileAccess,
      new GetViolationsInputData('uc-0'),
      outputData,
      new CleanArchAccess()
    ).execute();

    const [v] = outputData.getOutputData() as ViolationEntry[];
    expect(v.file_context).toEqual({
      file: 'LoginController.java',
      path: 'src/interface_adapter/Login/LoginController.java',
      snippet: 'import entity.Student;',
      line_number: 3,
    });
    expect(v.message).toBe(
      'LoginController (controller) depends on entities. In Clean Architecture, a controller may only depend on input data or input boundary.'
    );
  });
});
