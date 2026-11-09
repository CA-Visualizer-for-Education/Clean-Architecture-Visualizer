import type { Dirent } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type ReaddirFn = (
  path: string,
  options?: { withFileTypes?: boolean }
) => Promise<Dirent[] | string[]>;

const mockReaddir = jest.fn() as jest.MockedFunction<ReaddirFn>;
const mockReadFile = jest.fn() as jest.MockedFunction<
  (path: string, options: { encoding: string }) => Promise<string>
>;

jest.unstable_mockModule('fs/promises', () => ({
  readdir: mockReaddir,
  readFile: mockReadFile,
  default: {
    readdir: mockReaddir,
    readFile: mockReadFile,
  },
}));

const { FileAccess } = await import('../../../src/data_access/fileAccess.js');

// Helper to create fake directory entries
function mockDir(name: string): Dirent {
  return { name, isDirectory: () => true } as Dirent;
}

function mockFile(name: string): Dirent {
  return { name, isDirectory: () => false } as Dirent;
}

describe('bfsFindDir functionality', () => {
  const fileAccess = new FileAccess();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the src directory when it exists at the top level', async () => {
    mockReaddir.mockResolvedValueOnce([mockDir('src'), mockDir('tests')]);

    const result = await fileAccess.bfsFindDir('/project', 'src');
    expect(result).toBe(path.join('/project', 'src'));
  });

  it('finds src nested one level deep', async () => {
    mockReaddir
      .mockResolvedValueOnce([mockDir('packages')])
      .mockResolvedValueOnce([mockDir('src')]);

    const result = await fileAccess.bfsFindDir('/project', 'src');
    expect(result).toBe(path.join('/project', 'packages', 'src'));
  });

  it('returns null when no src directory exists', async () => {
    mockReaddir
      .mockResolvedValueOnce([mockDir('tests'), mockDir('dist')])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await fileAccess.bfsFindDir('/project', 'src');
    expect(result).toBeNull();
  });

  it('ignores files and only traverses directories', async () => {
    mockReaddir.mockResolvedValueOnce([
      mockFile('index.ts'),
      mockFile('package.json'),
      mockDir('src'),
    ]);

    const result = await fileAccess.bfsFindDir('/project', 'src');
    expect(result).toBe(path.join('/project', 'src'));
  });

  it('returns null for an empty directory', async () => {
    mockReaddir.mockResolvedValueOnce([]);

    const result = await fileAccess.bfsFindDir('/project', 'src');
    expect(result).toBeNull();
  });

  it('finds src at the starting directory itself', async () => {
    mockReaddir.mockResolvedValueOnce([mockDir('src')]);

    const result = await fileAccess.bfsFindDir('/project', 'src');
    expect(result).toBe(path.join('/project', 'src'));
  });
});

