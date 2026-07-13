import chalk from 'chalk';

import type { FileAccess } from '../data_access/fileAccess.js';
import type { CleanArchAccess } from '../data_access/cleanArchInfoAccess.js';
import type { SessionDBAccess } from '../data_access/sessionDBAccess.js';

import { GraphVerificationController } from '../interface_adapter/graphVerification/graphVerificationController.js';
import type { GraphVerificationInputBoundary } from '../use_case/graphVerification/graphVerificationInputBoundary.js';
import { GraphVerificationOutputData } from '../use_case/graphVerification/graphVerificationOutputData.js';
import { GraphVerificationPresenter } from '../interface_adapter/graphVerification/graphVerificationPresenter.js';
import type { useCaseGraph } from '../entity/useCaseGraph.js';
import type { InitProjectInputBoundary } from '../use_case/initProject/initProjectInputBoundary.js';
import type { InitProjectController } from '../interface_adapter/initProject/initProjectController.js';
import type { InitModuleProjectInputBoundary } from '../use_case/initModuleProject/initModuleProjectInputBoundary.js';
import type { InitModuleProjectController } from '../interface_adapter/initModuleProject/initModuleProjectController.js';
import type { CreateUseCaseInputBoundary } from '../use_case/createUseCase/createUseCaseInputBoundary.js';
import type { CreateUseCaseController } from '../interface_adapter/createUseCase/createUseCaseController.js';
import type { CreateFeatureInputBoundary } from '../use_case/createFeature/createFeatureInputBoundary.js';
import type { CreateFeatureController } from '../interface_adapter/createFeature/createFeatureController.js';
import type { CreateModuleUseCaseInputBoundary } from '../use_case/createModuleUseCase/createModuleUseCaseInputBoundary.js';
import type { CreateModuleUseCaseController } from '../interface_adapter/CreateModuleUseCase/createModuleUseCaseController.js';
import { InitProjectOutputData } from '../use_case/initProject/initProjectOutputData.js';
import { InitModuleProjectOutputData } from '../use_case/initModuleProject/initModuleProjectOutputData.js';
import { CreateUseCaseInteractor } from '../use_case/createUseCase/createUseCaseInteractor.js';
import { CreateUseCasePresenter } from '../interface_adapter/createUseCase/createUseCasePresenter.js';
import { CreateFeatureInteractor } from '../use_case/createFeature/createFeatureInteractor.js';
import { CreateFeaturePresenter } from '../interface_adapter/createFeature/createFeaturePresenter.js';
import { CreateModuleUseCaseInteractor } from '../use_case/createModuleUseCase/createModuleUseCaseInteractor.js';
import { CreateModuleUseCasePresenter } from '../interface_adapter/CreateModuleUseCase/createModuleUseCasePresenter.js';

import { stopServer } from '../server/server.js';
import type { GraphVerificationOutputBoundary } from '../use_case/graphVerification/graphVerificationOutputBoundary.js';

export class AppBuilder {
  private fileAccess?: FileAccess;
  private cleanArchAccess?: CleanArchAccess;
  private db?: SessionDBAccess;
  private graphVerificationInteractor?: GraphVerificationInputBoundary;
  private graphVerificationController?: GraphVerificationController;
  private graphVerificationOutputData?: GraphVerificationOutputData;
  private graphVerificationPresenter?: GraphVerificationOutputBoundary;
  private initProjectInteractor?: InitProjectInputBoundary;
  private initProjectController?: InitProjectController;
  private initModuleProjectInteractor?: InitModuleProjectInputBoundary;
  private initModuleProjectController?: InitModuleProjectController;
  private createUseCaseInteractor?: CreateUseCaseInputBoundary;
  private createUseCaseController?: CreateUseCaseController;
  private createFeatureInteractor?: CreateFeatureInputBoundary;
  private createFeatureController?: CreateFeatureController;
  private createModuleUseCaseInteractor?: CreateModuleUseCaseInputBoundary;
  private createModuleUseCaseController?: CreateModuleUseCaseController;

