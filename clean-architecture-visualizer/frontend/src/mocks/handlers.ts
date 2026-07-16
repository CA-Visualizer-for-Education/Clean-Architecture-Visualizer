import { http, HttpResponse } from 'msw';
import {
  mockAnalysisSummary,
  mockInteractionDetails,
  mockViolations,
} from './data/analysis';

export const handlers = [
  http.get('/api/analysis/summary', () =>
    HttpResponse.json(mockAnalysisSummary)
  ),
  http.get('/api/analysis/interaction/:id', () =>
    HttpResponse.json(mockInteractionDetails)
  ),
  http.get('/api/analysis/violations/:interactionId', () =>
    HttpResponse.json(mockViolations)
  ),
];
