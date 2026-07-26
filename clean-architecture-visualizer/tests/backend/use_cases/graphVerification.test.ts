import {
  describe,
  it,
  expect,
  afterEach,
  jest,
  beforeEach,
} from '@jest/globals';
import { GraphVerificationInteractor } from '../../../src/use_case/graphVerification/graphVerificationInteractor.js';
import { GraphVerificationPresenter } from '../../../src/interface_adapter/graphVerification/graphVerificationPresenter.js';
import { FileAccess } from '../../../src/data_access/fileAccess.js';
import type { FileAccessInterface } from '../../../src/data_access/fileAccessInterface.js';
import { CleanArchAccess } from '../../../src/data_access/cleanArchInfoAccess.js';
import { SessionDBAccess } from '../../../src/data_access/sessionDBAccess.js';

import { useCaseGraph } from '../../../src/entity/useCaseGraph.js';
import type { cleanNode } from '../../../src/types/cleanNode.ts';

const genericFileAccess = new FileAccess();
const genericNeighbourAccess = new CleanArchAccess();
const genericDBAccess = new SessionDBAccess();
const presenter = new GraphVerificationPresenter();

function makeUseCaseGraphs(types: string[]): useCaseGraph[] {
  let useCaseGraphs: useCaseGraph[] = [];
  types.forEach((type) => {
    switch (type) {
      case 'empty':
        useCaseGraphs.push(new useCaseGraph('empty'));
        break;
      case 'good':
        const goodUseCase = new useCaseGraph('good');
        goodUseCase.setNodeNeighbour('useCaseInteractor', 'entities');
        goodUseCase.setNodeNeighbour('dataAccess', 'database');
        goodUseCase.setNodeNeighbour('view', 'viewModel');
        goodUseCase.setNodeNeighbour('view', 'controller');
        useCaseGraphs.push(goodUseCase);
        break;
      case 'single':
        const singleViolation = new useCaseGraph('single');
        singleViolation.addFile('view', 'root/src/views/view.java');
        singleViolation.addFile('viewModel', 'root/src/views/viewModel.java');
        singleViolation.addFile('entity', 'root/src/entity/entity.java');
        singleViolation.setNodeNeighbour('view', 'viewModel');
        singleViolation.setNodeNeighbour('view', 'entities');
        useCaseGraphs.push(singleViolation);
        break;
      case 'multiple':
        const multipleViolations = new useCaseGraph('multiple');
        multipleViolations.setNodeNeighbour('entities', 'view');
        multipleViolations.setNodeNeighbour('controller', 'entities');
        useCaseGraphs.push(multipleViolations);
        break;
    }
  });
  return useCaseGraphs;
}

describe('Ensures that resolveLayer correctly identifies layers from their file path', () => {
  const genericInteractor = new GraphVerificationInteractor(
    genericFileAccess,
    genericNeighbourAccess,
    genericDBAccess,
    presenter
  );

  const testCases: [string, string][] = [
    ['frameworksAndDrivers', '/src/views/test/testView.ts'],
    ['interfaceAdapters', '/src/views/test/testViewModel.ts'],
    ['frameworksAndDrivers', '/src/database/test/testDatabase.ts'],
    ['enterpriseBusinessRules', '/src/entity/test/testEntities.ts'],
    [
      'applicationBusinessRules',
      '/src/data_access/test/testAccessInterface.ts',
    ],
    ['frameworksAndDrivers', '/src/data_access/test/testAccess.ts'],
    ['interfaceAdapters', '/src/interface_adapters/test/testController.ts'],
    ['interfaceAdapters', '/src/interface_adapters/test/testPresenter.ts'],
    ['applicationBusinessRules', '/src/use_case/test/testInputBoundary.ts'],
    ['applicationBusinessRules', '/src/use_case/test/testInputData.ts'],
    ['applicationBusinessRules', '/src/use_case/test/testOutputBoundary.ts'],
    ['applicationBusinessRules', '/src/use_case/test/testOutputData.ts'],
    ['applicationBusinessRules', '/src/use_case/test/testInteractor.ts'],
  ];

  it.each(testCases)("resolves '%s' from path '%s'", (expectedLayer, path) => {
    const result = (genericInteractor as any).resolveLayer(path);
    expect(result).toBe(expectedLayer);
  });

  it.each(['/src/types/testTypes.ts', '/src/.gitkeep'])(
    'returns undefined from the path %s',
    (path) => {
      const result = (genericInteractor as any).resolveLayer(path);
      expect(result).toBeUndefined();
    }
  );
});

describe('Ensures that resolveLayer correctly identifies layers from their file path, snake_case', () => {
  const genericInteractor = new GraphVerificationInteractor(
    genericFileAccess,
    genericNeighbourAccess,
    genericDBAccess,
    presenter
  );

  const testCases: [string, string][] = [
    ['frameworksAndDrivers', '/src/views/test/test_view.ts'],
    ['interfaceAdapters', '/src/views/test/test_view_model.ts'],
    ['frameworksAndDrivers', '/src/database/test/test_database.ts'],
    ['enterpriseBusinessRules', '/src/entity/test/test_entities.ts'],
    [
      'applicationBusinessRules',
      '/src/data_access/test/test_access_interface.ts',
    ],
    ['frameworksAndDrivers', '/src/data_access/test/test_access.ts'],
    ['interfaceAdapters', '/src/interface_adapters/test/test_controller.ts'],
    ['interfaceAdapters', '/src/interface_adapters/test/test_presenter.ts'],
    ['applicationBusinessRules', '/src/use_case/test/test_input_boundary.ts'],
    ['applicationBusinessRules', '/src/use_case/test/test_input_data.ts'],
    ['applicationBusinessRules', '/src/use_case/test/test_output_boundary.ts'],
    ['applicationBusinessRules', '/src/use_case/test/test_output_data.ts'],
    ['applicationBusinessRules', '/src/use_case/test/test_interactor.ts'],
  ];

  it.each(testCases)("resolves '%s' from path '%s'", (expectedLayer, path) => {
    const result = (genericInteractor as any).resolveLayer(path);
    expect(result).toBe(expectedLayer);
  });

  it.each(['/src/types/testTypes.ts', '/src/.gitkeep'])(
    'returns undefined from the path %s',
    (path) => {
      const result = (genericInteractor as any).resolveLayer(path);
      expect(result).toBeUndefined();
    }
  );
});

describe('Ensures that verifyOutNeighbours correctly classifies the number of Clean violations', () => {
  function getAllViolations(graphs: useCaseGraph[]): number {
    let result = 0;
    graphs.forEach((element) => {
      result += element.getViolationCount();
    });
    return result;
  }

  const testCases = [
    ['Empty usecase has 0 violations', makeUseCaseGraphs(['empty']), 0],
    [
      'Use case with no violations reports 0 violations',
      makeUseCaseGraphs(['good']),
      0,
    ],
    [
      'Use case with 1 violation reports 1 violation',
      makeUseCaseGraphs(['single']),
      1,
    ],
    [
      'Use case with 2 violations reports 2 violations',
      makeUseCaseGraphs(['multiple']),
      2,
    ],
    [
      'Multiple usecases with violations are properly reported',
      makeUseCaseGraphs(['single', 'multiple']),
      3,
    ],
    [
      'Only use cases with violations report violations',
      makeUseCaseGraphs(['empty', 'good', 'single', 'multiple']),
      3,
    ],
  ];

  it.each(testCases)('%s', async (_, useCaseGraphList, expectedViolations) => {
    const interactor = new GraphVerificationInteractor(
      genericFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter,
      useCaseGraphList as useCaseGraph[]
    );
    await (interactor as any).verifyOutNeighbours();
    const violationCount = getAllViolations(
      (interactor as any).useCaseGraphList
    );
    expect(violationCount).toBe(expectedViolations);
  });
});

