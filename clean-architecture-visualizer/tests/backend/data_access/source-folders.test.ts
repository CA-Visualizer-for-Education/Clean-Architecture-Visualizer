import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { FileAccess } from '../../../src/data_access/fileAccess.js';
import { CreateFeatureInputData } from '../../../src/use_case/createFeature/createFeatureInputData.js';
import { CreateFeatureInteractor } from '../../../src/use_case/createFeature/createFeatureInteractor.js';
import { CreateFeatureOutputData } from '../../../src/use_case/createFeature/createFeatureOutputData.js';
import { CreateModuleUseCaseInputData } from '../../../src/use_case/createModuleUseCase/createModuleUseCaseInputData.js';
import { CreateModuleUseCaseInteractor } from '../../../src/use_case/createModuleUseCase/createModuleUseCaseInteractor.js';
import { CreateModuleUseCaseOutputData } from '../../../src/use_case/createModuleUseCase/createModuleUseCaseOutputData.js';
import { CreateUseCaseInputData } from '../../../src/use_case/createUseCase/createUseCaseInputData.js';
import { CreateUseCaseInteractor } from '../../../src/use_case/createUseCase/createUseCaseInteractor.js';
import { CreateUseCaseOutputData } from '../../../src/use_case/createUseCase/createUseCaseOutputData.js';

// A Maven project after `mvn compile`: target/classes/ copies the layer
// folders, one level shallower than src/main/java/, and src/test/java/ has
// the same folders at the same depth.
describe('Project folders are found in the main source, not build output or tests', () => {
  let project: string;
  const presenter = { showSuccessView: jest.fn(), showFailView: jest.fn() };

  const makeFolders = async (...folders: string[]) => {
    for (const folder of folders) {
      await fs.mkdir(path.join(project, folder), { recursive: true });
    }
  };

  beforeEach(async () => {
    project = await fs.mkdtemp(path.join(os.tmpdir(), 'cave-test-'));
    jest.spyOn(process, 'cwd').mockReturnValue(project);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await fs.rm(project, { recursive: true, force: true });
  });

  it('creates a use case in src/main/java when packaging by layer', async () => {
    await makeFolders(
      'target/classes/use_case/login',
      'target/classes/interface_adapter/login',
      'src/main/java/use_case/login',
      'src/main/java/interface_adapter/login',
      'src/test/java/use_case/login'
    );

    await new CreateUseCaseInteractor(
      new FileAccess(),
      presenter,
      new CreateUseCaseOutputData()
    ).execute(new CreateUseCaseInputData('Logout'));

    const main = path.join(project, 'src/main/java');
    await expect(
      fs.readdir(path.join(main, 'use_case/Logout'))
    ).resolves.toContain('LogoutUseCaseInteractor.java');
    await expect(
      fs.readdir(path.join(main, 'interface_adapter/Logout'))
    ).resolves.toContain('LogoutController.java');
    await expect(
      fs.readdir(path.join(project, 'target/classes/use_case'))
    ).resolves.toEqual(['login']);
    await expect(
      fs.readdir(path.join(project, 'src/test/java/use_case'))
    ).resolves.toEqual(['login']);
  });

  it('creates a feature in src/main/java when packaging by module', async () => {
    await makeFolders(
      'target/classes/features/Enrollment',
      'src/main/java/features/Enrollment'
    );

    await new CreateFeatureInteractor(
      new FileAccess(),
      presenter,
      new CreateFeatureOutputData()
    ).execute(new CreateFeatureInputData('Grading'));

    await expect(
      fs.readdir(path.join(project, 'src/main/java/features'))
    ).resolves.toContain('Grading');
    await expect(
      fs.readdir(path.join(project, 'target/classes/features'))
    ).resolves.toEqual(['Enrollment']);
  });

  it('creates a module use case in src/main/java when packaging by module', async () => {
    await makeFolders(
      'target/classes/features/Enrollment',
      'src/main/java/features/Enrollment'
    );

    await new CreateModuleUseCaseInteractor(
      new FileAccess(),
      presenter,
      new CreateModuleUseCaseOutputData()
    ).execute(new CreateModuleUseCaseInputData('Enrollment', 'DropStudent'));

    await expect(
      fs.readdir(path.join(project, 'src/main/java/features/Enrollment'))
    ).resolves.toContain('DropStudent');
    await expect(
      fs.readdir(path.join(project, 'target/classes/features/Enrollment'))
    ).resolves.toEqual([]);
  });

  it('lists the use cases in src/main/java when packaging by module', async () => {
    await makeFolders(
      'target/classes/features/Enrollment/OldUseCase',
      'src/main/java/features/Enrollment/EnrollStudent'
    );

    await expect(new FileAccess().getUseCases()).resolves.toEqual([
      'EnrollStudent',
    ]);
  });

  it('lists the use cases in src/main, not src/test, when packaging by layer', async () => {
    // src/test/use_case is shallower than src/main/java/use_case, so a search
    // that enters src/test finds it first, whatever order folders are listed in.
    await makeFolders(
      'src/main/java/use_case/login',
      'src/main/java/use_case/logout',
      'src/test/use_case/login'
    );

    const useCases = await new FileAccess().getUseCases();
    expect(useCases.sort()).toEqual(['login', 'logout']);
  });
});
