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

  it('Scenario: Interface Single Inheritance (interface X extends Y)', async () => {
    const parentFile = path.join(tempDir, 'entity', 'Y.java');
    const thisFile = path.join(tempDir, 'use_case', 'X.java');
    const code = `
      package use_case;
      import entity.Y;
      public interface X extends Y {}
    `;
    const result = await parser.extractDependencies(code, thisFile, [
      thisFile,
      parentFile,
    ]);

    expect(result).toEqual([{ fileName: 'Y', relationshipType: 'extends' }]);
  });

  it('Scenario: Interface Multi Inheritance (interface X extends Y, Z)', async () => {
    const parentY = path.join(tempDir, 'entity', 'Y.java');
    const parentZ = path.join(tempDir, 'entity', 'Z.java');
    const thisFile = path.join(tempDir, 'use_case', 'X.java');
    const code = `
      package use_case;
      import entity.Y;
      import entity.Z;
      public interface X extends Y, Z {}
    `;
    const result = await parser.extractDependencies(code, thisFile, [
      thisFile,
      parentY,
      parentZ,
    ]);

    expect(result).toEqual([
      { fileName: 'Y', relationshipType: 'extends' },
      { fileName: 'Z', relationshipType: 'extends' },
    ]);
  });

  it('Scenario: Generic Superclass (class A extends Base<T>)', async () => {
    const baseFile = path.join(tempDir, 'use_case', 'BasePresenter.java');
    const thisFile = path.join(tempDir, 'use_case', 'LoginPresenter.java');
    const code = `
      package use_case;
      public class LoginPresenter extends BasePresenter<String> {}
    `;
    const result = await parser.extractDependencies(code, thisFile, [
      thisFile,
      baseFile,
    ]);

    expect(result).toEqual([
      { fileName: 'BasePresenter', relationshipType: 'extends' },
    ]);
  });

  it('Scenario: Class Implements Interfaces (class A implements B, C)', async () => {
    const code = `
      package test;
      public class LoginInteractor implements LoginInputBoundary, Auditable {}
    `;
    const thisFile = path.join(tempDir, 'LoginInteractor.java');
    const result = await parser.extractDependencies(code, thisFile, [thisFile]);

    expect(result).toEqual([
      { fileName: 'LoginInputBoundary', relationshipType: 'implements' },
      { fileName: 'Auditable', relationshipType: 'implements' },
    ]);
  });

  it('Scenario: FQN Fields (private entity.User user;)', async () => {
    const userFile = path.join(tempDir, 'entity', 'User.java');
    const thisFile = path.join(tempDir, 'use_case', 'Service.java');
    const code = `
      package use_case;
      public class Service {
        private entity.User user;
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [
      thisFile,
      userFile,
    ]);

    expect(result).toEqual([
      { fileName: 'User', relationshipType: 'dependency' },
    ]);
  });

  it('Scenario: FQN Methods & Return (entity.User get(entity.User u))', async () => {
    const userFile = path.join(tempDir, 'entity', 'User.java');
    const thisFile = path.join(tempDir, 'use_case', 'Service.java');
    const code = `
      package use_case;
      public class Service {
        public entity.User get(entity.User u) {
          return u;
        }
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [
      thisFile,
      userFile,
    ]);

    expect(result).toEqual([
      { fileName: 'User', relationshipType: 'dependency' },
    ]);
  });

  it('Scenario: FQN Generic Arguments (List<entity.User> list)', async () => {
    const userFile = path.join(tempDir, 'entity', 'User.java');
    const thisFile = path.join(tempDir, 'use_case', 'Service.java');
    const code = `
      package use_case;
      public class Service {
        public void load(java.util.List<entity.User> list) {}
      }
    `;
    const result = await parser.extractDependencies(code, thisFile, [
      thisFile,
      userFile,
    ]);

    expect(result).toEqual([
      { fileName: 'User', relationshipType: 'dependency' },
    ]);
  });

  it('Scenario: Same-Package Sibling Resolution (no import required)', async () => {
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

  it('Scenario: Wildcard Import to Referenced Symbols (import entity.*)', async () => {
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

  it('Scenario: Unused Import Exclusion (import entity.Unused;)', async () => {
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

  it('Scenario: Standard Single-Type Import (import entity.User;)', async () => {
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
