import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';
import { JavaLanguageParser } from '../../../src/utils/parsers/java-language-parser.js';

describe('JavaLanguageParser AST Dependency Extraction', () => {
  const parser = new JavaLanguageParser();
  let tempDir: string;

  beforeAll(async () => {
    await parser.init();
  });

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cave-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('detects implements and extends relationships with exact types', async () => {
    const code = `
      package test;
      public class LoginInteractor extends BaseInteractor implements LoginInputBoundary, Auditable {}
    `;
    const thisFile = path.join(tempDir, 'LoginInteractor.java');
    const result = await parser.extractDependencies(code, thisFile, [thisFile]);

    expect(result).toEqual([
      { fileName: 'BaseInteractor', relationshipType: 'extends' },
      { fileName: 'LoginInputBoundary', relationshipType: 'implements' },
      { fileName: 'Auditable', relationshipType: 'implements' },
    ]);
  });

  it('implicitly resolves same-package sibling classes without import', async () => {
    const siblingFile = path.join(tempDir, 'Presenter.java');
    const thisFile = path.join(tempDir, 'Controller.java');

    const code = `
      package test;
      public class Controller {
        private Presenter presenter;
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [
      thisFile,
      siblingFile,
    ]);

    expect(result).toEqual([
      { fileName: 'Presenter', relationshipType: 'dependency' },
    ]);
  });

  it('resolves wildcard star import (*) to only referenced symbols (Case 3)', async () => {
    const userPath = path.join(tempDir, 'entity', 'User.java');
    const unusedPath = path.join(tempDir, 'entity', 'GhostUnused.java');
    const thisFile = path.join(tempDir, 'Controller.java');

    const code = `
      package test;
      import entity.*;
      public class Controller {
        private User user;
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [
      thisFile,
      userPath,
      unusedPath,
    ]);

    expect(result).toEqual([
      { fileName: 'User', relationshipType: 'dependency' },
    ]);
  });

  it('handles multiple imports declared on a single line (Case 4)', async () => {
    const thisFile = path.join(tempDir, 'Controller.java');
    const code = `
      package test;
      import entity.User; import use_case.login.LoginInputBoundary;
      public class Controller {
        private User user;
        private LoginInputBoundary interactor;
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [thisFile]);

    expect(result).toContainEqual({
      fileName: 'User',
      relationshipType: 'dependency',
    });
    expect(result).toContainEqual({
      fileName: 'LoginInputBoundary',
      relationshipType: 'dependency',
    });
  });

  it('excludes unused imports from recorded dependencies (Case 5)', async () => {
    const thisFile = path.join(tempDir, 'Service.java');
    const code = `
      package test;
      import entity.User;
      import entity.GhostUnused;
      public class Service {
        private User user;
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [thisFile]);

    expect(result).toEqual([
      { fileName: 'User', relationshipType: 'dependency' },
    ]);
    expect(result.some((r) => r.fileName === 'GhostUnused')).toBe(false);
  });

  it('handles multiline formatted imports cleanly (Case 6)', async () => {
    const thisFile = path.join(tempDir, 'Service.java');
    const code = `
      package test;
      import
        entity.User;
      public class Service {
        private User user;
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [thisFile]);

    expect(result).toEqual([
      { fileName: 'User', relationshipType: 'dependency' },
    ]);
  });

  it('strips inline comments completely from import declarations (Case 7)', async () => {
    const thisFile = path.join(tempDir, 'Service.java');
    const code = `
      package test;
      import entity.User; // this is an inline comment
      public class Service {
        private User user;
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [thisFile]);

    expect(result).toEqual([
      { fileName: 'User', relationshipType: 'dependency' },
    ]);
  });

  it('handles spaces preceding trailing semicolons (Case 9)', async () => {
    const thisFile = path.join(tempDir, 'Service.java');
    const code = `
      package test;
      import entity.User ;
      public class Service {
        private User user;
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [thisFile]);

    expect(result).toEqual([
      { fileName: 'User', relationshipType: 'dependency' },
    ]);
  });

  it('resolves standard single-type import (Case 1)', async () => {
    const thisFile = path.join(tempDir, 'Service.java');
    const code = `
      package test;
      import entity.User;
      public class Service {
        private User user;
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [thisFile]);

    expect(result).toEqual([
      { fileName: 'User', relationshipType: 'dependency' },
    ]);
  });
});
