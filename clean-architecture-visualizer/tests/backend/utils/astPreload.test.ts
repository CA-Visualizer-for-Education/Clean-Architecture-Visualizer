import fs from 'node:fs';
import path from 'node:path';
import {
  dependencyCache,
  JavaLanguageParser,
  preloadDependencies,
} from '../../../src/utils/astPreload.js';

describe('AST Preload & Dependency Extraction Engine', () => {
  const parser = new JavaLanguageParser();

  beforeAll(async () => {
    await parser.init();
  });

  it('extracts specific import only when it is actually used in the code', async () => {
    const code = `
      package interface_adapter.login;
      import entity.User;
      import entity.Order;

      public class LoginController {
        private User user;
      }
    `;

    // Here, User is used, but Order is NOT used.
    const deps = await parser.extractDependencies(
      code,
      '/mock/LoginController.java',
      '/mock'
    );
    expect(deps).toContain('User');
    expect(deps).not.toContain('Order');
  });

  it('resolves wildcard imports to actual used symbols from package directory', async () => {
    // Create temporary package directory
    const tempDir = path.join(process.cwd(), 'temp_test_pkg');
    const entityDir = path.join(tempDir, 'entity');
    fs.mkdirSync(entityDir, { recursive: true });
    fs.writeFileSync(path.join(entityDir, 'User.java'), 'public class User {}');
    fs.writeFileSync(
      path.join(entityDir, 'Product.java'),
      'public class Product {}'
    );

    const code = `
      package interface_adapter.login;
      import entity.*;

      public class LoginController {
        public void handle(User user) {
        }
      }
    `;

    try {
      const deps = await parser.extractDependencies(
        code,
        path.join(tempDir, 'LoginController.java'),
        tempDir
      );
      // User is used in method parameter, so it must be resolved
      expect(deps).toContain('User');
      // Product is not used in class body, so it must NOT be resolved
      expect(deps).not.toContain('Product');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('does not resolve wildcard import when no class from package is used', async () => {
    const tempDir = path.join(process.cwd(), 'temp_test_unused');
    const entityDir = path.join(tempDir, 'entity');
    fs.mkdirSync(entityDir, { recursive: true });
    fs.writeFileSync(path.join(entityDir, 'User.java'), 'public class User {}');

    const code = `
      package interface_adapter.login;
      import entity.*;

      public class LoginController {
        private String name;
      }
    `;

    try {
      const deps = await parser.extractDependencies(
        code,
        path.join(tempDir, 'LoginController.java'),
        tempDir
      );
      expect(deps).toEqual([]);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('preloads project files into dependencyCache', async () => {
    const tempProject = path.join(process.cwd(), 'temp_proj');
    const srcDir = path.join(tempProject, 'src', 'demo');
    fs.mkdirSync(srcDir, { recursive: true });
    const javaFile = path.join(srcDir, 'App.java');
    fs.writeFileSync(
      javaFile,
      `
      package demo;
      import demo.Helper;
      public class App {
        Helper helper;
      }
    `
    );

    try {
      await preloadDependencies(tempProject);
      const normalized = javaFile.replace(/\\/g, '/');
      expect(dependencyCache.has(normalized)).toBe(true);
      expect(dependencyCache.get(normalized)).toEqual(['Helper']);
    } finally {
      fs.rmSync(tempProject, { recursive: true, force: true });
    }
  });
});