describe('Ensures that populateDatabase correctly populates the database', () => {
  describe('use case and violation counts', () => {
    const testCases: [string, useCaseGraph[], number, number][] = [
      ['Empty use case list sets 0 use cases and 0 violations', [], 0, 0],
      [
        'Single use case with no violations',
        makeUseCaseGraphs(['empty']),
        1,
        0,
      ],
      ['Single use case with 1 violation', makeUseCaseGraphs(['single']), 1, 1],
      [
        'Multiple use cases with violations are summed correctly',
        makeUseCaseGraphs(['single', 'multiple']),
        2,
        3,
      ],
    ];

    it.each(testCases)(
      '%s',
      async (_, useCaseGraphList, expectedUseCases, expectedViolations) => {
        const dbAccess = new SessionDBAccess();
        const interactor = new GraphVerificationInteractor(
          genericFileAccess,
          genericNeighbourAccess,
          dbAccess,
          presenter,
          useCaseGraphList
        );
        await (interactor as any).verifyOutNeighbours();
        await (interactor as any).populateDatabase();

        expect(dbAccess.getNumUseCases()).toBe(expectedUseCases);
        expect(dbAccess.getNumViolations()).toBe(expectedViolations);
      }
    );
  });

  describe('use cases are stored correctly', () => {
    it('stores all use cases with correct ids and names', async () => {
      const dbAccess = new SessionDBAccess();
      const interactor = new GraphVerificationInteractor(
        genericFileAccess,
        genericNeighbourAccess,
        dbAccess,
        presenter,
        makeUseCaseGraphs(['empty', 'single'])
      );
      await (interactor as any).populateDatabase();

      const uc0 = dbAccess.getUseCaseById('uc-0');
      const uc1 = dbAccess.getUseCaseById('uc-1');

      expect(uc0?.name).toBe('empty');
      expect(uc1?.name).toBe('single');
    });

    it('stores violation edges on the correct use case', async () => {
      const dbAccess = new SessionDBAccess();
      const interactor = new GraphVerificationInteractor(
        genericFileAccess,
        genericNeighbourAccess,
        dbAccess,
        presenter,
        makeUseCaseGraphs(['single'])
      );
      await (interactor as any).verifyOutNeighbours();
      await (interactor as any).populateDatabase();

      const uc = dbAccess.getUseCaseById('uc-0');
      expect(uc?.violationEdges).toContainEqual(['view', 'entities']);
    });
  });

  describe('edges are stored correctly', () => {
    it('stores VALID edges from use case neighbour maps', async () => {
      const dbAccess = new SessionDBAccess();
      const interactor = new GraphVerificationInteractor(
        genericFileAccess,
        genericNeighbourAccess,
        dbAccess,
        presenter,
        makeUseCaseGraphs(['empty'])
      );
      await (interactor as any).verifyOutNeighbours();
      await (interactor as any).populateDatabase();

      // emptyUseCase has no neighbours so edges should be empty
      expect(dbAccess.getAllEdges()).toHaveLength(0);
    });

    it('marks violation edges as INCORRECT_DEPENDENCY', async () => {
      const dbAccess = new SessionDBAccess();
      const interactor = new GraphVerificationInteractor(
        genericFileAccess,
        genericNeighbourAccess,
        dbAccess,
        presenter,
        makeUseCaseGraphs(['single'])
      );
      await (interactor as any).verifyOutNeighbours();
      await (interactor as any).populateDatabase();

      const violationEdge = dbAccess.getEdgeById('view->entities');
      expect(violationEdge?.status).toBe('INCORRECT_DEPENDENCY');
    });

    it('marks non-violation edges as VALID', async () => {
      const dbAccess = new SessionDBAccess();
      const uc = new useCaseGraph('valid');
      uc.setNodeNeighbour('view', 'viewModel');

      const interactor = new GraphVerificationInteractor(
        genericFileAccess,
        genericNeighbourAccess,
        dbAccess,
        presenter,
        [uc]
      );
      await (interactor as any).verifyOutNeighbours();
      await (interactor as any).populateDatabase();

      const validEdge = dbAccess.getEdgeById('view->viewModel');
      expect(validEdge?.status).toBe('VALID');
    });

    it('deduplicates edges across use cases', async () => {
      const dbAccess = new SessionDBAccess();
      const uc1 = new useCaseGraph('uc1');
      const uc2 = new useCaseGraph('uc2');
      uc1.setNodeNeighbour('view', 'viewModel');
      uc2.setNodeNeighbour('view', 'viewModel');

      const interactor = new GraphVerificationInteractor(
        genericFileAccess,
        genericNeighbourAccess,
        dbAccess,
        presenter,
        [uc1, uc2]
      );
      await (interactor as any).populateDatabase();

      const edges = dbAccess
        .getEdgesBySource('view')
        .filter((e) => e.target === 'viewModel');
      expect(edges).toHaveLength(1);
    });
  });

  describe('nodes are stored correctly', () => {
    it('marks nodes involved in violations as VIOLATION', async () => {
      const dbAccess = new SessionDBAccess();
      const interactor = new GraphVerificationInteractor(
        genericFileAccess,
        genericNeighbourAccess,
        dbAccess,
        presenter,
        makeUseCaseGraphs(['single'])
      );
      await (interactor as any).verifyOutNeighbours();
      await (interactor as any).populateDatabase();

      const violationNodes = dbAccess.getNodesByStatus('VIOLATION');
      const nodeTypes = violationNodes.map((n) => n.type);
      expect(nodeTypes).toContain('view');
      expect(nodeTypes).toContain('entities');
    });

    it('marks missing nodes as MISSING', async () => {
      const dbAccess = new SessionDBAccess();
      const uc = new useCaseGraph('sparse');
      uc.setNodeNeighbour('view', 'viewModel'); // only two nodes present

      const interactor = new GraphVerificationInteractor(
        genericFileAccess,
        genericNeighbourAccess,
        dbAccess,
        presenter,
        [uc]
      );
      await (interactor as any).populateDatabase();

      const missingNodes = dbAccess.getNodesByStatus('MISSING');
      expect(missingNodes.length).toBeGreaterThan(0);
    });
  });
});

/*
 * Mock FileAccess class used to make files with fake imports rather than looking at real project files.
 */
class MockFileAccess implements FileAccessInterface {
  // Used to set the return value of getFileImports for specfic file paths.
  contents: Map<string, string[]>;
  internalFilePaths: Map<string, string>;

  constructor(
    map: Map<string, string[]>,
    internalFilePaths: Map<string, string>
  ) {
    this.contents = map;
    this.internalFilePaths = internalFilePaths;
  }
  async getUseCases(): Promise<string[]> {
    return [];
  }
  async getFilePaths(node: string, paths: Map<string, string>): Promise<void> {
    if (node === 'use_case') {
      this.internalFilePaths.forEach((path, fileName) => {
        paths.set(fileName, path);
      });
    }
  }
  async getFileImports(path: string): Promise<string[]> {
    return this.contents.get(path) || [];
  }
  async getProjectName(): Promise<string> {
    return 'MockProject';
  }
  async getFileContent(path: string): Promise<string> {
    return '';
  }
  async getFileSnippet(
    filePath: string,
    target?: string
  ): Promise<string | undefined> {
    return undefined;
  }
  async getLineNumber(
    filePath: string,
    target: string
  ): Promise<number | undefined> {
    return undefined;
  }
  async createDirectory(filePath: string): Promise<void> {
    return;
  }
  async getCurrentPath(): Promise<string> {
    return '/mock/path';
  }
  async bfsFindDir(curr: string, target: string): Promise<string | null> {
    return null;
  }
  async exists(path: string): Promise<boolean> {
    return false;
  }
  async createFile(filePath: string, content: string = ''): Promise<void> {
    return;
  }
}

