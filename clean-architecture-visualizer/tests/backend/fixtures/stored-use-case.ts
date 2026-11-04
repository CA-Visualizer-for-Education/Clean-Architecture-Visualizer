import type { neighbourMap } from '../../../src/types/neighbourMap.js';
import type { SessionData } from '../../../src/types/sessionData.js';

type StoredUseCase = SessionData['useCases'][number];

function emptyOutNeighbours(): neighbourMap {
  return {
    controller: [],
    presenter: [],
    viewModel: [],
    view: [],
    dataAccess: [],
    dataAccessInterface: [],
    database: [],
    entities: [],
    inputData: [],
    inputBoundary: [],
    outputData: [],
    outputBoundary: [],
    useCaseInteractor: [],
  };
}

// A use case as the session DB stores it, with empty defaults for the fields a
// test leaves out.
export function makeStoredUseCase(
  fields: Partial<Omit<StoredUseCase, 'outNeighbours'>> & {
    id: string;
    outNeighbours?: Partial<neighbourMap>;
  }
): StoredUseCase {
  const { outNeighbours, ...rest } = fields;
  return {
    name: '',
    fileKeys: [],
    violationEdges: [],
    missingNodes: [],
    ...rest,
    outNeighbours: { ...emptyOutNeighbours(), ...outNeighbours },
  };
}