  // Data Access Layer
  withFileAccess(fileAccess: FileAccess): this {
    this.fileAccess = fileAccess;
    return this;
  }

  withCleanArchAccess(access: CleanArchAccess): this {
    this.cleanArchAccess = access;
    return this;
  }

  withSessionDBAccess(db: SessionDBAccess): this {
    this.db = db;
    return this;
  }

  // Use Case Layer
  buildGraphVerificationInteractor(
    InteractorClass: new (
      fileAccess: FileAccess,
      cleanArchAccess: CleanArchAccess,
      db: SessionDBAccess,
      presenter: GraphVerificationOutputBoundary,
      useCaseGraphList: useCaseGraph[],
      outputData: GraphVerificationOutputData
    ) => GraphVerificationInputBoundary
  ): this {
    if (!this.fileAccess || !this.cleanArchAccess || !this.db) {
      throw new Error(
        'FileAccess, CleanArchAccess, and SessionDBAccess must be set before building interactor'
      );
    }
    this.graphVerificationOutputData = new GraphVerificationOutputData();
    this.graphVerificationPresenter = new GraphVerificationPresenter();

    this.graphVerificationInteractor = new InteractorClass(
      this.fileAccess,
      this.cleanArchAccess,
      this.db,
      this.graphVerificationPresenter,
      [],
      this.graphVerificationOutputData
    );
    return this;
  }

  buildCreateUseCaseInteractor(): this {
    if (!this.fileAccess) {
      throw new Error(
        'FileAccess must be set before building CreateUseCaseInteractor'
      );
    }
    const createUseCasePresenter = new CreateUseCasePresenter();
    this.createUseCaseInteractor = new CreateUseCaseInteractor(
      this.fileAccess,
      createUseCasePresenter
    );
    return this;
  }

  buildCreateFeatureInteractor(): this {
    if (!this.fileAccess) {
      throw new Error(
        'FileAccess must be set before building CreateFeatureInteractor'
      );
    }
    const createFeaturePresenter = new CreateFeaturePresenter();
    this.createFeatureInteractor = new CreateFeatureInteractor(
      this.fileAccess,
      createFeaturePresenter
    );
    return this;
  }

  buildCreateModuleUseCaseInteractor(): this {
    if (!this.fileAccess) {
      throw new Error(
        'FileAccess must be set before building CreateModuleUseCaseInteractor'
      );
    }
    const createModuleUseCasePresenter = new CreateModuleUseCasePresenter();
    this.createModuleUseCaseInteractor = new CreateModuleUseCaseInteractor(
      this.fileAccess,
      createModuleUseCasePresenter
    );
    return this;
  }

  buildInitProjectInteractor(
    InteractorClass: new (
      fileAccess: FileAccess,
      outputData?: InitProjectOutputData
    ) => InitProjectInputBoundary
  ): this {
    if (!this.fileAccess) {
      throw new Error(
        'FileAccess must be set before building InitProjectInteractor'
      );
    }
    this.initProjectInteractor = new InteractorClass(this.fileAccess);
    return this;
  }

  buildInitModuleProjectInteractor(
    InteractorClass: new (
      fileAccess: FileAccess,
      outputData?: InitModuleProjectOutputData
    ) => InitModuleProjectInputBoundary
  ): this {
    if (!this.fileAccess) {
      throw new Error(
        'FileAccess must be set before building InitModuleProjectInteractor'
      );
    }
    this.initModuleProjectInteractor = new InteractorClass(this.fileAccess);
    return this;
  }

  // Controller Layer
  buildGraphVerificationController(
    ControllerClass: new (
      interactor: GraphVerificationInputBoundary
    ) => GraphVerificationController
  ): this {
    if (!this.graphVerificationInteractor) {
      throw new Error(
        'GraphVerificationInteractor must be built before controller'
      );
    }

    this.graphVerificationController = new ControllerClass(
      this.graphVerificationInteractor
    );
    return this;
  }

