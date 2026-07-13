import { describe, it, expect, beforeEach } from '@jest/globals';
import { GetProjectSummaryInteractor } from '../../../src/use_case/getProjectSummary/getProjectSummaryInteractor.js';
import { SessionDBAccess } from '../../../src/data_access/sessionDBAccess.js';
import { useCaseGraph } from '../../../src/entity/useCaseGraph.js';
import type { GetProjectSummaryOutputData } from '../../../src/use_case/getProjectSummary/getProjectSummaryOutputData.js';
import type { SessionData } from '../../../src/types/sessionData.js';
import type { neighbourMap } from '../../../src/types/neighbourMap.js';
import type { cleanNode } from '../../../src/types/cleanNode.js';

const genericDBAccess = new SessionDBAccess();

// Standardized mock for Output Data matching your interface
function makeOutputData(): GetProjectSummaryOutputData & { result: any } {
  return {
    result: undefined,
    setOutputData(data: any) {
      this.result = data;
    },
    getOutputData() {
      return this.result;
    },
  } as GetProjectSummaryOutputData & { result: any };
}

// Builds a list of useCaseGraphs with mock violation edges, given a map of use case name to violation count
function mockUseCaseGraphList(
  namesToNumViolationEdges: Map<string, number>
): useCaseGraph[] {
  const result = [] as useCaseGraph[];

  for (const [name, numViolationEdges] of namesToNumViolationEdges) {
    const ucGraph = new useCaseGraph(name);
    for (let i = 0; i < numViolationEdges; i++) {
      // "view" and "controller" are arbitrary cleanNode values and can be modified
      ucGraph.setViolation(['view', 'controller'] as [cleanNode, cleanNode]);
    }
    result.push(ucGraph);
  }

  return result;
}

describe('GetProjectSummaryInteractor', () => {
  beforeEach(() => {
    genericDBAccess.resetDB();
  });

  describe('getProjectSummary — Project Name', () => {
    it('correctly handles an empty project name', async () => {
      genericDBAccess.setProjectName('');

      const outputData = makeOutputData();
      const interactor = new GetProjectSummaryInteractor(
        genericDBAccess,
        outputData
      );
      await interactor.getProjectSummary();

      expect(outputData.result.project_name).toBe('');
    });

    it('does not change the project name from the database', async () => {
      genericDBAccess.setProjectName('My Project');

      const outputData = makeOutputData();
      const interactor = new GetProjectSummaryInteractor(
        genericDBAccess,
        outputData
      );
      await interactor.getProjectSummary();

      expect(outputData.result.project_name).toBe('My Project');
    });
  });

  describe('getProjectSummary — Statistics', () => {
    it('returns the correct properties in the output', async () => {
      const outputData = makeOutputData();
      const interactor = new GetProjectSummaryInteractor(
        genericDBAccess,
        outputData
      );

      // Assuming these are set in your genericDBAccess or mocked
      await interactor.getProjectSummary();

      expect(outputData.result).toHaveProperty('project_name');
      expect(outputData.result).toHaveProperty('total_use_cases');
      expect(outputData.result).toHaveProperty('total_violations');
      expect(outputData.result).toHaveProperty('use_cases');
    });

    it('returns a total use case count consistent with the number of use cases', async () => {
      // Set up a list of mock use cases
      const mockUseCases: SessionData['useCases'] = [
        {
          id: 'uc-1',
          name: 'Sign in',
          outNeighbours: {} as neighbourMap,
          fileKeys: [],
          violationEdges: [],
          missingNodes: [],
        },
        {
          id: 'uc-2',
          name: 'Sign out',
          outNeighbours: {} as neighbourMap,
          fileKeys: [],
          violationEdges: [],
          missingNodes: [],
        },
        {
          id: 'uc-3',
          name: 'Create user',
          outNeighbours: {} as neighbourMap,
          fileKeys: [],
          violationEdges: [],
          missingNodes: [],
        },
      ];

      // Inject them into the database
      for (const uc of mockUseCases) {
        genericDBAccess.setNumUseCases(genericDBAccess.getNumUseCases() + 1);
        genericDBAccess.upsertUseCase(uc);
      }

      const outputData = makeOutputData();
      const interactor = new GetProjectSummaryInteractor(
        genericDBAccess,
        outputData
      );
      await interactor.getProjectSummary();

      const numUseCases = mockUseCases.length;
      expect(outputData.result.use_cases.length).toBe(numUseCases);
      expect(outputData.result.total_use_cases).toBe(numUseCases);
    });

    it('returns a total violations count consistent with the sum of all use case violations', async () => {
      // set up a map of mock use names to the corresponding number of violations for the test
      const mockUseCaseMap = new Map<string, number>([
        ['Sign in', 3],
        ['Sign out', 0],
        ['Create user', 1],
      ]);
      const mockUseCases: useCaseGraph[] = mockUseCaseGraphList(mockUseCaseMap);

      // compute violation count from the useCaseGraph list
      let violationCount = 0;

      mockUseCases.forEach((useCase) => {
        violationCount += useCase.getViolationCount();
      });

      genericDBAccess.setNumViolations(violationCount);

      const outputData = makeOutputData();
      const interactor = new GetProjectSummaryInteractor(
        genericDBAccess,
        outputData
      );
      await interactor.getProjectSummary();

      // compute violation count from the useCaseGraph map
      const totalViolations = [...mockUseCaseMap.values()].reduce(
        (accumulator, numViolations) => accumulator + numViolations,
        0
      );

      expect(outputData.result.total_violations).toBe(totalViolations);
    });
  });

  describe('getProjectSummary — Use Case Formatting', () => {
    it('correctly formats use case info with nested interactions', async () => {
      // Setup a mock use case in the DB
      const mockUseCase = {
        id: 'uc-123',
        name: 'Login',
        violationEdges: [
          ['A', 'B'],
          ['C', 'D'],
        ] as [string, string][],
      };

      // Manual injection for test setup
      (genericDBAccess as any).upsertUseCase?.(mockUseCase);

      const outputData = makeOutputData();
      const interactor = new GetProjectSummaryInteractor(
        genericDBAccess,
        outputData
      );

      await interactor.getProjectSummary();

      const useCaseResult = outputData.result.use_cases.find(
        (uc: any) => uc.id === 'uc-123'
      );

      expect(useCaseResult).toBeDefined();
      expect(useCaseResult.violation_count).toBe(2);
      expect(useCaseResult.interactions).toEqual([
        {
          interaction_id: 'uc-123',
          interaction_name: 'Login',
        },
      ]);
    });

    it('returns an empty array for use_cases if none exist in DB', async () => {
      const outputData = makeOutputData();
      const interactor = new GetProjectSummaryInteractor(
        genericDBAccess,
        outputData
      );

      await interactor.getProjectSummary();

      expect(outputData.result.use_cases).toEqual([]);
      expect(outputData.result.total_use_cases).toBe(0);
    });
  });
});
