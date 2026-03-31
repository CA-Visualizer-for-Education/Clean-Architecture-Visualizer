import chalk from "chalk";

import type { FileAccess } from "../data_access/fileAccess.js";
import type { CleanArchAccess } from "../data_access/cleanArchInfoAccess.js";
import type { SessionDBAccess } from "../data_access/sessionDBAccess.js";

import { GraphVerificationController } from "../interface_adapter/graphVerification/graphVerificationController.js";
import type { GraphVerificationInputBoundary } from "../use_case/graphVerification/graphVerificationInputBoundary.js";
import { GraphVerificationOutputData } from "../use_case/graphVerification/graphVerificationOutputData.js";
import { GraphVerificationPresenter } from "../interface_adapter/graphVerification/graphVerificationPresenter.js";
import { GraphVerificationInputData } from "../use_case/graphVerification/graphVerificationInputData.js";


export class AppBuilder {
    private fileAccess?: FileAccess;
    private cleanArchAccess?: CleanArchAccess;
    private db?: SessionDBAccess;
    private graphVerificationInteractor?: GraphVerificationInputBoundary;
    private graphVerificationController?: GraphVerificationController;
    private graphVerificationOutputData?: GraphVerificationOutputData;

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
            outputData: GraphVerificationOutputData
        ) => GraphVerificationInputBoundary
        ): this {
        if (!this.fileAccess || !this.cleanArchAccess || !this.db) {
            throw new Error("FileAccess, CleanArchAccess, and SessionDBAccess must be set before building interactor");
        }
        this.graphVerificationOutputData = new GraphVerificationOutputData();

        this.graphVerificationInteractor = new InteractorClass(
            this.fileAccess,
            this.cleanArchAccess,
            this.db,
            this.graphVerificationOutputData
            );
        return this;
    }

    // Controller Layer
    buildGraphVerificationController(
        ControllerClass: new (interactor: GraphVerificationInputBoundary) => GraphVerificationController
        ): this {
        if (!this.graphVerificationInteractor) {
            throw new Error("GraphVerificationInteractor must be built before controller");
        }
        
        this.graphVerificationController = new ControllerClass(
            this.graphVerificationInteractor
            );
        return this;
    }

    build() {
        return {
            fileAccess: this.fileAccess!,
            validOutNeighbourAccess: this.cleanArchAccess!,
            graphVerificationInteractor: this.graphVerificationInteractor!,
            graphVerificationController: this.graphVerificationController!,
        };
    }

    runGraphVerification() {
        this.graphVerificationController?.execute();
    }

    async runCLIGraphVerification() {
        if (!this.graphVerificationOutputData) {
            throw new Error("GraphVerificationOutputData must be built before presenter");
        }
        this.graphVerificationInteractor?.toggleCommandLine();
        const presenter = new GraphVerificationPresenter(this.graphVerificationOutputData);
        await this.graphVerificationController?.execute();
        this.graphVerificationInteractor?.toggleCommandLine(); // set back to not printing to CL
        const data = presenter.getOutputData();
        const lineContent = data[0];
        const lineColour = data[1];
        for (let line = 0; line < lineContent.length; line++) {
            if (lineColour[line]) {
                console.log(chalk.green(lineContent[line]));
            } else {
                console.log(chalk.red(lineContent[line]));
            }
        }
    }
}