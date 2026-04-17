import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderHook, waitFor } from '../../test-utils'; 
import { useFileTree, useFileViewer, useFileRelations } from '@/actions/useCodebase';
import { server } from '../../../src/mocks/server';

describe('Codebase Hooks', () => {
  it('useFileTree fetches the directory structure', async () => {
    server.use(
      http.get('*/api/codebase/file-tree', () => {
        return HttpResponse.json([{ name: 'src', type: 'directory' }]);
      })
    );

    const { result } = renderHook(() => useFileTree());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('useFileViewer encodes file paths correctly in the request', async () => {
    const interactionId = '123';
    const filePath = 'src/entities/User.java';
    let capturedPath = '';

    server.use(
      http.get('*/api/codebase/interactions/:id/files/:path', ({ params }) => {
        capturedPath = params.path as string;
        return HttpResponse.json({ content: 'public class User {}' });
      })
    );

    const { result } = renderHook(() => useFileViewer(interactionId, filePath));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    // MSW params are automatically decoded, so we check if it matched the original
    expect(capturedPath).toBe(filePath);
    expect(result.current.data.content).toContain('User');
  });

  it('useFileRelations is disabled if either ID or path is missing', () => {
    const { result, rerender } = renderHook(
      ({ id, path }) => useFileRelations(id, path),
      { initialProps: { id: '', path: 'test.ts' } }
    );

    expect(result.current.fetchStatus).toBe('idle');

    rerender({ id: '123', path: null });
    expect(result.current.fetchStatus).toBe('idle');
  });
});