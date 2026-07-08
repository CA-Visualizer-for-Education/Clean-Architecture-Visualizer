#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load package.json synchronously for compatibility with compiled output
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

import { AppBuilder } from './appBuilder.js';
import { FileAccess } from '../data_access/fileAccess.js';
import { CleanArchAccess } from '../data_access/cleanArchInfoAccess.js';
import { SessionDBAccess } from '../data_access/sessionDBAccess.js';
import { GraphVerificationController } from '../interface_adapter/graphVerification/graphVerificationController.js';
import { GraphVerificationInteractor } from '../use_case/graphVerification/graphVerificationInteractor.js';
import { startCommand } from '../server/startCommand.js';
import { InitProjectInteractor } from '../use_case/initProject/initProjectInteractor.js';
import { InitModuleProjectInteractor } from '../use_case/initModuleProject/initModuleProjectInteractor.js';
import { CreateUseCaseController } from '../interface_adapter/createUseCase/createUseCaseController.js';
import { InitProjectController } from '../interface_adapter/initProject/initProjectController.js';
import { InitModuleProjectController } from '../interface_adapter/initModuleProject/initModuleProjectController.js';
import { CreateFeatureController } from '../interface_adapter/createFeature/createFeatureController.js';
import { CreateModuleUseCaseController } from '../interface_adapter/CreateModuleUseCase/createModuleUseCaseController.js';

const program = new Command();

const app = new AppBuilder()
  .withFileAccess(new FileAccess())
  .withCleanArchAccess(new CleanArchAccess())
  .withSessionDBAccess(new SessionDBAccess())
  .buildGraphVerificationInteractor(GraphVerificationInteractor)
  .buildCreateUseCaseInteractor()
  .buildCreateFeatureInteractor()
  .buildCreateModuleUseCaseInteractor()
  .buildInitProjectInteractor(InitProjectInteractor)
  .buildInitModuleProjectInteractor(InitModuleProjectInteractor)
  .buildGraphVerificationController(GraphVerificationController)
  .buildCreateUseCaseController(CreateUseCaseController)
  .buildCreateFeatureController(CreateFeatureController)
  .buildInitProjectController(InitProjectController)
  .buildInitModuleProjectController(InitModuleProjectController)
  .buildCreateModuleUseCaseController(CreateModuleUseCaseController);

program.version(packageJson.version);

program
  .command('start')
  .description('Start backend server and frontend dev server')
  .option('--backend-only', 'Start only the backend server', false)
  .action(async (options) => {
    app.runGraphVerification();
    await startCommand({ backendOnly: options.backendOnly });
  });

program
  .command('verify')
  .description(
    'Verify whether the use cases found in child directories adhere to Clean Architeccture'
  )
  .action(async () => {
    app.runCLIGraphVerification();
  });

program
  .command('init')
  .description('Create the template for a new CSC207 project')
  .action(async () => {
    app.runInitProject();
  });

program
  .command('module_init')
  .description(
    'Create the template for a new CSC207 project, packaged by module.'
  )
  .action(async () => {
    app.runInitModuleProject();
  });

program
  .command('usecase <name>')
  .description('Create the template for a new use case')
  .action(async (name: string) => {
    app.runCreateUseCase(name);
  });

program
  .command('module_usecase <feature> <usecase>')
  .description('Add a new use case to a specified feature.')
  .action(async (feature: string, usecase: string) => {
    app.runCreateModuleUseCase(feature, usecase);
  });

program
  .command('feature <feature>')
  .description('Add a new feature to the directory of features.')
  .action(async (feature: string) => {
    app.runCreateFeature(feature);
  });

program
  .command('end')
  .description('Close the express server and clean the tempdir')
  .action(async () => {
    await app.runEndProject();
  });

program.parse(process.argv);
