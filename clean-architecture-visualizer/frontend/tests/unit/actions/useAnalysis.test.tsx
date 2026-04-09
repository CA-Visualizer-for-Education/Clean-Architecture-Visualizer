import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderHook, waitFor } from '../../test-utils'; 
import { useAnalysisSummary, useInteraction, useInteractionViolations } from '@/actions/useAnalysis';
import { server } from '@/mocks/server';

describe('Analysis Hooks', () => {
  it('useAnalysisSummary fetches summary successfully', async () => {
    server.use(
      http.get('*/api/analysis/summary', () => {
        return HttpResponse.json({ totalViolations: 10 });
      })
    );

    const { result } = renderHook(() => useAnalysisSummary());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.totalViolations).toBe(10);
  });

  it('useInteraction fetches details when ID is provided', async () => {
    const mockId = 'int-123';
    server.use(
      http.get(`*/api/analysis/interaction/${mockId}`, () => {
        return HttpResponse.json({ id: mockId, type: 'check' });
      })
    );

    const { result } = renderHook(() => useInteraction(mockId));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(mockId);
  });

  it('useInteractionViolations stays idle if interactionId is empty', () => {
    const { result } = renderHook(() => useInteractionViolations(''));
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('useInteractionViolations fetches array of violations', async () => {
    server.use(
      http.get('*/api/analysis/violations/123', () => {
        return HttpResponse.json([{ id: 'v1', message: 'Layer violation' }]);
      })
    );

    const { result } = renderHook(() => useInteractionViolations('123'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].id).toBe('v1');
  });
});