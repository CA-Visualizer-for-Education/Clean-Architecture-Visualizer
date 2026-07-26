import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { GetViolationsInteractor } from '../../../src/use_case/getViolations/GetViolationsInteractor.js';
import { SessionDBAccess } from '../../../src/data_access/sessionDBAccess.js';
import { FileAccess } from '../../../src/data_access/fileAccess.js';
import type { GetViolationsInputData } from '../../../src/use_case/getViolations/GetViolationsInputData.js';
import type { GetViolationsOutputData } from '../../../src/use_case/getViolations/GetViolationsOutputData.js';

const genericDBAccess = new SessionDBAccess();
const genericFileAccess = new FileAccess();

function makeInputData(interactionId: string): GetViolationsInputData {
  return {
    getInteractionId: () => interactionId,
  } as unknown as GetViolationsInputData;
}

function makeOutputData(): GetViolationsOutputData & { result: any } {
  return {
    result: undefined,
    setOutputData(data: any) {
      this.result = data;
    },
    getOutputData() {
      return this.result;
    },
  } as GetViolationsOutputData & { result: any };
}

describe('GetViolationsInteractor', () => {
  beforeEach(() => {
    genericDBAccess.resetDB();
    jest.restoreAllMocks();

    // Default mocks for FileAccess
    jest
      .spyOn(genericFileAccess, 'getFileSnippet')
      .mockResolvedValue(undefined);
    jest.spyOn(genericFileAccess, 'getLineNumber').mockResolvedValue(undefined);
  });

  it('returns undefined and does not set output if use case is not found', async () => {
    const outputData = makeOutputData();
    const interactor = new GetViolationsInteractor(
      genericDBAccess,
      genericFileAccess,
      makeInputData('invalid-id'),
      outputData
    );

    await interactor.execute();

    expect(outputData.result).toBeUndefined();
  });

  describe('execute — Violation Mapping', () => {
    const fromNode = 'controller';
    const toNode = 'entities';
    const filePath = 'src/interface_adapters/uc-1/UserController.java';

    beforeEach(() => {
      // Setup a node that belongs to the "from" side of the violation
      genericDBAccess.upsertNode({
        id: 'src/interface_adapters/uc-1/UserController.java-Process User',
        type: fromNode,
        layer: 'interfaceAdapters',
        filePath: filePath,
        status: 'VALID',
      });

      genericDBAccess.upsertNode({
        id: 'src/interface_adapters/uc-1/User2Controller.java-Process User',
        type: fromNode,
        layer: 'interfaceAdapters',
        filePath: 'src/interface_adapters/uc-1/User2Controller.java',
        status: 'VALID',
      });

      // Setup the use case with a violation edge
      const mockUseCase = {
        id: 'uc-1',
        name: 'Process User',
        fileKeys: [
          filePath,
          'src/interface_adapters/uc-1/User2Controller.java',
        ],
        violationEdges: [[fromNode, toNode]] as [string, string][],
      };
      (genericDBAccess as any).upsertUseCase(mockUseCase);
    });

    it('correctly resolves related node IDs', async () => {
      const outputData = makeOutputData();
      const interactor = new GetViolationsInteractor(
        genericDBAccess,
        genericFileAccess,
        makeInputData('uc-1'),
        outputData
      );

      await interactor.execute();

      const violation = outputData.result[0];
      expect(violation.related_node_ids).toContain(
        'src/interface_adapters/uc-1/UserController.java-Process User'
      );
      expect(violation.related_edge_id).toBe(`${fromNode}->${toNode}`);
    });

    it('populates file context with snippets and line numbers from FileAccess', async () => {
      const mockSnippet = 'import entities.User;';
      const mockLine = 5;

      jest
        .spyOn(genericFileAccess, 'getFileSnippet')
        .mockResolvedValue(mockSnippet);
      jest
        .spyOn(genericFileAccess, 'getLineNumber')
        .mockResolvedValue(mockLine);

      const outputData = makeOutputData();
      const interactor = new GetViolationsInteractor(
        genericDBAccess,
        genericFileAccess,
        makeInputData('uc-1'),
        outputData
      );

      await interactor.execute();

      const context = outputData.result[0].file_context;
      expect(context.file).toBe('UserController.java');
      expect(context.snippet).toBe(mockSnippet);
      expect(context.line_number).toBe(mockLine);
    });

    it('populates file context with snippets and line numbers from FileAccess when first node is invalid', async () => {
      const mockSnippet = 'import entity1.java;';
      const mockLine = 5;

      jest
        .spyOn(genericFileAccess, 'getFileSnippet')
        .mockImplementation(async (filePath, _) => {
          if (filePath.includes('UserController.java')) {
            return undefined;
          }
          return mockSnippet;
        });
      jest
        .spyOn(genericFileAccess, 'getLineNumber')
        .mockImplementation(async (filePath, _) => {
          if (filePath.includes('UserController.java')) {
            return undefined;
          }
          return mockLine;
        });

      const outputData = makeOutputData();
      const interactor = new GetViolationsInteractor(
        genericDBAccess,
        genericFileAccess,
        makeInputData('uc-1'),
        outputData
      );

      await interactor.execute();
      const context = outputData.result[0].file_context;
      expect(context.file).toBe('User2Controller.java');
      expect(context.snippet).toBe(mockSnippet);
      expect(context.line_number).toBe(mockLine);
    });

    it('handles missing file context gracefully if no matching node exists', async () => {
      // Reset DB and add use case without matching nodes
      genericDBAccess.resetDB();
      (genericDBAccess as any).upsertUseCase({
        id: 'uc-empty',
        fileKeys: ['some/path.java'],
        violationEdges: [['A', 'B']],
      });

      const outputData = makeOutputData();
      const interactor = new GetViolationsInteractor(
        genericDBAccess,
        genericFileAccess,
        makeInputData('uc-empty'),
        outputData
      );

      await interactor.execute();

      expect(outputData.result[0].file_context).toBeUndefined();
    });
  });
});

