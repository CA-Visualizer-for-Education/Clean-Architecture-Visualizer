// This file contains all the logic for displaying the CA Diagram, including fetching the data and handling loading/error states. 
// The actual rendering of the diagram is delegated to CADiagramView, which is a pure presentational component that receives all 
// the data it needs as props.

import { Typography, Container, CircularProgress } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import { CADiagramView } from './CADiagramView';
import type { CANode, CAEdge, CAComponentType, CALayer } from '../../lib/types';
import { useInteraction } from '../../actions/useAnalysis';

const componentLayerMap: Record<CAComponentType, CALayer> = {
    Controller: 'InterfaceAdapters',
    Presenter: 'InterfaceAdapters',
    View: 'Frameworks',
    ViewModel: 'InterfaceAdapters',
    InputBoundary: 'ApplicationBusinessRules',
    OutputBoundary: 'ApplicationBusinessRules',
    InputData: 'ApplicationBusinessRules',
    OutputData: 'ApplicationBusinessRules',
    Interactor: 'ApplicationBusinessRules',
    Entity: 'EnterpriseBusinessRules',
    DataAccessInterface: 'ApplicationBusinessRules',
    DataAccess: 'Frameworks',
    Database: 'Frameworks',
};

const getNodeByType = (nodes: CANode[], type: CAComponentType): CANode => {
    const node = nodes.find((candidate) => candidate.type === type);
    return (
        node ?? {
            id: `missing-${type}`,
            name: `${type} (Missing)`,
            type,
            layer: componentLayerMap[type],
            status: 'MISSING',
        }
    );
};

