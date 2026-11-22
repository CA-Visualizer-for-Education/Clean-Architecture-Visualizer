import { beforeEach, describe, expect, it } from '@jest/globals';
import { SessionDbAccess } from '../../../src/data_access/sessionDBAccess.js';
import { GetFilesWithViolationsInteractor } from '../../../src/use_case/getFilesWithViolations/getFilesWithViolationsInteractor.js';
import type {
  FilesWithViolationsResponse,
  GetFilesWithViolationsOutputData,
} from '../../../src/use_case/getFilesWithViolations/getFilesWithViolationsOutputData.js';
import { RecordingOutputData } from '../doubles/recording-output-data.js';

const genericDbAccess = new SessionDbAccess();

// The Output Data classes have private fields, so the recording double needs a cast.
function makeOutputData(): GetFilesWithViolationsOutputData &
  RecordingOutputData<FilesWithViolationsResponse> {
  return new RecordingOutputData<FilesWithViolationsResponse>() as unknown as GetFilesWithViolationsOutputData &
    RecordingOutputData<FilesWithViolationsResponse>;
}

describe('GetFilesWithViolationsInteractor', () => {
  beforeEach(() => {
    genericDbAccess.resetDb();
  });

  it('returns the file paths of nodes with VIOLATION status', async () => {
    genericDbAccess.upsertNode({
      id: 'node-1',
      type: 'entities',
      layer: 'enterpriseBusinessRules',
      filePath: 'src/entities/Student.java',
      status: 'VIOLATION',
    });
    genericDbAccess.upsertNode({
      id: 'node-2',
      type: 'useCaseInteractor',
      layer: 'applicationBusinessRules',
      filePath: 'src/use_case/EnrollStudent.java',
      status: 'VIOLATION',
    });

    const outputData = makeOutputData();
    const interactor = new GetFilesWithViolationsInteractor(
      genericDbAccess,
      outputData
    );

    await interactor.execute();

    expect(outputData.result.files).toEqual(
      expect.arrayContaining([
        'src/entities/Student.java',
        'src/use_case/EnrollStudent.java',
      ])
    );
    expect(outputData.result.files).toHaveLength(2);
  });

  it('excludes nodes that are not in VIOLATION status', async () => {
    genericDbAccess.upsertNode({
      id: 'node-bad',
      type: 'controller',
      layer: 'interfaceAdapters',
      filePath: 'src/interface_adapters/BadController.java',
      status: 'VIOLATION',
    });
    genericDbAccess.upsertNode({
      id: 'node-valid',
      type: 'controller',
      layer: 'interfaceAdapters',
      filePath: 'src/interface_adapters/GoodController.java',
      status: 'VALID',
    });
    genericDbAccess.upsertNode({
      id: 'node-missing',
      type: 'presenter',
      layer: 'interfaceAdapters',
      status: 'MISSING',
    });

    const outputData = makeOutputData();
    const interactor = new GetFilesWithViolationsInteractor(
      genericDbAccess,
      outputData
    );

    await interactor.execute();

    expect(outputData.result.files).toEqual([
      'src/interface_adapters/BadController.java',
    ]);
  });

  it('deduplicates file paths when multiple violation nodes share a file', async () => {
    const filePath = 'src/use_case/EnrollStudent.java';

    genericDbAccess.upsertNode({
      id: 'node-1',
      type: 'useCaseInteractor',
      layer: 'applicationBusinessRules',
      filePath: filePath,
      status: 'VIOLATION',
    });
    genericDbAccess.upsertNode({
      id: 'node-2',
      type: 'inputBoundary',
      layer: 'applicationBusinessRules',
      filePath: filePath,
      status: 'VIOLATION',
    });

    const outputData = makeOutputData();
    const interactor = new GetFilesWithViolationsInteractor(
      genericDbAccess,
      outputData
    );

    await interactor.execute();

    expect(outputData.result.files).toEqual([filePath]);
  });

  it('filters out violation nodes that have no file path', async () => {
    genericDbAccess.upsertNode({
      id: 'node-real',
      type: 'entities',
      layer: 'enterpriseBusinessRules',
      filePath: 'src/entities/Student.java',
      status: 'VIOLATION',
    });
    genericDbAccess.upsertNode({
      id: 'node-missing',
      type: 'controller',
      layer: 'interfaceAdapters',
      status: 'VIOLATION',
    });

    const outputData = makeOutputData();
    const interactor = new GetFilesWithViolationsInteractor(
      genericDbAccess,
      outputData
    );

    await interactor.execute();

    expect(outputData.result.files).toEqual(['src/entities/Student.java']);
  });

  it('returns an empty files array when there are no violations', async () => {
    genericDbAccess.upsertNode({
      id: 'node-valid',
      type: 'controller',
      layer: 'interfaceAdapters',
      filePath: 'src/interface_adapters/GoodController.java',
      status: 'VALID',
    });

    const outputData = makeOutputData();
    const interactor = new GetFilesWithViolationsInteractor(
      genericDbAccess,
      outputData
    );

    await interactor.execute();

    expect(outputData.result.files).toEqual([]);
    expect(outputData.result.total_violations).toBe(0);
  });

  it('counts total_violations by node, not by unique file', async () => {
    const filePath = 'src/use_case/EnrollStudent.java';

    genericDbAccess.upsertNode({
      id: 'node-1',
      type: 'useCaseInteractor',
      layer: 'applicationBusinessRules',
      filePath: filePath,
      status: 'VIOLATION',
    });
    genericDbAccess.upsertNode({
      id: 'node-2',
      type: 'inputBoundary',
      layer: 'applicationBusinessRules',
      filePath: filePath,
      status: 'VIOLATION',
    });
    genericDbAccess.upsertNode({
      id: 'node-3',
      type: 'controller',
      layer: 'interfaceAdapters',
      status: 'VIOLATION',
    });

    const outputData = makeOutputData();
    const interactor = new GetFilesWithViolationsInteractor(
      genericDbAccess,
      outputData
    );

    await interactor.execute();

    expect(outputData.result.total_violations).toBe(3);
    expect(outputData.result.files).toHaveLength(1);
  });
});
