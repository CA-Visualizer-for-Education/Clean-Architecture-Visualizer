import { http, HttpResponse } from 'msw';
import { mockLearningMode } from './data/learning';
import { mockAnalysisSummary, mockInteractionDetails, mockViolations } from './data/analysis';
import { mockFileTree, mockFileContent, mockComponentRelations } from './data/codebase';

export const handlers = [
    http.get('/api/learning-mode/', () => {
    return HttpResponse.json(mockLearningMode);
  }),

  http.get('/api/analysis/summary', () => HttpResponse.json(mockAnalysisSummary)),
  http.get('/api/analysis/interaction/:id', () => HttpResponse.json(mockInteractionDetails)),
  http.get('/api/analysis/violations/:interactionId', () => HttpResponse.json(mockViolations)),

  http.get('/api/codebase/file-tree', () => HttpResponse.json(mockFileTree)),
  http.get('/api/codebase/interactions/:interactionId/files/*', () => HttpResponse.json(mockFileContent)),
  http.get('/api/codebase/interactions/:interactionId/relations/:componentId', () => HttpResponse.json(mockComponentRelations)),
];