describe('execute — Violation Mapping for differently formatted file path.', () => {
  const fromNode = 'controller';
  const toNode = 'entities';
  const filePath = 'src/interface_adapters/User-Controller.java';

  beforeEach(() => {
    genericDBAccess.upsertNode({
      // node id's are file paths since they are unique
      id: 'src/interface_adapters/uc-1/User-Controller.java-Process User',
      type: fromNode,
      layer: 'interfaceAdapters',
      filePath: filePath,
      status: 'VALID',
    });

    // Setup the use case with a violation edge
    const mockUseCase = {
      id: 'uc-1',
      name: 'Process User',
      fileKeys: ['User-Controller.java'],
      violationEdges: [[fromNode, toNode]] as [string, string][],
    };
    (genericDBAccess as any).upsertUseCase(mockUseCase);
  });

  it('correctly resolves related node IDs where fileKeys stores names of files', async () => {
    const outputData = makeOutputData();
    const interactor = new GetViolationsInteractor(
      genericDBAccess,
      genericFileAccess,
      makeInputData('uc-1'),
      outputData
    );

    await interactor.execute();

    const violation = outputData.result[0];
    expect(violation.related_node_ids).toContain(
      'src/interface_adapters/uc-1/User-Controller.java-Process User'
    );
    expect(violation.related_edge_id).toBe(`${fromNode}->${toNode}`);
  });
});

describe('findNodeContainsUseCase - Ensures function only checks the last characters of a node id for use case', () => {
  const fromNode = 'controller';
  const toNode = 'entities';
  const filePath = 'src/interface_adapters/User-Controller.java';

  beforeEach(() => {
    genericDBAccess.upsertNode({
      // node id's are file paths since they are unique
      id: 'src/interface_adapters/uc-1/User-Controller.java-Process User',
      type: fromNode,
      layer: 'interfaceAdapters',
      filePath: filePath,
      status: 'VALID',
    });

    // Setup the use case with a violation edge
    const mockUseCase = {
      id: 'uc-1',
      name: 'Process User',
      fileKeys: ['User-Controller.java'],
      violationEdges: [[fromNode, toNode]] as [string, string][],
    };
    (genericDBAccess as any).upsertUseCase(mockUseCase);
  });

  it('Ensures that string is not part of use case if id is shorter than the string.', () => {
    const outputData = makeOutputData();
    const interactor = new GetViolationsInteractor(
      genericDBAccess,
      genericFileAccess,
      makeInputData('uc-1'),
      outputData
    );

    const result = (interactor as any).findNodeContainsUseCase(
      'blah',
      'Process User'
    );
    expect(result).toBe(false);
  });

  it('Ensures that string is part of use case if the end of id matches the use case name.', () => {
    const outputData = makeOutputData();
    const interactor = new GetViolationsInteractor(
      genericDBAccess,
      genericFileAccess,
      makeInputData('uc-1'),
      outputData
    );

    const result = (interactor as any).findNodeContainsUseCase(
      'src/interface_adapters/uc-1/User-Controller.java-Process User',
      'Process User'
    );
    expect(result).toBe(true);
  });

  it('Ensures that string is not part of use case if the end of id does not match the use case name.', () => {
    const outputData = makeOutputData();
    const interactor = new GetViolationsInteractor(
      genericDBAccess,
      genericFileAccess,
      makeInputData('uc-1'),
      outputData
    );

    const result = (interactor as any).findNodeContainsUseCase(
      'src/interface_adapters/uc-1/User-Controller.java-usecase1',
      'Process User'
    );
    expect(result).toBe(false);
  });

  it('Ensures that string is not part of use case if the end of id does not match the use case name even if string contains use case name.', () => {
    const outputData = makeOutputData();
    const interactor = new GetViolationsInteractor(
      genericDBAccess,
      genericFileAccess,
      makeInputData('uc-1'),
      outputData
    );

    const result = (interactor as any).findNodeContainsUseCase(
      'src/interface_adapters/uc-1/User-Controller-Process User.java-usecase1',
      'Process User'
    );
    expect(result).toBe(false);
  });
});