describe('getFileImports functionality', () => {
  const fileAccess = new FileAccess();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an empty array for a file with no imports', async () => {
    mockReadFile.mockResolvedValueOnce('const x = 1;\nconsole.log(x);');

    const result = await fileAccess.getFileImports('/project/index.ts');
    expect(result).toEqual([]);
  });

  it('returns a single import', async () => {
    mockReadFile.mockResolvedValueOnce('import fs from "fs/promises";');

    const result = await fileAccess.getFileImports('/project/index.ts');
    expect(result).toEqual([
      { fileName: '"fs/promises"', relationshipType: 'dependency' },
    ]);
  });

  it('returns multiple imports', async () => {
    mockReadFile.mockResolvedValueOnce(
      'import fs from "fs/promises";\nimport path from "path";\nconst x = 1;'
    );

    const result = await fileAccess.getFileImports('/project/index.ts');
    expect(result).toEqual([
      { fileName: '"fs/promises"', relationshipType: 'dependency' },
      { fileName: '"path"', relationshipType: 'dependency' },
    ]);
  });

  it('returns package imports not specified at by an import command', async () => {
    mockReaddir.mockResolvedValueOnce([
      'LoginInputBoundary.java',
      'LoginInputData.java',
    ]);
    mockReadFile.mockResolvedValueOnce(
      'package use_case.login;\nfinal int x = 5\nLoginInputData output = new LoginOutputData()'
    );
    const result = await fileAccess.getFileImports('/project/index.ts');
    expect(result).toEqual([
      { fileName: 'LoginInputData', relationshipType: 'dependency' },
    ]);
  });

  it('returns both package imports and normal imports', async () => {
    mockReaddir.mockResolvedValueOnce([
      'LoginInputBoundary.java',
      'LoginInputData.java',
      'LoginInteractor.java',
    ]);
    mockReadFile.mockResolvedValueOnce(
      'package use_case.login;\nimport entity.User;\npublic class LoginInteractor implements LoginInputBoundary{}'
    );
    const result = await fileAccess.getFileImports(
      '/project/LoginInteractor.java'
    );
    expect(result).toEqual([
      { fileName: 'entity.User', relationshipType: 'dependency' },
      { fileName: 'LoginInputBoundary', relationshipType: 'implements' },
    ]);
  });

  // Test: a Java file that uses a full class name with no import line
  it('returns fully qualified names used without an import', async () => {
    // Pretend the file contains a class that uses entity.User
    mockReadFile.mockResolvedValueOnce(
      'public class A {\n  entity.User u = new entity.User();\n}'
    );
    // Run the function on that pretend file
    const result = await fileAccess.getFileImports('/project/A.java');
    // The answer should be a list with just entity.User in it
    expect(result).toEqual([
      {
        fileName: 'entity.User',
        relationshipType: 'dependency',
      },
    ]);
  });

  // Test: a full class name whose package folders are capitalized
  it('returns fully qualified names with capitalized package folders', async () => {
    // Pretend the file uses a class in the interface_adapter/EnrollStudent/ folder
    mockReadFile.mockResolvedValueOnce(
      'public class A {\n  interface_adapter.EnrollStudent.EnrollStudentViewModel vm;\n}'
    );
    const result = await fileAccess.getFileImports('/project/A.java');
    // The answer should name the whole class, not stop at the EnrollStudent folder
    expect(result).toEqual([
      {
        fileName: 'interface_adapter.EnrollStudent.EnrollStudentViewModel',
        relationshipType: 'dependency',
      },
    ]);
  });

  // Test: a class and its nested class, like Map.Entry, is not a package path
  it('ignores nested class names such as Map.Entry', async () => {
    mockReadFile.mockResolvedValueOnce(
      'public class A {\n  Map.Entry<String, String> e;\n}'
    );
    const result = await fileAccess.getFileImports('/project/A.java');
    expect(result).toEqual([]);
  });

  // Test: this.CONST is not a class name
  it('ignores this.CONST style', async () => {
    mockReadFile.mockResolvedValueOnce(
      'public class A {\n  int x = this.CONST;\n}'
    );
    const result = await fileAccess.getFileImports('/project/A.java');
    expect(result).toEqual([]);
  });

  // Test: a name inside a comment is not a real dependency
  it('ignores fully qualified names in comments', async () => {
    mockReadFile.mockResolvedValueOnce(
      'public class A {\n  // entity.User is not used here\n}'
    );
    const result = await fileAccess.getFileImports('/project/A.java');
    expect(result).toEqual([]);
  });

  it('returns an empty array and logs when the file is not found', async () => {
    mockReadFile.mockRejectedValueOnce(new Error('File not found'));
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const result = await fileAccess.getFileImports('/project/missing.ts');
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      'The file: /project/missing.ts could not be found'
    );
  });

  it('ignores lines that do not start with import', async () => {
    mockReadFile.mockResolvedValueOnce(
      '// import fake from "fake";\nconst x = 1;\nimport real from "real";'
    );

    const result = await fileAccess.getFileImports('/project/index.ts');
    expect(result).toEqual([
      { fileName: '"real"', relationshipType: 'dependency' },
    ]);
  });

  it('detects extends relationship type from package imports', async () => {
    mockReaddir.mockResolvedValueOnce([
      'BaseController.java',
      'LoginController.java',
    ]);
    mockReadFile.mockResolvedValueOnce(
      'package interface_adapter.login;\npublic class LoginController extends BaseController {}'
    );
    const result = await fileAccess.getFileImports(
      '/project/LoginController.java'
    );
    expect(result).toEqual([
      { fileName: 'BaseController', relationshipType: 'extends' },
    ]);
  });

  it('detects implements relationship type from package imports', async () => {
    mockReaddir.mockResolvedValueOnce([
      'LoginInputBoundary.java',
      'LoginInteractor.java',
    ]);
    mockReadFile.mockResolvedValueOnce(
      'package use_case.login;\npublic class LoginInteractor implements LoginInputBoundary {}'
    );
    const result = await fileAccess.getFileImports(
      '/project/LoginInteractor.java'
    );
    expect(result).toEqual([
      { fileName: 'LoginInputBoundary', relationshipType: 'implements' },
    ]);
  });

  it('detects implements on a class imported from another package', async () => {
    mockReaddir.mockResolvedValueOnce(['LoginPresenter.java']);
    mockReadFile.mockResolvedValueOnce(
      'package interface_adapter.login;\n' +
        'import use_case.login.LoginOutputBoundary;\n' +
        'import use_case.login.LoginOutputData;\n' +
        'public class LoginPresenter implements LoginOutputBoundary {\n' +
        '  public void prepareSuccessView(LoginOutputData data) {}\n' +
        '}'
    );
    const result = await fileAccess.getFileImports(
      '/project/LoginPresenter.java'
    );
    expect(result).toEqual([
      {
        fileName: 'use_case.login.LoginOutputBoundary',
        relationshipType: 'implements',
      },
      {
        fileName: 'use_case.login.LoginOutputData',
        relationshipType: 'dependency',
      },
    ]);
  });

  it('detects implements on a TypeScript named import', async () => {
    mockReadFile.mockResolvedValueOnce(
      "import type { LoginInputBoundary } from './loginInputBoundary.js';\n" +
        'export class LoginInteractor implements LoginInputBoundary {}'
    );
    const result = await fileAccess.getFileImports(
      '/project/loginInteractor.ts'
    );
    expect(result).toEqual([
      {
        fileName: "'./loginInputBoundary.js'",
        relationshipType: 'dependency',
      },
      { fileName: 'LoginInputBoundary', relationshipType: 'implements' },
    ]);
  });

  it('reads the package directory using platform path separators', async () => {
    const filePath = path.join(
      'project',
      'use_case',
      'login',
      'LoginInteractor.java'
    );
    mockReaddir.mockResolvedValueOnce([
      'LoginInputBoundary.java',
      'LoginInteractor.java',
    ]);
    mockReadFile.mockResolvedValueOnce(
      'package use_case.login;\npublic class LoginInteractor implements LoginInputBoundary {}'
    );
    const result = await fileAccess.getFileImports(filePath);
    expect(mockReaddir).toHaveBeenCalledWith(path.dirname(filePath));
    expect(result).toEqual([
      { fileName: 'LoginInputBoundary', relationshipType: 'implements' },
    ]);
  });

  it('finds the package declaration after a leading comment', async () => {
    mockReaddir.mockResolvedValueOnce([
      'LoginInputData.java',
      'LoginInteractor.java',
    ]);
    mockReadFile.mockResolvedValueOnce(
      '/*\n * Login use case.\n */\npackage use_case.login;\nLoginInputData data = null;'
    );
    const result = await fileAccess.getFileImports(
      '/project/LoginInteractor.java'
    );
    expect(result).toEqual([
      { fileName: 'LoginInputData', relationshipType: 'dependency' },
    ]);
  });
  it('successfully returns wildcard import along with normal imports', async () => {
    mockReaddir.mockResolvedValueOnce([mockDir('src')]);
    mockReaddir.mockResolvedValueOnce([mockDir('entity')]);
    mockReaddir.mockResolvedValueOnce(['Student.java', 'Course.java']);
    mockReadFile.mockResolvedValueOnce('import entity.*;\nStudent s = null;');
    const result = await fileAccess.getFileImports(
      '/project/LoginInteractor.java'
    );

    expect(result).toEqual([
      { fileName: 'Student', relationshipType: 'dependency' },
    ]);
  });

  it('excludes a wildcard-imported class that is never referenced in the file', async () => {
    mockReaddir.mockResolvedValueOnce([mockDir('src')]);
    mockReaddir.mockResolvedValueOnce([mockDir('entity')]);
    mockReaddir.mockResolvedValueOnce(['Student.java', 'Course.java']);
    mockReadFile.mockResolvedValueOnce(
      'import entity.*;\npublic class LoginInteractor {}'
    );
    const result = await fileAccess.getFileImports(
      '/project/LoginInteractor.java'
    );
    expect(result).toEqual([]);
  });

  it('test a wildcard import with implements and package', async () => {
    mockReaddir.mockResolvedValueOnce([
      'LoginInputBoundary.java',
      'LoginInteractor.java',
    ]);
    mockReaddir.mockResolvedValueOnce([mockDir('src')]);
    mockReaddir.mockResolvedValueOnce([mockDir('entity')]);
    mockReaddir.mockResolvedValueOnce(['Student.java', 'Course.java']);

    mockReadFile.mockResolvedValueOnce(
      'package use_case.login;\nimport entity.*;\npublic class LoginInteractor implements Student {\n Course c = null; \n}'
    );

    const result = await fileAccess.getFileImports(
      '/project/LoginInteractor.java'
    );

    expect(result).toEqual([
      { fileName: 'Student', relationshipType: 'implements' },
      { fileName: 'Course', relationshipType: 'dependency' },
    ]);
  });
});

