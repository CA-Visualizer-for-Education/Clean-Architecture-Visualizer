import { Router } from 'express';
import { FileAccess } from '../../data_access/fileAccess.js';
import { InitProjectOutputData } from '../../use_case/initProject/initProjectOutputData.js';
import { InitProjectInteractor } from '../../use_case/initProject/initProjectInteractor.js';
import { InitProjectController } from '../../interface_adapter/initProject/initProjectController.js';
import { InitProjectPresenter } from '../../interface_adapter/initProject/initProjectPresenter.js';
import { InitModuleProjectOutputData } from '../../use_case/initModuleProject/initModuleProjectOutputData.js';
import { InitModuleProjectInteractor } from '../../use_case/initModuleProject/initModuleProjectInteractor.js';
import { InitModuleProjectController } from '../../interface_adapter/initModuleProject/initModuleProjectController.js';
import { InitModuleProjectPresenter } from '../../interface_adapter/initModuleProject/initModuleProjectPresenter.js';
import { CreateUseCaseInteractor } from '../../use_case/createUseCase/createUseCaseInteractor.js';
import { CreateUseCaseController } from '../../interface_adapter/createUseCase/createUseCaseController.js';
import { CreateUseCasePresenter } from '../../interface_adapter/createUseCase/createUseCasePresenter.js';
import { CreateFeatureInteractor } from '../../use_case/createFeature/createFeatureInteractor.js';
import { CreateFeatureController } from '../../interface_adapter/createFeature/createFeatureController.js';
import { CreateFeaturePresenter } from '../../interface_adapter/createFeature/createFeaturePresenter.js';
import { CreateModuleUseCaseInteractor } from '../../use_case/createModuleUseCase/createModuleUseCaseInteractor.js';
import { CreateModuleUseCaseController } from '../../interface_adapter/CreateModuleUseCase/createModuleUseCaseController.js';
import { CreateModuleUseCasePresenter } from '../../interface_adapter/CreateModuleUseCase/createModuleUseCasePresenter.js';

const router = Router();

const fileAccess = new FileAccess();

router.post('/template/generate', async (_req, res) => {
  const outputData = new InitProjectOutputData();
  const interactor = new InitProjectInteractor(fileAccess, outputData);
  const controller = new InitProjectController(interactor);
  const presenter = new InitProjectPresenter(outputData);

  await controller.execute();
  const result = presenter.getOutputData();

  if (!result) {
    res.status(404).json({ error: `Failure to initiate project` });
    return;
  }

  res.status(201).json({ message: `Project initiated successfully` });
});

router.post('/template/module_generate', async (_req, res) => {
  const outputData = new InitModuleProjectOutputData();
  const interactor = new InitModuleProjectInteractor(fileAccess, outputData);
  const controller = new InitModuleProjectController(interactor);
  const presenter = new InitModuleProjectPresenter(outputData);

  await controller.execute();
  const result = presenter.getOutputData();

  if (!result) {
    res.status(404).json({ error: `Failure to initiate project` });
    return;
  }

  res.status(201).json({ message: `Project initiated successfully` });
});

router.post('/template/add/:useCaseName', async (req, res) => {
  const presenter = new CreateUseCasePresenter();
  const interactor = new CreateUseCaseInteractor(fileAccess, presenter);
  const controller = new CreateUseCaseController(interactor);

  await controller.execute(req.params.useCaseName);
  const result = presenter.getError();

  if (result) {
    res
      .status(404)
      .json({ error: `Could not make use case '${req.params.useCaseName}'` });
    return;
  }

  res.status(201).json({
    message: `Use case '${req.params.useCaseName}' created successfully`,
  });
});

router.post('/template/module_add/:featureName', async (req, res) => {
  const presenter = new CreateFeaturePresenter();
  const interactor = new CreateFeatureInteractor(fileAccess, presenter);
  const controller = new CreateFeatureController(interactor);

  await controller.execute(req.params.featureName);
  const result = presenter.getError();

  if (result) {
    res
      .status(404)
      .json({ error: `Could not make feature '${req.params.featureName}'` });
    return;
  }

  res.status(201).json({
    message: `Feature '${req.params.featureName}' created successfully`,
  });
});

router.post(
  '/template/module_add/:featureName/:useCaseName',
  async (req, res) => {
    const presenter = new CreateModuleUseCasePresenter();
    const interactor = new CreateModuleUseCaseInteractor(fileAccess, presenter);
    const controller = new CreateModuleUseCaseController(interactor);

    await controller.execute(req.params.featureName, req.params.useCaseName);
    const result = presenter.getError();

    if (result) {
      res.status(404).json({
        error: `Could not make use case '${req.params.useCaseName}' in feature '${req.params.featureName}'`,
      });
      return;
    }

    res.status(201).json({
      message: `Use case '${req.params.useCaseName}' created successfully in feature '${req.params.featureName}'`,
    });
  }
);

export default router;
