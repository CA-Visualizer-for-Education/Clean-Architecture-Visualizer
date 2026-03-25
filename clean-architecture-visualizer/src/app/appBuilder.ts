import type { FileAccess } from "../data_access/fileAccess.js";
import type { CleanArchAccess } from "../data_access/cleanArchInfoAccess.js";
import type { SessionDBAccess } from "../data_access/sessionDBAccess.js";

import type { GraphVerificationController } from "../interface_adapter/graphVerification/graphVerificationController.js";
import type { GraphVerificationInputBoundary } from "../use_case/graphVerification/graphVerificationInputBoundary.js";


export class AppBuilder {
    private fileAccess?: FileAccess;
    private cleanArchAccess?: CleanArchAccess;
    private db?: SessionDBAccess;
    private graphVerificationInteractor?: GraphVerificationInputBoundary;
    private graphVerificationController?: GraphVerificationController;

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
            db: SessionDBAccess
        ) => GraphVerificationInputBoundary
        ): this {
        if (!this.fileAccess || !this.cleanArchAccess || !this.db) {
            throw new Error("FileAccess, CleanArchAccess, and SessionDBAccess must be set before building interactor");
        }

        this.graphVerificationInteractor = new InteractorClass(
            this.fileAccess,
            this.cleanArchAccess,
            this.db
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
}