import { Router } from "express";
import { CleanArchAccess } from "../../data_access/cleanArchInfoAccess.js";
import { GetLearningModePresenter } from "../../interface_adapter/getLearningMode/getLearningModePresenter.js";
import { GetLearningModeOutputData } from "../../use_case/getLearningMode/getLearningModeOutputData.js";
import { GetLearningModeController } from "../../interface_adapter/getLearningMode/getLearningModeController.js";
import { GetLearningModeInteractor } from "../../use_case/getLearningMode/getLearningModeInteractor.js";

const router = Router();

const cleanArchAccess = new CleanArchAccess();

router.get("/learning-mode/",  (_req, res) => {
    
    const outputData = new GetLearningModeOutputData();
    const interactor = new GetLearningModeInteractor(cleanArchAccess, outputData);
    const controller = new GetLearningModeController(interactor);
    const presenter = new GetLearningModePresenter(outputData);

    controller.getLearningMode();
    res.json(presenter.getOutputData());
})

export default router;