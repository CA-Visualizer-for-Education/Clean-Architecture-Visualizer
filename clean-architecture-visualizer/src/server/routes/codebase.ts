import { Router } from "express";
import { SessionDBAccess } from "../../data_access/sessionDBAccess.js";
import { FileAccess } from "../../data_access/fileAccess.js";
import { GetFileTreeOutputData } from "../../use_case/getFileTree/getFileTreeOuptutData.js";
import { GetFileTreeInteractor } from "../../use_case/getFileTree/getFileTreeInteractor.js";
import { GetFileTreeController } from "../../interface_adapter/getFileTree/getFileTreeController.js";
import { GetFileTreePresenter } from "../../interface_adapter/getFileTree/getFileTreePresenter.js";
import { GetFileContentPresenter } from "../../interface_adapter/getFileContent/getFileContentPresenter.js";
import { GetFileContentOutputData } from "../../use_case/getFileContent/getFileContentOutputData.js";
import { GetFileContentInputData } from "../../use_case/getFileContent/getFileContentInputData.js";
import { GetFileContentInteractor } from "../../use_case/getFileContent/getFileContentInteractor.js";
import { GetFileContentController } from "../../interface_adapter/getFileContent/getFileContentController.js";
import { GetRelationsInputData } from "../../use_case/getRelations/GetRelationsInputData.js";
import { GetRelationsOutputData } from "../../use_case/getRelations/GetRelationsOutputData.js";
import { GetRelationsInteractor } from "../../use_case/getRelations/GetRelationsInteractor.js";
import { GetRelationsController } from "../../interface_adapter/getRelations/getRelationsController.js";
import { GetRelationsPresenter } from "../../interface_adapter/getRelations/getRelationsPresenter.js";

const router = Router();

const dbAccess = new SessionDBAccess();
const fileAccess = new FileAccess();

router.get("/codebase/file-tree", async (_req, res) => {
    const outputData = new GetFileTreeOutputData();
    const interactor = new GetFileTreeInteractor(dbAccess, outputData);
    const controller = new GetFileTreeController(interactor);
    const presenter = new GetFileTreePresenter(outputData);

    controller.execute();
    const result = presenter.getOutputData()

    if (!result) {
        res.status(404).json({ error: `Unable to collect File tree.` });
        return;
    }


    res.json(outputData.getOutputData());
});
 
router.get("/codebase/interactions/:interactionId/files/:filepath", async (req, res) => {
    const { interactionId, filepath } = req.params;
    
    const inputData = new GetFileContentInputData(interactionId, filepath);
    const outputData = new GetFileContentOutputData();
    const interactor = new GetFileContentInteractor(dbAccess, fileAccess, inputData, outputData);
    const controller = new GetFileContentController(interactor);
    const presenter = new GetFileContentPresenter(outputData);

    controller.execute();
    const result = presenter.getOutputData()
 
    if (!result) {
        res.status(404).json({ error: `File '${filepath}' not found for interaction '${interactionId}'.` });
        return;
    }
 
    res.json(result);
});
 
router.get("/codebase/interactions/:interactionId/files/:filepath/relations", async (req, res) => {
    const { interactionId, filepath } = req.params;
 
    const inputData = new GetRelationsInputData(interactionId, filepath);
    const outputData = new GetRelationsOutputData();
    const interactor = new GetRelationsInteractor(dbAccess, fileAccess, inputData, outputData);
    const controller = new GetRelationsController(interactor);
    const presenter = new GetRelationsPresenter(outputData);

    controller.execute();
    const result = presenter.getOutputData()
 
    if (!result) {
        res.status(404).json({ error: `File '${filepath}' not found for interaction '${interactionId}'.` });
        return;
    }
 
    res.json(result);
});

export default router;