describe('Imports across use cases are caught and seperate from normal violations', () => {
  const fileMockContents = new Map<string, string[]>();
  const fileMockPaths = new Map<string, string>();

  const externalInOrder: useCaseGraph[] = [];
  const firstUseCase = new useCaseGraph('first');
  firstUseCase.addFile('firstInteractor', '/mock/path/firstInteractor.ts');
  firstUseCase.addFile('firstOutputData', '/mock/path/firstOutputData.ts');
  externalInOrder.push(firstUseCase);

  const secondUseCase = new useCaseGraph('second');
  secondUseCase.addFile('secondInteractor', '/mock/path/secondInteractor.ts');
  secondUseCase.addFile('secondOutputData', '/mock/path/secondOutputData.ts');
  externalInOrder.push(secondUseCase);

  fileMockContents.set('/mock/path/firstInteractor.ts', [
    '/mock/path/firstOutputData.ts',
  ]);
  fileMockContents.set('/mock/path/secondInteractor.ts', [
    '/mock/path/secondOutputData.ts',
    '/mock/path/firstOutputData.ts',
  ]);

  //This implementation needs to use distinct use case names for the MockFileAccess contents to not overlap
  //  One potential fix could be to re-make the contents in the it.each testing block
  //  but this is an easier implementation, and will work for fewer test cases.
  const externalOutOfOrder: useCaseGraph[] = [];
  const thirdUseCase = new useCaseGraph('third');
  thirdUseCase.addFile('thirdInteractor', '/mock/path/thirdInteractor.ts');
  thirdUseCase.addFile('thirdOutputData', '/mock/path/thirdOutputData.ts');
  externalOutOfOrder.push(thirdUseCase);

  const fourthUseCase = new useCaseGraph('fourth');
  fourthUseCase.addFile('fourthInteractor', '/mock/path/fourthInteractor.ts');
  fourthUseCase.addFile('fourthOutputData', '/mock/path/fourthOutputData.ts');
  externalOutOfOrder.push(fourthUseCase);

  fileMockContents.set('/mock/path/thirdInteractor.ts', [
    '/mock/path/thirdOutputData.ts',
  ]);
  fileMockContents.set('/mock/path/fourthInteractor.ts', [
    '/mock/path/fourthOutputData.ts',
  ]);
  fileMockContents.set('/mock/path/fourthOutputData.ts', [
    '/mock/path/thirdInteractor.ts',
  ]);

  const normalViolation: useCaseGraph[] = [];
  const normalUseCase = new useCaseGraph('normal');
  normalUseCase.addFile('normalInteractor', '/mock/path/normalInteractor.ts');
  normalUseCase.addFile('normalOutputData', '/mock/path/normalOutputData.ts');
  normalViolation.push(normalUseCase);

  fileMockContents.set('/mock/path/normalOutputData.ts', [
    '/mock/path/normalInteractor.ts',
  ]);

  const testCaseGraphs = [externalInOrder, externalOutOfOrder, normalViolation];
  testCaseGraphs.forEach((graphList) => {
    graphList.forEach((uc) => {
      uc.getFiles().forEach((path, name) => {
        fileMockPaths.set(name, path);
      });
    });
  });

  const testCases: [
    string,
    useCaseGraph[],
    Array<[[cleanNode, cleanNode]] | []>,
  ][] = [
    [
      'Cross use case imports are violations even if otherwise CA valid',
      externalInOrder,
      [[], [['useCaseInteractor', 'outputData']]],
    ],
    [
      'Cross use case imports are violations tracked when not CA valid',
      externalOutOfOrder,
      [[], [['outputData', 'useCaseInteractor']]],
    ],
    [
      'Imports within the same use case are not tracked as cross use case violations',
      normalViolation,
      [[]],
    ],
  ];
  it.each(testCases)('%s', async (_, useCaseGraphList, expectedViolations) => {
    const mockFileAccess = new MockFileAccess(fileMockContents, fileMockPaths);
    const dbAccess = new SessionDBAccess();
    const presenter = new GraphVerificationPresenter();
    const interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      dbAccess,
      presenter,
      useCaseGraphList as useCaseGraph[]
    );
    await (interactor as any).buildFilePaths();
    await (interactor as any).developOutNeighbours();
    const crossUseCaseEdges = interactor.getCrossUseCaseEdges();
    expect(crossUseCaseEdges).toEqual(expectedViolations);
  });
});

function buildFiles(files: string[], paths: Map<string, string>): void {
  for (const file of files) {
    paths.set(file.split('/').at(-1) as string, file);
  }
}

describe('Ensures buildFilePaths returns all files in correct maps.', () => {
  let mockFileAccess: jest.Mocked<FileAccessInterface>;
  beforeEach(() => {
    mockFileAccess = {
      getCurrentPath: jest.fn<any>(),
      bfsFindDir: jest.fn<any>(),
      exists: jest.fn<any>(),
      createDirectory: jest.fn<any>(),
      createFile: jest.fn<any>(),
      getFilePaths: jest.fn<any>(),
    } as any;
  });
  it('Collects all files when packaged by module.', async () => {
    mockFileAccess.bfsFindDir.mockResolvedValueOnce('root/src/features');
    mockFileAccess.getFilePaths
      .mockImplementationOnce(async (_, map) =>
        buildFiles(
          [
            'root/src/features/feature1/usecase1/use_case/usecase1InputData.java',
            'root/src/features/feature1/usecase1/interface_adapter/usecase1Controller.java',
          ],
          map
        )
      )
      .mockImplementationOnce(async (_, map) =>
        buildFiles(['root/src/entity/entity.java'], map)
      )
      .mockImplementationOnce(async (_, map) => buildFiles([], map))
      .mockImplementationOnce(async (_, map) =>
        buildFiles(['root/src/data_access/data_access.java'], map)
      )
      .mockImplementationOnce(async (_, map) => buildFiles([], map));
    let expectedInternalMap = new Map<string, string>();
    expectedInternalMap.set(
      'usecase1Controller.java',
      'root/src/features/feature1/usecase1/interface_adapter/usecase1Controller.java'
    );
    expectedInternalMap.set(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputData.java'
    );

    let expectedExternalMap = new Map<string, string>();
    expectedExternalMap.set('entity.java', 'root/src/entity/entity.java');
    expectedExternalMap.set(
      'data_access.java',
      'root/src/data_access/data_access.java'
    );

    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );
    await (interactor as any).buildFilePaths();
    expect((interactor as any).internalFilePaths).toEqual(expectedInternalMap);
    expect((interactor as any).externalFilePaths).toEqual(expectedExternalMap);
  });

  it('Collects all files when packaged by layer.', async () => {
    mockFileAccess.bfsFindDir.mockResolvedValueOnce(null);
    mockFileAccess.getFilePaths
      .mockImplementationOnce(async (_, map) =>
        buildFiles(
          [
            'root/src/use_case/usecase1/usecase1InputData.java',
            'root/src/use_case/usecase2/usecase2InputData.java',
            'root/src/use_case/usecase2/usecase2OutputBoundary.java',
            'root/src/use_case/usecase2/usecase2OutputData.java',
            'root/src/use_case/usecase2/usecase2Interactor.java',
          ],
          map
        )
      )
      .mockImplementationOnce(async (_, map) =>
        buildFiles(
          [
            'root/src/interface_adapter/usecase1/usecase1Controller.java',
            'root/src/interface_adapter/usecase2/usecase2Presenter.java',
          ],
          map
        )
      )
      .mockImplementationOnce(async (_, map) =>
        buildFiles(['root/src/entity/entity.java'], map)
      )
      .mockImplementationOnce(async (_, map) =>
        buildFiles(['root/src/views/view.java'], map)
      )
      .mockImplementationOnce(async (_, map) =>
        buildFiles(['root/src/data_access/data_access.java'], map)
      )
      .mockImplementationOnce(async (_, map) =>
        buildFiles(['root/src/database.java'], map)
      );
    let expectedInternalMap = new Map<string, string>();
    expectedInternalMap.set(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );
    expectedInternalMap.set(
      'usecase2InputData.java',
      'root/src/use_case/usecase2/usecase2InputData.java'
    );
    expectedInternalMap.set(
      'usecase2OutputBoundary.java',
      'root/src/use_case/usecase2/usecase2OutputBoundary.java'
    );
    expectedInternalMap.set(
      'usecase2OutputData.java',
      'root/src/use_case/usecase2/usecase2OutputData.java'
    );
    expectedInternalMap.set(
      'usecase2Interactor.java',
      'root/src/use_case/usecase2/usecase2Interactor.java'
    );
    expectedInternalMap.set(
      'usecase1Controller.java',
      'root/src/interface_adapter/usecase1/usecase1Controller.java'
    );
    expectedInternalMap.set(
      'usecase2Presenter.java',
      'root/src/interface_adapter/usecase2/usecase2Presenter.java'
    );

    let expectedExternalMap = new Map<string, string>();
    expectedExternalMap.set('entity.java', 'root/src/entity/entity.java');
    expectedExternalMap.set(
      'data_access.java',
      'root/src/data_access/data_access.java'
    );
    expectedExternalMap.set('database.java', 'root/src/database.java');
    expectedExternalMap.set('view.java', 'root/src/views/view.java');

    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );
    await (interactor as any).buildFilePaths();
    expect((interactor as any).internalFilePaths).toEqual(expectedInternalMap);
    expect((interactor as any).externalFilePaths).toEqual(expectedExternalMap);
  });
});

