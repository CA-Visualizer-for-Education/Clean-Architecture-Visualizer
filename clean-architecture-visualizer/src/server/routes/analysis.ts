import { Router } from "express";
import { SessionDBAccess } from "../../data_access/sessionDBAccess.js";
import { GetProjectSummaryOutputData } from "../../use_case/getProjectSummary/getProjectSummaryOutputData.js";
import { GetProjectSummaryInteractor } from "../../use_case/getProjectSummary/getProjectSummaryInteractor.js";
import { GetProjectSummaryController } from "../../interface_adapter/getProjectSummary/getProjectSummaryController.js";
import { GetProjectSummaryPresenter } from "../../interface_adapter/getProjectSummary/getProjectSummaryPresenter.js";
import { GetUseCaseInfoInputData } from "../../use_case/getUseCaseInfo/getUseCaseInfoInputData.js";
import { GetUseCaseInfoInteractor } from "../../use_case/getUseCaseInfo/getUseCaseInfoInteractor.js";
import { GetUseCaseInfoOutputData } from "../../use_case/getUseCaseInfo/getUseCaseInfoOutputData.js";
import { GetUseCaseInfoPresenter } from "../../interface_adapter/getUseCaseInfo/getUseCaseInfoPresenter.js";
import { GetUseCaseInfoController } from "../../interface_adapter/getUseCaseInfo/getUseCaseInfoController.js";
import { GetViolationsInputData } from "../../use_case/getViolations/GetViolationsInputData.js";
import { GetViolationsOutputData } from "../../use_case/getViolations/GetViolationsOutputData.js";
import { GetViolationsInteractor } from "../../use_case/getViolations/GetViolationsInteractor.js";
import { FileAccess } from "../../data_access/fileAccess.js";
import { GetViolationsController } from "../../interface_adapter/getViolations/getViolationsController.js";
import { GetViolationsPresenter } from "../../interface_adapter/getViolations/getViolationsPresenter.js";

const router = Router();

const dbAccess = new SessionDBAccess();
const fileAccess = new FileAccess();

router.get("/analysis/summary",  (_req, res) => {
    const outputData = new GetProjectSummaryOutputData();
    const interactor = new GetProjectSummaryInteractor(dbAccess, outputData);
    const controller = new GetProjectSummaryController(interactor);
    const presenter = new GetProjectSummaryPresenter(outputData);

    controller.execute();
    const result = presenter.getOutputData();

    if (!result) {
        res.status(404).json({ error: `Failure in collecting the Project Summary` });
        return;
    }

    res.json(result);
});

router.get("/analysis/interaction/:id", async (req, res) => {
    const inputData = new GetUseCaseInfoInputData(req.params.id);
    const outputData = new GetUseCaseInfoOutputData();
    const interactor = new GetUseCaseInfoInteractor(dbAccess, inputData, outputData);
    const controller = new GetUseCaseInfoController(interactor);
    const presenter = new GetUseCaseInfoPresenter(outputData);

    controller.execute();
    const result = presenter.getOutputData();
 
    if (!result) {
        res.status(404).json({ error: `Interaction '${req.params.id}' not found.` });
        return;
    }
 
    res.json(result);
});
 
router.get("/analysis/violations/:interactionId", async (req, res) => {
    const inputData = new GetViolationsInputData(req.params.interactionId);
    const outputData = new GetViolationsOutputData();
    const interactor = new GetViolationsInteractor(dbAccess, fileAccess, inputData, outputData);
    const controller = new GetViolationsController(interactor);
    const presenter = new GetViolationsPresenter(outputData);

    controller.execute();
    const result = presenter.getOutputData();
 
    if (!result) {
        res.status(404).json({ error: `Interaction '${req.params.interactionId}' not found.` });
        return;
    }
 
    res.json(result);
});

export default router;