export function CADiagram() {
    let controller: CANode;
    let presenter: CANode;
    let viewModel: CANode;
    let inputData: CANode;
    let inputBoundary: CANode;
    let interactor: CANode;
    let outputBoundary: CANode;
    let outputData: CANode;
    let dataAccessInterface: CANode;
    let entities: CANode;
    let view: CANode;
    let dataAccess: CANode;
    let database: CANode;

    let edges: CAEdge[] = [];

    const { interactionId } = useParams<{ interactionId: string }>();
    const { pathname } = useLocation();
    const {
        data: interactionData,
        isLoading,
        isError,
        error,
    } = useInteraction(interactionId ?? '');

    const isLearningMode = interactionId === undefined && pathname.endsWith('/learning');

    if (isLearningMode) {
        controller = {
            id: 'controller-learning',
            name: 'Controller',
            type: 'Controller',
            layer: 'InterfaceAdapters',
            status: 'VALID',
        };
        presenter = {
            id: 'presenter-learning',
            name: 'Presenter', 
            type: 'Presenter',
            layer: 'InterfaceAdapters',
            status: 'VALID',
        };
        viewModel = {
            id: 'viewmodel-learning',
            name: 'View Model',  
            type: 'ViewModel',
            layer: 'InterfaceAdapters',
            status: 'VALID',
        };
        inputData = {
            id: 'inputdata-learning',
            name: 'Input Data',
            type: 'InputData',
            layer: 'ApplicationBusinessRules',
            status: 'VALID',
        };
        inputBoundary = {
            id: 'inputboundary-learning',
            name: 'Input Boundary', 
            type: 'InputBoundary',
            layer: 'ApplicationBusinessRules',
            status: 'VALID',
        };
        interactor = {
            id: 'interactor-learning',
            name: 'Use Case Interactor',
            type: 'Interactor',
            layer: 'ApplicationBusinessRules',
            status: 'VALID',
        };
        outputBoundary = {
            id: 'outputboundary-learning',
            name: 'Output Boundary',
            type: 'OutputBoundary',
            layer: 'ApplicationBusinessRules',
            status: 'VALID',
        };
        outputData = {
            id: 'outputdata-learning',
            name: 'Output Data',
            type: 'OutputData',
            layer: 'ApplicationBusinessRules',
            status: 'VALID',
        };
        dataAccessInterface = {
            id: 'dataaccessinterface-learning',
            name: 'Data Access Interface',
            type: 'DataAccessInterface',
            layer: 'ApplicationBusinessRules',
            status: 'VALID',
        };
        entities = {
            id: 'entities-learning',
            name: 'Entities',
            type: 'Entity',
            layer: 'EnterpriseBusinessRules',
            status: 'VALID',
        };
        view = {
            id: 'view-learning',
            name: 'View',
            type: 'View',
            layer: 'Frameworks',
            status: 'VALID',
        };
        dataAccess = {
            id: 'dataaccess-learning',
            name: 'Data Access',
            type: 'DataAccess',
            layer: 'Frameworks',
            status: 'VALID',
        };
        database = {
            id: 'database-learning',
            name: 'Database',
            type: 'Database',
            layer: 'Frameworks',
            status: 'VALID',
        };

        edges = [
            {
                id: 'learning-edge-controller-input-data',
                source: controller.id,
                target: inputData.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-controller-input-boundary',
                source: controller.id,
                target: inputBoundary.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-presenter-output-boundary',
                source: presenter.id,
                target: outputBoundary.id,
                type: 'INHERITANCE',
                status: 'VALID',
            },
            {
                id: 'learning-edge-presenter-view-model',
                source: presenter.id,
                target: viewModel.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-presenter-output-data',
                source: presenter.id,
                target: outputData.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-view-view-model',
                source: view.id,
                target: viewModel.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-interactor-input-boundary',
                source: interactor.id,
                target: inputBoundary.id,
                type: 'INHERITANCE',
                status: 'VALID',
            },
            {
                id: 'learning-edge-interactor-output-boundary',
                source: interactor.id,
                target: outputBoundary.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-interactor-input-data',
                source: interactor.id,
                target: inputData.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-interactor-output-data',
                source: interactor.id,
                target: outputData.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-interactor-data-access-interface',
                source: interactor.id,
                target: dataAccessInterface.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-data-access-data-access-interface',
                source: dataAccess.id,
                target: dataAccessInterface.id,
                type: 'INHERITANCE',
                status: 'VALID',
            },
            {
                id: 'learning-edge-interactor-entities',
                source: interactor.id,
                target: entities.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-data-access-interface-entities',
                source: dataAccessInterface.id,
                target: entities.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
            {
                id: 'learning-edge-data-access-database',
                source: dataAccess.id,
                target: database.id,
                type: 'DEPENDENCY',
                status: 'VALID',
            },
        ];


    } else {
        if (interactionId === undefined) {
            return <Typography color="error">CA Diagram not supported for this view.</Typography>;
        }

        if (!interactionId) {
            return (
                <Container maxWidth="lg">
                    <Typography color="error">Missing interaction id in URL.</Typography>
                </Container>
            );
        }

        if (isLoading) {
            return (
                <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Container>
            );
        }

        if (isError || !interactionData) {
            return (
                <Container maxWidth="lg">
                    <Typography color="error">
                        {error instanceof Error ? error.message : 'Failed to load interaction data.'}
                    </Typography>
                </Container>
            );
        }

        const nodes = interactionData.nodes ?? [];
        edges = interactionData.edges ?? [];

        controller = getNodeByType(nodes, 'Controller');
        presenter = getNodeByType(nodes, 'Presenter');
        viewModel = getNodeByType(nodes, 'ViewModel');
        inputData = getNodeByType(nodes, 'InputData');
        inputBoundary = getNodeByType(nodes, 'InputBoundary');
        interactor = getNodeByType(nodes, 'Interactor');
        outputBoundary = getNodeByType(nodes, 'OutputBoundary');
        outputData = getNodeByType(nodes, 'OutputData');
        dataAccessInterface = getNodeByType(nodes, 'DataAccessInterface');
        entities = getNodeByType(nodes, 'Entity');
        view = getNodeByType(nodes, 'View');
        dataAccess = getNodeByType(nodes, 'DataAccess');
        database = getNodeByType(nodes, 'Database');
    } 

    return (
        <CADiagramView
            controller={controller}
            presenter={presenter}
            viewModel={viewModel}
            inputData={inputData}
            inputBoundary={inputBoundary}
            interactor={interactor}
            outputBoundary={outputBoundary}
            outputData={outputData}
            dataAccessInterface={dataAccessInterface}
            entities={entities}
            view={view}
            dataAccess={dataAccess}
            database={database}
            edges={edges}
            areNodesInteractive={isLearningMode}
        />
    )
    
}