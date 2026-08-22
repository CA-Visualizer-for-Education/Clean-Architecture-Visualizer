import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import {
  generateProject,
  generateModuleProject,
  createUseCase,
  createFeature,
  createModuleUseCase,
} from '@/api/template.api';

describe('Template API', () => {
  it('generateProject posts to /template/generate/java and returns the response data', async () => {
    const mockData = { message: 'Project initiated successfully' };
    server.use(
      http.post(`*/api/template/generate/${encodeURIComponent('java')}`, () =>
        HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await generateProject('java');

    expect(result).toEqual(mockData);
  });

  it('generateProject posts to /template/generate/python and returns the response data', async () => {
    const mockData = { message: 'Project initiated successfully' };

    server.use(
      http.post(`*/api/template/generate/${encodeURIComponent('python')}`, () =>
        HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await generateProject('python');

    expect(result).toEqual(mockData);
  });

  it('generateProject posts to /template/generate/javascript and returns the response data', async () => {
    const mockData = { message: 'Project initiated successfully' };

    server.use(
      http.post(
        `*/api/template/generate/${encodeURIComponent('javascript')}`,
        () => HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await generateProject('javascript');

    expect(result).toEqual(mockData);
  });

  it('generateProject posts to /template/generate/typescript and returns the response data', async () => {
    const mockData = { message: 'Project initiated successfully' };

    server.use(
      http.post(
        `*/api/template/generate/${encodeURIComponent('typescript')}`,
        () => HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await generateProject('typescript');

    expect(result).toEqual(mockData);
  });

  it('generateModuleProject posts to /template/module_generate/java and returns the response data', async () => {
    const mockData = { message: 'Project initiated successfully' };

    server.use(
      http.post(
        `*/api/template/module_generate/${encodeURIComponent('java')}`,
        () => HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await generateModuleProject('java');

    expect(result).toEqual(mockData);
  });

  it('generateModuleProject posts to /template/module_generate/python and returns the response data', async () => {
    const mockData = { message: 'Project initiated successfully' };

    server.use(
      http.post(
        `*/api/template/module_generate/${encodeURIComponent('python')}`,
        () => HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await generateModuleProject('python');

    expect(result).toEqual(mockData);
  });

  it('generateModuleProject posts to /template/module_generate/javascript and returns the response data', async () => {
    const mockData = { message: 'Project initiated successfully' };

    server.use(
      http.post(
        `*/api/template/module_generate/${encodeURIComponent('javascript')}`,
        () => HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await generateModuleProject('javascript');

    expect(result).toEqual(mockData);
  });

  it('generateModuleProject posts to /template/module_generate/typescript and returns the response data', async () => {
    const mockData = { message: 'Project initiated successfully' };

    server.use(
      http.post(
        `*/api/template/module_generate/${encodeURIComponent('typescript')}`,
        () => HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await generateModuleProject('typescript');

    expect(result).toEqual(mockData);
  });

  it('createUseCase encodes the use case name in the request URL', async () => {
    const useCaseName = 'Add User';
    const encodedName = encodeURIComponent(useCaseName);
    const mockData = {
      message: `Use case '${useCaseName}' created successfully`,
    };

    server.use(
      http.post(`*/api/template/add/${encodedName}`, () =>
        HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await createUseCase(useCaseName);

    expect(result).toEqual(mockData);
  });

  it('createFeature encodes the feature name in the request URL', async () => {
    const featureName = 'feature1';
    const encodedName = encodeURIComponent(featureName);
    const mockData = {
      message: `Feature '${featureName}' created successfully`,
    };

    server.use(
      http.post(`*/api/template/module_add/${encodedName}`, () =>
        HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await createFeature(featureName);

    expect(result).toEqual(mockData);
  });

  it('createModuleUseCase encodes the feature name and use case name in the request URL', async () => {
    const featureName = 'feature1';
    const useCaseName = 'usecase1';
    const encodedFeatureName = encodeURIComponent(featureName);
    const encodedUseCaseName = encodeURIComponent(useCaseName);
    const mockData = {
      message: `Use case '${useCaseName}' created successfully in feature '${featureName}'`,
    };

    server.use(
      http.post(
        `*/api/template/module_add/${encodedFeatureName}/${encodedUseCaseName}`,
        () => HttpResponse.json(mockData, { status: 201 })
      )
    );

    const result = await createModuleUseCase(featureName, useCaseName);

    expect(result).toEqual(mockData);
  });
});
