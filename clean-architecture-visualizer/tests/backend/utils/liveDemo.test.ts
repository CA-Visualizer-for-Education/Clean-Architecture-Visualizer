import fs from 'node:fs';
import path from 'node:path';
import { JavaLanguageParser } from '../../../src/utils/astPreload.js';

describe('Live Demonstration: AST Input vs Output', () => {
  it('correctly maps Java source code to clean architectural dependencies', async () => {
    const parser = new JavaLanguageParser();
    await parser.init();

    const tempDir = path.join(process.cwd(), 'temp_live_demo');
    const entityDir = path.join(tempDir, 'entity');
    const useCaseDir = path.join(tempDir, 'use_case', 'login');
    fs.mkdirSync(entityDir, { recursive: true });
    fs.mkdirSync(useCaseDir, { recursive: true });
    fs.writeFileSync(path.join(entityDir, 'User.java'), 'public class User {}');
    fs.writeFileSync(
      path.join(entityDir, 'GhostUnusedModel.java'),
      'public class GhostUnusedModel {}'
    );
    fs.writeFileSync(
      path.join(useCaseDir, 'LoginInputBoundary.java'),
      'public interface LoginInputBoundary {}'
    );
    fs.writeFileSync(
      path.join(useCaseDir, 'LoginOutputBoundary.java'),
      'public interface LoginOutputBoundary {}'
    );

    const sampleJavaCode = `package interface_adapter.login;

// 1. Explicit import & ACTUALLY USED in class body
import entity.User;

// 2. Explicit import but NEVER USED (must be excluded)
import entity.GhostUnusedModel;

// 3. Wildcard import (only LoginInputBoundary is used)
import use_case.login.*;

public class LoginController {
  private User currentUser;

  public void handle(LoginInputBoundary interactor) {
    System.out.println("Processing login...");
  }
}`;

    try {
      const result = await parser.extractDependencies(
        sampleJavaCode,
        path.join(tempDir, 'LoginController.java'),
        tempDir
      );

      console.log(`\n${'='.repeat(60)}`);
      console.log('>>> [ INPUT: RAW JAVA SOURCE CODE ] >>>');
      console.log('='.repeat(60));
      console.log(sampleJavaCode);
      console.log('='.repeat(60));

      console.log(`\n${'='.repeat(60)}`);
      console.log('>>> [ OUTPUT: PARSED ARCHITECTURAL DEPENDENCIES ] >>>');
      console.log('='.repeat(60));
      console.log(JSON.stringify(result, null, 2));
      console.log('='.repeat(60));
      console.log(
        '  ✔ "User"               -> INCLUDED (Found in field: private User currentUser)'
      );
      console.log(
        '  ✔ "LoginInputBoundary" -> INCLUDED (Wildcard matched & found in parameter: LoginInputBoundary interactor)'
      );
      console.log(
        '  ✘ "GhostUnusedModel"   -> FILTERED OUT (Never used anywhere in body)'
      );
      console.log(
        '  ✘ "LoginOutputBoundary"-> FILTERED OUT (Wildcard item not referenced in body)'
      );
      console.log(`${'='.repeat(60)}\n`);

      expect(result).toContain('User');
      expect(result).toContain('LoginInputBoundary');
      expect(result).not.toContain('GhostUnusedModel');
      expect(result).not.toContain('LoginOutputBoundary');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