describe('getUseCases functionality', () => {
  const fileAccess = new FileAccess();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Gets all use cases when packaged by module.', async () => {
    // We want to make sure that when we get use cases, it finds the src and features directories
    mockReaddir
      .mockResolvedValueOnce([mockDir('src')])
      .mockResolvedValueOnce([mockDir('features')])
      .mockResolvedValueOnce([mockDir('feature1'), mockDir('feature2')])
      .mockResolvedValueOnce([mockDir('usecase1')])
      .mockResolvedValueOnce([mockDir('usecase2')]);

    const result = await fileAccess.getUseCases();
    expect(result).toEqual(['usecase1', 'usecase2']);
  });

  it('Gets all use cases when packaged by module (even if there is a use_case directory).', async () => {
    // We want to make sure that when we get use cases, it finds the src and features directories
    mockReaddir
      .mockResolvedValueOnce([mockDir('src')])
      .mockResolvedValueOnce([mockDir('use_case')])
      .mockResolvedValueOnce([mockDir('features')])
      .mockResolvedValueOnce([mockDir('feature1')])
      .mockResolvedValueOnce([mockDir('usecase1')]);

    const result = await fileAccess.getUseCases();
    expect(result).toEqual(['usecase1']);
  });

  it('Returns no use cases when packaged by module when there are no features.', async () => {
    mockReaddir
      .mockResolvedValueOnce([mockDir('src')])
      .mockResolvedValueOnce([mockDir('features')])
      .mockResolvedValueOnce([]);

    const result = await fileAccess.getUseCases();
    expect(result).toEqual([]);
  });

  it('Returns no use cases when packaged by module when there are no use cases.', async () => {
    mockReaddir
      .mockResolvedValueOnce([mockDir('src')])
      .mockResolvedValueOnce([mockDir('features')])
      .mockResolvedValueOnce([mockDir('feature1')])
      .mockResolvedValueOnce([]);

    const result = await fileAccess.getUseCases();
    expect(result).toEqual([]);
  });

  it('Gets all use cases when packaged by layer.', async () => {
    mockReaddir
      .mockResolvedValueOnce([mockDir('src')])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockDir('use_case')])
      .mockResolvedValueOnce([mockDir('usecase1'), mockDir('usecase2')]);

    const result = await fileAccess.getUseCases();
    expect(result).toEqual(['usecase1', 'usecase2']);
  });

  it('Returns no use cases when packaged by layer.', async () => {
    mockReaddir
      .mockResolvedValueOnce([mockDir('src')])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockDir('use_case')])
      .mockResolvedValueOnce([]);

    const result = await fileAccess.getUseCases();
    expect(result).toEqual([]);
  });

  it('Returns no use cases if src directory does not exist.', async () => {
    mockReaddir.mockResolvedValueOnce([]);

    const result = await fileAccess.getUseCases();
    expect(result).toEqual([]);
  });

  it('Returns no use cases if features and use_case directory does not exist.', async () => {
    mockReaddir
      .mockResolvedValueOnce([mockDir('src')])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await fileAccess.getUseCases();
    expect(result).toEqual([]);
  });
});

describe('getFileSnippet functionality', () => {
  const fileAccess = new FileAccess();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully retrieves file snippet from file', async () => {
    mockReadFile.mockResolvedValueOnce(
      'not a line\nimport ../usecase1InputBoundary.py;'
    );
    const res = await fileAccess.getFileSnippet('/src', 'inputBoundary');
    expect(res).toBe('import ../usecase1InputBoundary.py;');
  });

  it('successfully retrieves file snippet from file when target is entity', async () => {
    mockReadFile.mockResolvedValueOnce('import ../entities/entity1.py;');
    const res = await fileAccess.getFileSnippet('/src', 'entity');
    expect(res).toBe('import ../entities/entity1.py;');
  });

  it('successfully retrieves file snippet from file when target is use case interactor', async () => {
    mockReadFile.mockResolvedValueOnce(
      'import ../use_case/usecase1Interactor.py;'
    );
    const res = await fileAccess.getFileSnippet('/src', 'useCaseInteractor');
    expect(res).toBe('import ../use_case/usecase1Interactor.py;');
  });
});
