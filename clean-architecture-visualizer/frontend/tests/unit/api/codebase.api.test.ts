import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { 
  getFileTree, 
  getFileContent, 
  getFileRelations 
} from '@/api/codebase.api';

describe('Codebase API', () => {
  it('getFileTree fetches the full directory structure', async () => {
    const mockTree = { name: 'root', children: [] };
    server.use(
      http.get('*/api/codebase/file-tree', () => HttpResponse.json(mockTree))
    );

    const result = await getFileTree();
    expect(result).toEqual(mockTree);
  });

  it('getFileContent correctly encodes complex file paths', async () => {
    const interactionId = 'flow-1';
    const filePath = 'src/entities/User.java';
    const encodedPath = encodeURIComponent(filePath);
    
    server.use(
      http.get(`*/api/codebase/interactions/${interactionId}/files/${encodedPath}`, () => {
        return HttpResponse.json({ content: 'class User {}' });
      })
    );

    const result = await getFileContent(interactionId, filePath);
    expect(result.content).toBe('class User {}');
  });

  it('getFileRelations hits the nested relations endpoint', async () => {
    const interactionId = 'flow-1';
    const filePath = 'src/Controller.ts';
    const encodedPath = encodeURIComponent(filePath);

    server.use(
      http.get(`*/api/codebase/interactions/${interactionId}/files/${encodedPath}/relations`, () => {
        return HttpResponse.json({ dependencies: ['Service.ts'] });
      })
    );

    const result = await getFileRelations(interactionId, filePath);
    expect(result.dependencies).toContain('Service.ts');
  });

  it('throws an error when the API returns a 404', async () => {
    server.use(
      http.get('*/api/codebase/file-tree', () => new HttpResponse(null, { status: 404 }))
    );

    // Axios helper: should reject when status is not 2xx
    await expect(getFileTree()).rejects.toThrow();
  });
});