import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { generateProject, createUseCase } from '@/api/template.api';

describe('Template API', () => {
  it('generateProject posts to /template/generate and returns the response data', async () => {
    const mockData = { message: 'Project initiated successfully' };

    server.use(
      http.post('*/api/template/generate', () => HttpResponse.json(mockData, { status: 201 }))
    );

    const result = await generateProject();

    expect(result).toEqual(mockData);
  });

  it('createUseCase encodes the use case name in the request URL', async () => {
    const useCaseName = 'Add User';
    const encodedName = encodeURIComponent(useCaseName);
    const mockData = { message: `Use case '${useCaseName}' created successfully` };

    server.use(
      http.post(`*/api/template/add/${encodedName}`, () => HttpResponse.json(mockData, { status: 201 }))
    );

    const result = await createUseCase(useCaseName);

    expect(result).toEqual(mockData);
  });
});