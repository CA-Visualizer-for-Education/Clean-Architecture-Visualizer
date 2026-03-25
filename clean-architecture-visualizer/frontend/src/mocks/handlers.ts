import { http, HttpResponse } from 'msw';
import { mockLearningMode } from './data/learning';
import { mockAnalysisSummary, mockInteractionDetails, mockViolations } from './data/analysis';
import { mockFileTree, mockFiles, mockFileRelationsByPath } from './data/codebase';

export const handlers = [
    http.get('/api/learning-mode/', () => {
    return HttpResponse.json(mockLearningMode);
  }),

  http.get('/api/analysis/summary', () => HttpResponse.json(mockAnalysisSummary)),
  http.get('/api/analysis/interaction/:id', () => HttpResponse.json(mockInteractionDetails)),
  http.get('/api/analysis/violations/:interactionId', () => HttpResponse.json(mockViolations)),

  http.get('/api/codebase/file-tree', () => HttpResponse.json(mockFileTree)),
  http.get(
  '/api/codebase/interactions/:interactionId/files/:path*/relations',
  ({ params }) => {
    const pathParam = params.path;

    const filePath =
      typeof pathParam === 'string'
        ? pathParam
        : pathParam?.join('/') ?? '';

    const decodedPath = decodeURIComponent(filePath);

    console.log("Looking up relations with key:", decodedPath);

    const relations = mockFileRelationsByPath[decodedPath];

    if (!relations) {
      console.warn(
        `No relations found for ${decodedPath}. Available keys:`,
        Object.keys(mockFileRelationsByPath)
      );
      return HttpResponse.json({ relations: [] });
    }

    return HttpResponse.json({ relations });
  }
),
  http.get('/api/codebase/interactions/:interactionId/files/:path*', ({ params }) => {
  const pathParam = params.path;

  const filePath =
    typeof pathParam === 'string'
      ? pathParam
      : pathParam?.join('/') ?? '';

  const decodedPath = decodeURIComponent(filePath);

  const file = mockFiles[decodedPath];

  if (!file) {
    console.warn(`[MSW] Mock not found for path: ${filePath}`);
    return new HttpResponse(null, { status: 404 });
  }

  return HttpResponse.json(file);
}),
  
];