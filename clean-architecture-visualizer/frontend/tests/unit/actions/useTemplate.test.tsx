import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../test-utils';
import { useGenerateProject, useCreateUseCase } from '@/actions/useTemplate';
import { server } from '@/mocks/server';

describe('Template Hooks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('useGenerateProject resolves the template response and invalidates file-tree queries', async () => {
    const invalidateSpy = vi
      .spyOn(QueryClient.prototype, 'invalidateQueries')
      .mockResolvedValue(undefined);

    server.use(
      http.post('*/api/template/generate', () => {
        return HttpResponse.json({ message: 'Project initiated successfully' }, { status: 201 });
      })
    );

    const { result } = renderHook(() => useGenerateProject());

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.message).toBe('Project initiated successfully');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['file-tree'] });
  });

  it('useCreateUseCase resolves the template response and invalidates related queries', async () => {
    const invalidateSpy = vi
      .spyOn(QueryClient.prototype, 'invalidateQueries')
      .mockResolvedValue(undefined);

    server.use(
      http.post('*/api/template/add/Add%20User', () => {
        return HttpResponse.json({ message: "Use case 'Add User' created successfully" }, { status: 201 });
      })
    );

    const { result } = renderHook(() => useCreateUseCase());

    result.current.mutate('Add User');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.message).toBe("Use case 'Add User' created successfully");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['file-tree'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['relations'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['analysis_summary'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['violations'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['interactions'] });
  });
});