describe('Ensures developOutNeighbours maps the files to all of the use cases they belong to.', () => {
  let mockFileAccess: jest.Mocked<FileAccessInterface>;
  beforeEach(() => {
    mockFileAccess = {
      getCurrentPath: jest.fn<any>(),
      bfsFindDir: jest.fn<any>(),
      exists: jest.fn<any>(),
      createDirectory: jest.fn<any>(),
      createFile: jest.fn<any>(),
      getFilePaths: jest.fn<any>(),
      getFileImports: jest.fn<any>(),
    } as any;
  });

  it('Assigns imports of external use case files to the correct use case when packaging by layer.', async () => {
    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );

    const fileMap = new Map<string, string>();
    fileMap.set('dataAccess1.java', 'root/src/data_access/dataAccess1.java');
    fileMap.set('entity1.java', 'root/src/entity/entity1.java');
    fileMap.set(
      'dataAccessInterface1.java',
      'root/src/data_access/dataAccessInterface1.java'
    );
    fileMap.set('view1.java', 'root/src/views/view1.java');
    fileMap.set('viewModel1.java', 'root/src/views/viewModel1.java');
    fileMap.set('database1.java', 'root/src/database/database1.java');
    for (const [fileName, filePath] of fileMap) {
      (interactor as any).externalFilePaths.set(fileName, filePath);
    }
    fileMap.set(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );

    (interactor as any).internalFilePaths.set(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );
    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase1'));
    (interactor as any).useCaseGraphList[0].addFile(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );

    mockFileAccess.getFileImports
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => ['entity1.java;'])
      .mockImplementationOnce(async (_) => ['usecase1InputData.java;'])
      .mockImplementationOnce(async (_) => ['dataAccess1.java;'])
      .mockImplementationOnce(async (_) => ['dataAccessInterface1.java;'])
      .mockImplementationOnce(async (_) => ['view1.java;'])
      .mockImplementationOnce(async (_) => ['viewModel1.java;']);

    await (interactor as any).developOutNeighbours();
    const expectedFiles = [
      'entity1.java',
      'usecase1InputData.java',
      'dataAccess1.java',
      'dataAccessInterface1.java',
      'view1.java',
      'viewModel1.java',
    ];
    for (const fileName of expectedFiles) {
      expect((interactor as any).useCaseGraphList[0].getFiles().has(fileName));
    }
    expect(
      (interactor as any).useCaseGraphList[0]
        .getFiles()
        .has('usecase1InputData.java')
    );
    await (interactor as any).verifyOutNeighbours();
    const expectedNeighbours = [
      ['entities', 'inputData'],
      ['dataAccess', 'entities'],
      ['dataAccessInterface', 'dataAccess'],
      ['view', 'dataAccessInterface'],
      ['viewModel', 'view'],
      ['database', 'viewModel'],
    ];
    for (const [from, to] of expectedNeighbours) {
      expect(
        (interactor as any).useCaseGraphList[0]
          .getNodeNeighbours(from)
          .includes(to)
      );
    }

    const fileStorage = (interactor as any).buildFileStorageList(fileMap);
    const nodeStorage = (interactor as any).buildNodeStorageList(fileStorage);

    for (const [_, filePath] of fileMap) {
      expect(nodeStorage).toContainEqual({
        id: `${filePath}-usecase1`,
        filePath: filePath,
        type: (interactor as any).resolveNode(filePath),
        layer: (interactor as any).resolveLayer(filePath),
        status: 'VIOLATION',
      });
    }
    const missingNodes = [
      'controller',
      'presenter',
      'inputBoundary',
      'outputBoundary',
      'outputData',
      'useCaseInteractor',
    ];
    for (const node of missingNodes) {
      expect(
        (interactor as any).useCaseGraphList[0].getMissingNodes().includes(node)
      );
    }
  });

  it('Assigns imports of external use case files to the correct use case when packaging by component.', async () => {
    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );

    const fileMap = new Map<string, string>();
    fileMap.set('dataAccess1.java', 'root/src/data_access/dataAccess1.java');
    fileMap.set('entity1.java', 'root/src/entity/entity1.java');
    fileMap.set(
      'dataAccessInterface1.java',
      'root/src/data_access/dataAccessInterface1.java'
    );
    fileMap.set('view1.java', 'root/src/views/view1.java');
    fileMap.set('viewModel1.java', 'root/src/views/viewModel1.java');
    fileMap.set('database1.java', 'root/src/database/database1.java');
    for (const [fileName, filePath] of fileMap) {
      (interactor as any).externalFilePaths.set(fileName, filePath);
    }
    fileMap.set(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/usecase/usecase1InputData.java'
    );

    (interactor as any).internalFilePaths.set(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/usecase/usecase1InputData.java'
    );
    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase1'));
    (interactor as any).useCaseGraphList[0].addFile(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/usecase/usecase1InputData.java'
    );

    mockFileAccess.getFileImports
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => ['entity1.java;'])
      .mockImplementationOnce(async (_) => ['usecase1InputData.java;'])
      .mockImplementationOnce(async (_) => ['dataAccess1.java;'])
      .mockImplementationOnce(async (_) => ['dataAccessInterface1.java;'])
      .mockImplementationOnce(async (_) => ['view1.java;'])
      .mockImplementationOnce(async (_) => ['viewModel1.java;']);

    await (interactor as any).developOutNeighbours();
    const expectedFiles = [
      'entity1.java',
      'usecase1InputData.java',
      'dataAccess1.java',
      'dataAccessInterface1.java',
      'view1.java',
      'viewModel1.java',
    ];
    for (const fileName of expectedFiles) {
      expect((interactor as any).useCaseGraphList[0].getFiles().has(fileName));
    }
    expect(
      (interactor as any).useCaseGraphList[0]
        .getFiles()
        .has('usecase1InputData.java')
    );
    await (interactor as any).verifyOutNeighbours();
    const expectedNeighbours = [
      ['entities', 'inputData'],
      ['dataAccess', 'entities'],
      ['dataAccessInterface', 'dataAccess'],
      ['view', 'dataAccessInterface'],
      ['viewModel', 'view'],
      ['database', 'viewModel'],
    ];
    for (const [from, to] of expectedNeighbours) {
      expect(
        (interactor as any).useCaseGraphList[0]
          .getNodeNeighbours(from)
          .includes(to)
      );
    }

    const fileStorage = (interactor as any).buildFileStorageList(fileMap);
    const nodeStorage = (interactor as any).buildNodeStorageList(fileStorage);

    for (const [_, filePath] of fileMap) {
      expect(nodeStorage).toContainEqual({
        id: `${filePath}-usecase1`,
        filePath: filePath,
        type: (interactor as any).resolveNode(filePath),
        layer: (interactor as any).resolveLayer(filePath),
        status: 'VIOLATION',
      });
    }
    const missingNodes = [
      'controller',
      'presenter',
      'inputBoundary',
      'outputBoundary',
      'outputData',
      'useCaseInteractor',
    ];
    for (const node of missingNodes) {
      expect(
        (interactor as any).useCaseGraphList[0].getMissingNodes().includes(node)
      );
    }
  });

  it('Assigns the origin of cross use case edge as violation, but not the imported file when packaging by layer.', async () => {
    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );

    (interactor as any).internalFilePaths.set(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );
    (interactor as any).internalFilePaths.set(
      'usecase2Controller.java',
      'root/src/interface_adapter/usecase2/usecase2Controller.java'
    );
    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase1'));
    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase2'));
    (interactor as any).useCaseGraphList[0].addFile(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );
    (interactor as any).useCaseGraphList[1].addFile(
      'usecase2Controller.java',
      'root/src/interface_adapter/usecase2/usecase2Controller.java'
    );

    mockFileAccess.getFileImports
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => ['usecase1InputData.java']);

    await (interactor as any).developOutNeighbours();
    expect(
      (interactor as any).useCaseGraphList[0]
        .getFiles()
        .has('usecase1InputData.java')
    );
    expect(
      (interactor as any).useCaseGraphList[1]
        .getFiles()
        .has('usecase2Controller.java')
    );

    await (interactor as any).verifyOutNeighbours();
    expect((interactor as any).crossUseCaseEdges).toContainEqual([
      ['controller', 'inputData'],
    ]);
    expect((interactor as any).crossUseCaseFiles).toContainEqual(
      'root/src/interface_adapter/usecase2/usecase2Controller.java'
    );
    expect((interactor as any).crossUseCaseFiles).not.toContainEqual(
      'root/src/use_case/usecase1/usecase1InputData.java'
    );

    const fileMap = new Map<string, string>();
    fileMap.set(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );
    fileMap.set(
      'usecase2Controller.java',
      'root/src/interface_adapter/usecase2/usecase2Controller.java'
    );
    const fileStorage = (interactor as any).buildFileStorageList(fileMap);
    const nodeStorage = (interactor as any).buildNodeStorageList(fileStorage);

    for (const [_, filePath] of fileMap) {
      expect(nodeStorage).toContainEqual({
        id: `${filePath}-${filePath.includes('Controller') ? 'usecase2' : 'usecase1'}`,
        filePath: filePath,
        type: (interactor as any).resolveNode(filePath),
        layer: (interactor as any).resolveLayer(filePath),
        status: filePath.includes('Controller') ? 'VIOLATION' : 'VALID',
      });
    }
    const missingNodes1 = [
      'controller',
      'presenter',
      'inputBoundary',
      'outputBoundary',
      'outputData',
      'useCaseInteractor',
      'view',
      'dataAccess',
      'dataAccessInterface',
      'database',
      'entities',
      'viewModel',
    ];
    const missingNodes2 = [
      'presenter',
      'inputData',
      'inputBoundary',
      'outputBoundary',
      'outputData',
      'useCaseInteractor',
      'view',
      'dataAccess',
      'dataAccessInterface',
      'database',
      'entities',
      'viewModel',
    ];
    for (const node of missingNodes1) {
      expect(
        (interactor as any).useCaseGraphList[0].getMissingNodes().includes(node)
      );
    }
    for (const node of missingNodes2) {
      expect(
        (interactor as any).useCaseGraphList[0].getMissingNodes().includes(node)
      );
    }
  });

  it('Assigns the origin of cross use case edge as violation, but not the imported file when packaging by component.', async () => {
    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );

    (interactor as any).internalFilePaths.set(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputData.java'
    );
    (interactor as any).internalFilePaths.set(
      'usecase2Controller.java',
      'root/src/features/feature2/usecase2/interface_adapter/usecase2Controller.java'
    );
    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase1'));
    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase2'));
    (interactor as any).useCaseGraphList[0].addFile(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputData.java'
    );
    (interactor as any).useCaseGraphList[1].addFile(
      'usecase2Controller.java',
      'root/src/features/feature2/usecase2/interface_adapter/usecase2Controller.java'
    );

    mockFileAccess.getFileImports
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => ['usecase1InputData.java']);

    await (interactor as any).developOutNeighbours();
    expect(
      (interactor as any).useCaseGraphList[0]
        .getFiles()
        .has('usecase1InputData.java')
    );
    expect(
      (interactor as any).useCaseGraphList[1]
        .getFiles()
        .has('usecase2Controller.java')
    );

    await (interactor as any).verifyOutNeighbours();
    expect((interactor as any).crossUseCaseEdges).toContainEqual([
      ['controller', 'inputData'],
    ]);
    expect((interactor as any).crossUseCaseFiles).toContainEqual(
      'root/src/features/feature2/usecase2/interface_adapter/usecase2Controller.java'
    );
    expect((interactor as any).crossUseCaseFiles).not.toContainEqual(
      'root/src/features/feature1/usecase1/use_case/usecase1InputData.java'
    );

    const fileMap = new Map<string, string>();
    fileMap.set(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputData.java'
    );
    fileMap.set(
      'usecase2Controller.java',
      'root/src/features/feature2/usecase2/interface_adapter/usecase2Controller.java'
    );
    const fileStorage = (interactor as any).buildFileStorageList(fileMap);
    const nodeStorage = (interactor as any).buildNodeStorageList(fileStorage);

    for (const [_, filePath] of fileMap) {
      expect(nodeStorage).toContainEqual({
        id: `${filePath}-${filePath.includes('Controller') ? 'usecase2' : 'usecase1'}`,
        filePath: filePath,
        type: (interactor as any).resolveNode(filePath),
        layer: (interactor as any).resolveLayer(filePath),
        status: filePath.includes('Controller') ? 'VIOLATION' : 'VALID',
      });
    }
    const missingNodes1 = [
      'controller',
      'presenter',
      'inputBoundary',
      'outputBoundary',
      'outputData',
      'useCaseInteractor',
      'view',
      'dataAccess',
      'dataAccessInterface',
      'database',
      'entities',
      'viewModel',
    ];
    const missingNodes2 = [
      'presenter',
      'inputData',
      'inputBoundary',
      'outputBoundary',
      'outputData',
      'useCaseInteractor',
      'view',
      'dataAccess',
      'dataAccessInterface',
      'database',
      'entities',
      'viewModel',
    ];
    for (const node of missingNodes1) {
      expect(
        (interactor as any).useCaseGraphList[0].getMissingNodes().includes(node)
      );
    }
    for (const node of missingNodes2) {
      expect(
        (interactor as any).useCaseGraphList[0].getMissingNodes().includes(node)
      );
    }
  });

  it('Assigns internal files that import external ones to the correct use case (along with the external files) when packaging by layer.', async () => {
    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );

    const fileMap = new Map<string, string>();
    fileMap.set('dataAccess1.java', 'root/src/data_access/dataAccess1.java');
    fileMap.set('entity1.java', 'root/src/entity/entity1.java');
    fileMap.set(
      'dataAccessInterface1.java',
      'root/src/data_access/dataAccessInterface1.java'
    );
    fileMap.set('view1.java', 'root/src/views/view1.java');
    fileMap.set('viewModel1.java', 'root/src/views/viewModel1.java');
    fileMap.set('database1.java', 'root/src/database/database1.java');
    for (const [fileName, filePath] of fileMap) {
      (interactor as any).externalFilePaths.set(fileName, filePath);
    }
    fileMap.set(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );

    (interactor as any).internalFilePaths.set(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );
    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase1'));
    (interactor as any).useCaseGraphList[0].addFile(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );

    mockFileAccess.getFileImports
      .mockImplementationOnce(async (_) => ['entity1.java'])
      .mockImplementationOnce(async (_) => ['entity1.java;'])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => ['dataAccess1.java;'])
      .mockImplementationOnce(async (_) => ['dataAccessInterface1.java;'])
      .mockImplementationOnce(async (_) => ['view1.java;'])
      .mockImplementationOnce(async (_) => ['viewModel1.java;']);

    await (interactor as any).developOutNeighbours();
    const expectedFiles = [
      'entity1.java',
      'usecase1InputData.java',
      'dataAccess1.java',
      'dataAccessInterface1.java',
      'view1.java',
      'import viewModel1.java',
    ];
    for (const fileName of expectedFiles) {
      expect((interactor as any).useCaseGraphList[0].getFiles().has(fileName));
    }
    expect(
      (interactor as any).useCaseGraphList[0]
        .getFiles()
        .has('usecase1InputData.java')
    );
    await (interactor as any).verifyOutNeighbours();
    const expectedNeighbours = [
      ['inputData', 'entities'],
      ['dataAccess', 'entities'],
      ['dataAccessInterface', 'dataAccess'],
      ['view', 'dataAccessInterface'],
      ['viewModel', 'view'],
      ['database', 'viewModel'],
    ];
    for (const [from, to] of expectedNeighbours) {
      expect(
        (interactor as any).useCaseGraphList[0]
          .getNodeNeighbours(from)
          .includes(to)
      );
    }

    const fileStorage = (interactor as any).buildFileStorageList(fileMap);
    const nodeStorage = (interactor as any).buildNodeStorageList(fileStorage);

    for (const [_, filePath] of fileMap) {
      expect(nodeStorage).toContainEqual({
        id: `${filePath}-usecase1`,
        filePath: filePath,
        type: (interactor as any).resolveNode(filePath),
        layer: (interactor as any).resolveLayer(filePath),
        status: 'VIOLATION',
      });
    }
    const missingNodes = [
      'controller',
      'presenter',
      'inputBoundary',
      'outputBoundary',
      'outputData',
      'useCaseInteractor',
    ];
    for (const node of missingNodes) {
      expect(
        (interactor as any).useCaseGraphList[0].getMissingNodes().includes(node)
      );
    }
  });

  it('Assigns internal files that import external ones to the correct use case (along with the external files) when packaging by component.', async () => {
    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );

    const fileMap = new Map<string, string>();
    fileMap.set('dataAccess1.java', 'root/src/data_access/dataAccess1.java');
    fileMap.set('entity1.java', 'root/src/entity/entity1.java');
    fileMap.set(
      'dataAccessInterface1.java',
      'root/src/data_access/dataAccessInterface1.java'
    );
    fileMap.set('view1.java', 'root/src/views/view1.java');
    fileMap.set('viewModel1.java', 'root/src/views/viewModel1.java');
    fileMap.set('database1.java', 'root/src/database/database1.java');
    for (const [fileName, filePath] of fileMap) {
      (interactor as any).externalFilePaths.set(fileName, filePath);
    }
    fileMap.set(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputData.java'
    );

    (interactor as any).internalFilePaths.set(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputData.java'
    );
    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase1'));
    (interactor as any).useCaseGraphList[0].addFile(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputData.java'
    );

    mockFileAccess.getFileImports
      .mockImplementationOnce(async (_) => ['entity1.java'])
      .mockImplementationOnce(async (_) => ['entity1.java;'])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => ['dataAccess1.java;'])
      .mockImplementationOnce(async (_) => ['dataAccessInterface1.java;'])
      .mockImplementationOnce(async (_) => ['view1.java;'])
      .mockImplementationOnce(async (_) => ['viewModel1.java;']);

    await (interactor as any).developOutNeighbours();
    const expectedFiles = [
      'entity1.java',
      'usecase1InputData.java',
      'dataAccess1.java',
      'dataAccessInterface1.java',
      'view1.java',
      'import viewModel1.java',
    ];
    for (const fileName of expectedFiles) {
      expect((interactor as any).useCaseGraphList[0].getFiles().has(fileName));
    }
    expect(
      (interactor as any).useCaseGraphList[0]
        .getFiles()
        .has('usecase1InputData.java')
    );
    await (interactor as any).verifyOutNeighbours();
    const expectedNeighbours = [
      ['inputData', 'entities'],
      ['dataAccess', 'entities'],
      ['dataAccessInterface', 'dataAccess'],
      ['view', 'dataAccessInterface'],
      ['viewModel', 'view'],
      ['database', 'viewModel'],
    ];
    for (const [from, to] of expectedNeighbours) {
      expect(
        (interactor as any).useCaseGraphList[0]
          .getNodeNeighbours(from)
          .includes(to)
      );
    }

    const fileStorage = (interactor as any).buildFileStorageList(fileMap);
    const nodeStorage = (interactor as any).buildNodeStorageList(fileStorage);

    for (const [_, filePath] of fileMap) {
      expect(nodeStorage).toContainEqual({
        id: `${filePath}-usecase1`,
        filePath: filePath,
        type: (interactor as any).resolveNode(filePath),
        layer: (interactor as any).resolveLayer(filePath),
        status: 'VIOLATION',
      });
    }
    const missingNodes = [
      'controller',
      'presenter',
      'inputBoundary',
      'outputBoundary',
      'outputData',
      'useCaseInteractor',
    ];
    for (const node of missingNodes) {
      expect(
        (interactor as any).useCaseGraphList[0].getMissingNodes().includes(node)
      );
    }
  });

  it('Assigns nodes to the correct status when packaging by layer.', async () => {
    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );

    const fileMap1 = new Map<string, string>();
    fileMap1.set('dataAccess1.java', 'root/src/data_access/dataAccess1.java');
    fileMap1.set('entity1.java', 'root/src/entity/entity1.java');
    fileMap1.set(
      'dataAccessInterface1.java',
      'root/src/data_access/dataAccessInterface1.java'
    );
    fileMap1.set('view1.java', 'root/src/views/view1.java');
    fileMap1.set('viewModel1.java', 'root/src/views/viewModel1.java');
    fileMap1.set('database1.java', 'root/src/database/database1.java');
    for (const [fileName, filePath] of fileMap1) {
      (interactor as any).externalFilePaths.set(fileName, filePath);
    }

    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase1'));

    const fileMap2 = new Map<string, string>();
    fileMap2.set(
      'usecase1Controller.java',
      'root/src/interface_adapter/usecase1/usecase1Controller.java'
    );
    fileMap2.set(
      'usecase1Presenter.java',
      'root/src/interface_adapter/usecase1/usecase1Presenter.java'
    );
    fileMap2.set(
      'usecase1InputBoundary.java',
      'root/src/use_case/usecase1/usecase1InputBoundary.java'
    );
    fileMap2.set(
      'usecase1InputData.java',
      'root/src/use_case/usecase1/usecase1InputData.java'
    );
    fileMap2.set(
      'usecase1OutputBoundary.java',
      'root/src/use_case/usecase1/usecase1OutputBoundary.java'
    );
    fileMap2.set(
      'usecase1OutputData.java',
      'root/src/use_case/usecase1/usecase1OutputData.java'
    );
    fileMap2.set(
      'usecase1Interactor.java',
      'root/src/use_case/usecase1/usecase1Interactor.java'
    );
    for (const [fileName, filePath] of fileMap2) {
      (interactor as any).internalFilePaths.set(fileName, filePath);
      (interactor as any).useCaseGraphList[0].addFile(fileName, filePath);
    }

    const fileMap = new Map<string, string>([...fileMap1, ...fileMap2]);

    mockFileAccess.getFileImports
      .mockImplementationOnce(async (_) => [
        'usecase1InputBoundary.java;',
        'usecase1InputData.java;',
      ])
      .mockImplementationOnce(async (_) => [
        'usecase1OutputBoundary.java;',
        'usecase1OutputData.java;',
        'viewModel1.java;',
      ])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [
        'usecase1InputBoundary.java;',
        'usecase1InputData.java;',
        'usecase1OutputBoundary.java;',
        'usecase1OutputData.java;',
        'dataAccessInterface1.java;',
        'entity1.java;',
      ])
      .mockImplementationOnce(async (_) => [
        'dataAccessInterface1.java',
        'database1.java',
        'entity1.java;',
      ])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [
        'viewModel1.java',
        'usecase1Controller.java',
      ])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => []);

    await (interactor as any).developOutNeighbours();
    const expectedFiles = [
      'usecase1Presenter.java',
      'usecase1Controller.java',
      'usecase1Interactor.java',
      'entity1.java',
      'usecase1InputData.java',
      'dataAccess1.java',
      'dataAccessInterface1.java',
      'view1.java',
      'viewModel1.java',
      'usecase1InputBoundary.java',
      'usecase1InputData.java',
      'usecase1OutputBoundary.java',
      'usecase1OutputData.java',
    ];
    for (const fileName of expectedFiles) {
      expect((interactor as any).useCaseGraphList[0].getFiles().has(fileName));
    }

    await (interactor as any).verifyOutNeighbours();
    const expectedNeighbours = [
      ['controller', 'inputData'],
      ['controller', 'inputBoundary'],
      ['presenter', 'outputBoundary'],
      ['presenter', 'outputData'],
      ['presenter', 'viewModel'],
      ['useCaseInteractor', 'inputBoundary'],
      ['useCaseInteractor', 'inputData'],
      ['useCaseInteractor', 'outputBoundary'],
      ['useCaseInteractor', 'outputData'],
      ['useCaseInteractor', 'dataAccessInterface'],
      ['useCaseInteractor', 'entities'],
      ['dataAccess', 'dataAccessInterface'],
      ['dataAccess', 'entities'],
      ['dataAccess', 'database'],
      ['view', 'viewModel'],
      ['view', 'controller'],
    ];
    for (const [from, to] of expectedNeighbours) {
      expect(
        (interactor as any).useCaseGraphList[0]
          .getNodeNeighbours(from)
          .includes(to)
      );
    }

    const fileStorage = (interactor as any).buildFileStorageList(fileMap);
    const nodeStorage = (interactor as any).buildNodeStorageList(fileStorage);

    for (const [_, filePath] of fileMap) {
      expect(nodeStorage).toContainEqual({
        id: `${filePath}-usecase1`,
        filePath: filePath,
        type: (interactor as any).resolveNode(filePath),
        layer: (interactor as any).resolveLayer(filePath),
        status: 'VALID',
      });
    }
    expect(
      (interactor as any).useCaseGraphList[0].getMissingNodes().length === 0
    );
  });

  it('Assigns nodes to the correct status when packaging by component.', async () => {
    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );

    const fileMap1 = new Map<string, string>();
    fileMap1.set('dataAccess1.java', 'root/src/data_access/dataAccess1.java');
    fileMap1.set('entity1.java', 'root/src/entity/entity1.java');
    fileMap1.set(
      'dataAccessInterface1.java',
      'root/src/data_access/dataAccessInterface1.java'
    );
    fileMap1.set('view1.java', 'root/src/views/view1.java');
    fileMap1.set('viewModel1.java', 'root/src/views/viewModel1.java');
    fileMap1.set('database1.java', 'root/src/database/database1.java');
    for (const [fileName, filePath] of fileMap1) {
      (interactor as any).externalFilePaths.set(fileName, filePath);
    }

    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase1'));

    const fileMap2 = new Map<string, string>();
    fileMap2.set(
      'usecase1Controller.java',
      'root/src/features/feature1/usecase1/interface_adapter/usecase1Controller.java'
    );
    fileMap2.set(
      'usecase1Presenter.java',
      'root/src/features/feature1/usecase1/interface_adapter/usecase1Presenter.java'
    );
    fileMap2.set(
      'usecase1InputBoundary.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputBoundary.java'
    );
    fileMap2.set(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputData.java'
    );
    fileMap2.set(
      'usecase1OutputBoundary.java',
      'root/src/features/feature1/usecase1/use_case/usecase1OutputBoundary.java'
    );
    fileMap2.set(
      'usecase1OutputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1OutputData.java'
    );
    fileMap2.set(
      'usecase1Interactor.java',
      'root/src/features/feature1/usecase1/use_case/usecase1Interactor.java'
    );
    for (const [fileName, filePath] of fileMap2) {
      (interactor as any).internalFilePaths.set(fileName, filePath);
      (interactor as any).useCaseGraphList[0].addFile(fileName, filePath);
    }

    const fileMap = new Map<string, string>([...fileMap1, ...fileMap2]);

    mockFileAccess.getFileImports
      .mockImplementationOnce(async (_) => [
        'usecase1InputBoundary.java;',
        'usecase1InputData.java;',
      ])
      .mockImplementationOnce(async (_) => [
        'usecase1OutputBoundary.java;',
        'usecase1OutputData.java;',
        'viewModel1.java;',
      ])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [
        'usecase1InputBoundary.java;',
        'usecase1InputData.java;',
        'usecase1OutputBoundary.java;',
        'usecase1OutputData.java;',
        'dataAccessInterface1.java;',
        'entity1.java;',
      ])
      .mockImplementationOnce(async (_) => [
        'dataAccessInterface1.java',
        'database1.java',
        'entity1.java;',
      ])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [
        'viewModel1.java',
        'usecase1Controller.java',
      ])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => []);

    await (interactor as any).developOutNeighbours();
    const expectedFiles = [
      'usecase1Presenter.java',
      'usecase1Controller.java',
      'usecase1Interactor.java',
      'entity1.java',
      'usecase1InputData.java',
      'dataAccess1.java',
      'dataAccessInterface1.java',
      'view1.java',
      'viewModel1.java',
      'usecase1InputBoundary.java',
      'usecase1InputData.java',
      'usecase1OutputBoundary.java',
      'usecase1OutputData.java',
    ];
    for (const fileName of expectedFiles) {
      expect((interactor as any).useCaseGraphList[0].getFiles().has(fileName));
    }

    await (interactor as any).verifyOutNeighbours();
    const expectedNeighbours = [
      ['controller', 'inputData'],
      ['controller', 'inputBoundary'],
      ['presenter', 'outputBoundary'],
      ['presenter', 'outputData'],
      ['presenter', 'viewModel'],
      ['useCaseInteractor', 'inputBoundary'],
      ['useCaseInteractor', 'inputData'],
      ['useCaseInteractor', 'outputBoundary'],
      ['useCaseInteractor', 'outputData'],
      ['useCaseInteractor', 'dataAccessInterface'],
      ['useCaseInteractor', 'entities'],
      ['dataAccess', 'dataAccessInterface'],
      ['dataAccess', 'entities'],
      ['dataAccess', 'database'],
      ['view', 'viewModel'],
      ['view', 'controller'],
    ];
    for (const [from, to] of expectedNeighbours) {
      expect(
        (interactor as any).useCaseGraphList[0]
          .getNodeNeighbours(from)
          .includes(to)
      );
    }

    const fileStorage = (interactor as any).buildFileStorageList(fileMap);
    const nodeStorage = (interactor as any).buildNodeStorageList(fileStorage);

    for (const [_, filePath] of fileMap) {
      expect(nodeStorage).toContainEqual({
        id: `${filePath}-usecase1`,
        filePath: filePath,
        type: (interactor as any).resolveNode(filePath),
        layer: (interactor as any).resolveLayer(filePath),
        status: 'VALID',
      });
    }
    expect(
      (interactor as any).useCaseGraphList[0].getMissingNodes().length === 0
    );
  });

  it('Assigns nodes to the correct status when packaging by component and imports have different format.', async () => {
    let interactor = new GraphVerificationInteractor(
      mockFileAccess,
      genericNeighbourAccess,
      genericDBAccess,
      presenter
    );

    const fileMap1 = new Map<string, string>();
    fileMap1.set('dataAccess1.java', 'root/src/data_access/dataAccess1.java');
    fileMap1.set('entity1.java', 'root/src/entity/entity1.java');
    fileMap1.set(
      'dataAccessInterface1.java',
      'root/src/data_access/dataAccessInterface1.java'
    );
    fileMap1.set('view1.java', 'root/src/views/view1.java');
    fileMap1.set('viewModel1.java', 'root/src/views/viewModel1.java');
    fileMap1.set('database1.java', 'root/src/database/database1.java');
    for (const [fileName, filePath] of fileMap1) {
      (interactor as any).externalFilePaths.set(fileName, filePath);
    }

    (interactor as any).useCaseGraphList.push(new useCaseGraph('usecase1'));

    const fileMap2 = new Map<string, string>();
    fileMap2.set(
      'usecase1Controller.java',
      'root/src/features/feature1/usecase1/interface_adapter/usecase1Controller.java'
    );
    fileMap2.set(
      'usecase1Presenter.java',
      'root/src/features/feature1/usecase1/interface_adapter/usecase1Presenter.java'
    );
    fileMap2.set(
      'usecase1InputBoundary.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputBoundary.java'
    );
    fileMap2.set(
      'usecase1InputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1InputData.java'
    );
    fileMap2.set(
      'usecase1OutputBoundary.java',
      'root/src/features/feature1/usecase1/use_case/usecase1OutputBoundary.java'
    );
    fileMap2.set(
      'usecase1OutputData.java',
      'root/src/features/feature1/usecase1/use_case/usecase1OutputData.java'
    );
    fileMap2.set(
      'usecase1Interactor.java',
      'root/src/features/feature1/usecase1/use_case/usecase1Interactor.java'
    );
    for (const [fileName, filePath] of fileMap2) {
      (interactor as any).internalFilePaths.set(fileName, filePath);
      (interactor as any).useCaseGraphList[0].addFile(fileName, filePath);
    }

    const fileMap = new Map<string, string>([...fileMap1, ...fileMap2]);

    mockFileAccess.getFileImports
      .mockImplementationOnce(async (_) => [
        '../usecase1InputBoundary.java;',
        '../usecase1InputData.java;',
      ])
      .mockImplementationOnce(async (_) => [
        '../usecase1OutputBoundary.java;',
        '../usecase1OutputData.java;',
        '../viewModel1.java;',
      ])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [
        '../usecase1InputBoundary.java;',
        '../usecase1InputData.java;',
        '../usecase1OutputBoundary.java;',
        '../usecase1OutputData.java;',
        '../dataAccessInterface1.java;',
        '../entity1.java;',
      ])
      .mockImplementationOnce(async (_) => [
        '../dataAccessInterface1.java',
        '../database1.java',
        '../entity1.java;',
      ])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => [
        '../viewModel1.java',
        '../usecase1Controller.java',
      ])
      .mockImplementationOnce(async (_) => [])
      .mockImplementationOnce(async (_) => []);

    await (interactor as any).developOutNeighbours();
    const expectedFiles = [
      'usecase1Presenter.java',
      'usecase1Controller.java',
      'usecase1Interactor.java',
      'entity1.java',
      'usecase1InputData.java',
      'dataAccess1.java',
      'dataAccessInterface1.java',
      'view1.java',
      'viewModel1.java',
      'usecase1InputBoundary.java',
      'usecase1InputData.java',
      'usecase1OutputBoundary.java',
      'usecase1OutputData.java',
    ];
    for (const fileName of expectedFiles) {
      expect((interactor as any).useCaseGraphList[0].getFiles().has(fileName));
    }

    await (interactor as any).verifyOutNeighbours();
    const expectedNeighbours = [
      ['controller', 'inputData'],
      ['controller', 'inputBoundary'],
      ['presenter', 'outputBoundary'],
      ['presenter', 'outputData'],
      ['presenter', 'viewModel'],
      ['useCaseInteractor', 'inputBoundary'],
      ['useCaseInteractor', 'inputData'],
      ['useCaseInteractor', 'outputBoundary'],
      ['useCaseInteractor', 'outputData'],
      ['useCaseInteractor', 'dataAccessInterface'],
      ['useCaseInteractor', 'entities'],
      ['dataAccess', 'dataAccessInterface'],
      ['dataAccess', 'entities'],
      ['dataAccess', 'database'],
      ['view', 'viewModel'],
      ['view', 'controller'],
    ];
    for (const [from, to] of expectedNeighbours) {
      expect(
        (interactor as any).useCaseGraphList[0]
          .getNodeNeighbours(from)
          .includes(to)
      );
    }

    const fileStorage = (interactor as any).buildFileStorageList(fileMap);
    const nodeStorage = (interactor as any).buildNodeStorageList(fileStorage);

    for (const [_, filePath] of fileMap) {
      expect(nodeStorage).toContainEqual({
        id: `${filePath}-usecase1`,
        filePath: filePath,
        type: (interactor as any).resolveNode(filePath),
        layer: (interactor as any).resolveLayer(filePath),
        status: 'VALID',
      });
    }
    expect(
      (interactor as any).useCaseGraphList[0].getMissingNodes().length === 0
    );
  });
});