  buildInitProjectController(
    ControllerClass: new (
      interactor: InitProjectInputBoundary
    ) => InitProjectController
  ): this {
    if (!this.initProjectInteractor) {
      throw new Error('InitProjectInteractor must be built before controller');
    }

    this.initProjectController = new ControllerClass(
      this.initProjectInteractor
    );
    return this;
  }

  buildInitModuleProjectController(
    ControllerClass: new (
      interactor: InitModuleProjectInputBoundary
    ) => InitModuleProjectController
  ): this {
    if (!this.initModuleProjectInteractor) {
      throw new Error(
        'InitModuleProjectInteractor must be built before controller'
      );
    }

    this.initModuleProjectController = new ControllerClass(
      this.initModuleProjectInteractor
    );
    return this;
  }

  buildCreateUseCaseController(
    ControllerClass: new (
      interactor: CreateUseCaseInputBoundary
    ) => CreateUseCaseController
  ): this {
    if (!this.createUseCaseInteractor) {
      throw new Error(
        'CreateUseCaseInteractor must be built before controller'
      );
    }
    this.createUseCaseController = new ControllerClass(
      this.createUseCaseInteractor
    );
    return this;
  }

  buildCreateModuleUseCaseController(
    ControllerClass: new (
      interactor: CreateModuleUseCaseInputBoundary
    ) => CreateModuleUseCaseController
  ): this {
    if (!this.createModuleUseCaseInteractor) {
      throw new Error(
        'CreateModuleUseCaseInteractor must be built before controller.'
      );
    }
    this.createModuleUseCaseController = new ControllerClass(
      this.createModuleUseCaseInteractor
    );
    return this;
  }

  buildCreateFeatureController(
    ControllerClass: new (
      interactor: CreateFeatureInputBoundary
    ) => CreateFeatureController
  ): this {
    if (!this.createFeatureInteractor) {
      throw new Error(
        'CreateFeatureInteractor must be built before controller'
      );
    }
    this.createFeatureController = new ControllerClass(
      this.createFeatureInteractor
    );
    return this;
  }

  build() {
    return {
      fileAccess: this.fileAccess!,
      validOutNeighbourAccess: this.cleanArchAccess!,
      graphVerificationInteractor: this.graphVerificationInteractor!,
      initProjectInteractor: this.initProjectInteractor!,
      initModuleProjectInteractor: this.initModuleProjectInteractor!,
      createUseCaseInteractor: this.createUseCaseInteractor!,
      createUseCaseController: this.createUseCaseController!,
      createModuleUseCaseInteractor: this.createModuleUseCaseInteractor!,
      createModuleUseCaseController: this.createModuleUseCaseController,
      createFeatureInteractor: this.createFeatureInteractor!,
      createFeatureController: this.createFeatureController!,
      graphVerificationController: this.graphVerificationController!,
      initProjectController: this.initProjectController!,
      initModuleProjectController: this.initModuleProjectController!,
    };
  }

  runGraphVerification() {
    const formatForCLI = false; // run from app
    this.graphVerificationController?.execute(formatForCLI);
  }

  async runCLIGraphVerification() {
    const formatForCLI = true; // run in terminal
    await this.graphVerificationController?.execute(formatForCLI);
  }

  runInitProject() {
    this.initProjectController?.execute();
    console.log(chalk.green('Your project has been initialized.'));
  }

  runInitModuleProject() {
    this.initModuleProjectController?.execute();
    console.log(
      chalk.green('Your project packaged by module has been initialized.')
    );
  }

  runCreateUseCase(name: string) {
    this.createUseCaseController?.execute(name);
  }

  runCreateFeature(feature: string) {
    this.createFeatureController?.execute(feature);
  }

  runCreateModuleUseCase(feature: string, name: string) {
    this.createModuleUseCaseController?.execute(feature, name);
  }

  async runEndProject() {
    this.db?.resetDB();
    await stopServer();
  }
}
