import { Router } from "express";
import { FileAccess } from "../../data_access/fileAccess.js";
import { InitProjectOutputData } from "../../use_case/initProject/initProjectOutputData.js";
import { InitProjectInteractor } from "../../use_case/initProject/initProjectInteractor.js";
import { InitProjectContoller } from "../../interface_adapter/intiProject/initProjectContoller.js";
import { InitProjectPresetner } from "../../interface_adapter/intiProject/initProjectPresenter.js";
import { CreateUseCaseInputData } from "../../use_case/createUseCase/createUseCaseInputData.js";
import { CreateUseCaseOutputData } from "../../use_case/createUseCase/createUseCaseOutputData.js";
import { CreateUseCaseinteractor } from "../../use_case/createUseCase/createUseCaseInteractor.js";
import { CreateUseCaseController } from "../../interface_adapter/createUseCase/createUseCaseController.js";
import { CreateUseCasePresenter } from "../../interface_adapter/createUseCase/createUseCasePresenter.js";

const router = Router();

const fileAccess = new FileAccess();

router.post("/template/generate",  (_req, res) => {
    const outputData = new InitProjectOutputData();
    const interactor = new InitProjectInteractor(fileAccess, outputData);
    const controller = new InitProjectContoller(interactor);
    const presenter = new InitProjectPresetner(outputData);

    controller.execute();
    const result = presenter.getOutputData();

    if (!result) {
        res.status(404).json({ error: `Failure to initiate project` });
        return;
    }

    res.status(201).json({ message: `Project initiated successfully` });
});

router.post("/template/add/:useCaseName", async (req, res) => {
    const inputData = new CreateUseCaseInputData(req.params.useCaseName);
    const outputData = new CreateUseCaseOutputData();
    const interactor = new CreateUseCaseinteractor(fileAccess, inputData, outputData);
    const controller = new CreateUseCaseController(interactor);
    const presenter = new CreateUseCasePresenter(outputData);

    controller.execute();
    const result = presenter.getOutputData();
 
    if (!result) {
        res.status(404).json({ error: `Could not make use case '${req.params.useCaseName}'` });
        return;
    }
 
    res.status(201).json({ message: `Use case '${req.params.useCaseName}' created successfully` });
});

export default router;