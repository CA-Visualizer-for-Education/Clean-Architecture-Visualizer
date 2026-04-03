// This file is responsible for rendering the Clean Architecture Diagram based on the data passed in as props. 
// It is a pure presentational component that does not contain any logic for fetching data or handling loading/error states.

import { CANodeView, type NodeClickInfo } from './CANodeView';
import { Edge, type EdgeRouteHint } from './Edge';
import { CANode, CAEdge } from './../../lib/types';
import { Container, Box, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

type CADiagramViewProps = {
    controller: CANode;
    presenter: CANode;
    viewModel: CANode;
    entities: CANode;
    inputData: CANode;
    inputBoundary: CANode;
    interactor: CANode;
    outputBoundary: CANode;
    outputData: CANode;
    dataAccessInterface: CANode;
    view: CANode;
    dataAccess: CANode;
    database: CANode;
    edges: CAEdge[];
    areNodesInteractive?: boolean;
    onNodeClick?: (info: NodeClickInfo) => void;
};

export function CADiagramView({
    controller,
    presenter,
    viewModel,
    entities,
    inputData,
    inputBoundary,
    interactor,
    outputBoundary,
    outputData,
    dataAccessInterface,
    view,
    dataAccess,
    database,
    edges,
    areNodesInteractive = false,
    onNodeClick,
}: CADiagramViewProps) {
    const diagramContainerRef = useRef<HTMLDivElement | null>(null);
    const diagramContentRef = useRef<HTMLDivElement | null>(null);
    const [layoutVersion, setLayoutVersion] = useState(0);

    useEffect(() => {
        const container = diagramContainerRef.current;
        const content = diagramContentRef.current;
        if (!container) {
            return;
        }

        let rafId: number | null = null;
        const scheduleRecompute = () => {
            if (rafId !== null) {
                return;
            }
            rafId = requestAnimationFrame(() => {
                rafId = null;
                setLayoutVersion((value) => value + 1);
            });
        };

        const resizeObserver = new ResizeObserver(scheduleRecompute);
        resizeObserver.observe(container);
        if (content) {
            resizeObserver.observe(content);
        }

        window.addEventListener('resize', scheduleRecompute);
        container.addEventListener('scroll', scheduleRecompute, { passive: true });
        scheduleRecompute();

        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            resizeObserver.disconnect();
            window.removeEventListener('resize', scheduleRecompute);
            container.removeEventListener('scroll', scheduleRecompute);
        };
    }, []);

    // Build a stable id->node lookup so each edge can resolve source/target nodes in O(1).
    const nodesById = useMemo(() => {
        const nodes = [
            controller,
            presenter,
            viewModel,
            entities,
            inputData,
            inputBoundary,
            interactor,
            outputBoundary,
            outputData,
            dataAccessInterface,
            view,
            dataAccess,
            database,
        ];

        return new Map(nodes.map((node) => [node.id, node]));
    }, [
        controller,
        presenter,
        viewModel,
        entities,
        inputData,
        inputBoundary,
        interactor,
        outputBoundary,
        outputData,
        dataAccessInterface,
        view,
        dataAccess,
        database,
    ]);

    const resolveArrowHeadType = (edgeType: CAEdge['type']) => {
        if (edgeType === 'ASSOCIATION') return 'none' as const;
        if (edgeType === 'INHERITANCE') return 'hollowTriangle' as const;
        return 'filledTriangle' as const;
    };

    // Per-edge overrides used to match the learning diagram's intended arrow routing.
    // viaRatio is the normalized bend position on that edge's span:
    // - 0.50: centered bend for mostly symmetric links.
    // - ~0.54: slight offset to avoid overlapping nearby vertical connectors.
    // - ~0.62 to 0.64: pushes bends away from the interactor cluster before turning.
    // - 0.70: keeps this long cross-layer edge farther from central nodes.
    const routeHintsByEdgeId = useMemo<Record<string, EdgeRouteHint>>(() => ({
        'learning-edge-presenter-view-model': {
            mode: 'straight',
            startSide: 'bottom',
            endSide: 'top',
            viaRatio: 0.54,
        },
        'learning-edge-presenter-output-data': {
            mode: 'vhvh',
            startSide: 'bottom',
            endSide: 'left',
            viaRatio: 0.5,
        },
        'learning-edge-view-view-model': {
            mode: 'straight',
            startSide: 'top',
            endSide: 'bottom',
            viaRatio: 0.54,
        },
        'learning-edge-interactor-input-data': {
            mode: 'elbowV',
            viaRatio: 0.62,
            startSide: 'top',
            endSide: 'right',
        },
        'learning-edge-interactor-input-boundary': {
            mode: 'elbowV',
            viaRatio: 0.62,
            startSide: 'top',
            endSide: 'right',
        },
        'learning-edge-interactor-output-boundary': {
            mode: 'elbowV',
            viaRatio: 0.62,
            startSide: 'bottom',
            endSide: 'right',
        },
        'learning-edge-interactor-output-data': {
            mode: 'elbowV',
            viaRatio: 0.62,
            startSide: 'bottom',
            endSide: 'right',
        },
        'learning-edge-interactor-data-access-interface': {
            mode: 'straight',
            viaRatio: 0.64,
            startSide: 'bottom',
            endSide: 'top',
        },
        'learning-edge-data-access-interface-entities': {
            mode: 'elbowH',
            viaRatio: 0.70,
            startSide: 'right',
            endSide: 'bottom',
        },
        'learning-edge-data-access-data-access-interface': {
            mode: 'straight',
            viaRatio: 0.5,
            startSide: 'top',
            endSide: 'bottom',
        },
        'learning-edge-data-access-database': {
            mode: 'horizontal',
            viaRatio: 0.5,
            startSide: 'right',
            endSide: 'left',
        },
    }), []);

    return (
        <><Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.25, sm: 0.5, md: 0.75 } }}>
            <Container ref={diagramContainerRef} sx={{ border: 2, borderColor: 'grey.600', borderRadius: 8, bgcolor: 'grey.100', py: { xs: 0.5, sm: 0.75, md: 1.25 }, px: { xs: 0.5, sm: 1 }, overflowX: 'auto', position: 'relative' }}>
                <Box ref={diagramContentRef} sx={{ minWidth: { xs: 640, sm: 760, md: 'auto' } }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.1fr 2.1fr 1.1fr', columnGap: { xs: 0.5, sm: 0.75, md: 1.25 }, rowGap: { xs: 0.25, sm: 0.4, md: 0.5 }, width: '100%' }}>
                    <Box sx={{ border: 2, borderColor: 'adapters.contrastText', bgcolor: 'adapters.light', borderRadius: 2, p: { xs: 0.5, sm: 0.75, md: 1 } }}>
                        <Typography variant="subtitle2" sx={{ mb: { xs: 0.25, sm: 0.4, md: 0.5 }, fontWeight: 700, fontSize: 'clamp(0.68rem, 0.8vw, 0.875rem)' }}>
                            Interface Adapters
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', height: '100%' }}>
                            <CANodeView {...controller} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                            <CANodeView {...presenter} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                            <CANodeView {...viewModel} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                        </Box>
                    </Box>

                    <Box sx={{ border: 2, borderColor: 'useCases.contrastText', bgcolor: 'useCases.light', borderRadius: 2, p: { xs: 0.5, sm: 0.75, md: 1 } }}>
                        <Typography variant="subtitle2" sx={{ mb: { xs: 0.25, sm: 0.4, md: 0.5 }, fontWeight: 700, fontSize: 'clamp(0.68rem, 0.8vw, 0.875rem)' }}>
                            Application Business Rules
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: { xs: 0.25, sm: 0.4, md: 0.5 }, columnGap: { xs: 0.5, sm: 0.75, md: 1 } }}>
                            <CANodeView {...inputData} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                            <Box />
                            <CANodeView {...inputBoundary} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                            <Box />
                            <Box />
                            <CANodeView {...interactor} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                            <CANodeView {...outputBoundary} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                            <Box />
                            <CANodeView {...outputData} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                            <Box />
                            <Box />
                            <CANodeView {...dataAccessInterface} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                        </Box>
                    </Box>

                    <Box sx={{ border: 2, borderColor: 'entities.contrastText', bgcolor: 'entities.light', borderRadius: 2, p: { xs: 0.5, sm: 0.75, md: 1 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="subtitle2" sx={{ mb: { xs: 0.25, sm: 0.4, md: 0.5 }, fontWeight: 700, fontSize: 'clamp(0.68rem, 0.8vw, 0.875rem)' }}>
                            Enterprise Business Rules
                        </Typography>
                        <Box
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flex: 1,
                                alignItems: 'center',
                                '& > *': {
                                    width: '100%',
                                    flex: 1,
                                },
                            }}
                        >
                            <CANodeView {...entities} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ mt: { xs: 0.5, sm: 0.75, md: 1 }, border: 2, borderColor: 'drivers.contrastText', bgcolor: 'drivers.light', borderRadius: 2, p: 0 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1.1fr 2.1fr 1.1fr', columnGap: { xs: 0.5, sm: 0.75, md: 1.25 }, width: '100%' }}>
                        <Box sx={{ px: { xs: 0.5, sm: 0.75, md: 1 }, pt: { xs: 0.4, sm: 0.6, md: 0.75 } }} />
                        <Box sx={{ px: { xs: 0.5, sm: 0.75, md: 1 }, pt: { xs: 0.4, sm: 0.6, md: 0.75 } }}>
                            <Typography variant="subtitle2" sx={{ mb: { xs: 0.1, sm: 0.2, md: 0.25 }, fontWeight: 700, fontSize: 'clamp(0.68rem, 0.8vw, 0.875rem)' }}>
                                Frameworks and Drivers
                            </Typography>
                        </Box>
                        <Box sx={{ px: { xs: 0.5, sm: 0.75, md: 1 }, pt: { xs: 0.4, sm: 0.6, md: 0.75 } }} />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1.1fr 2.1fr 1.1fr', columnGap: { xs: 0.5, sm: 0.75, md: 1.25 }, width: '100%', mt: { xs: -0.2, sm: -0.35, md: -0.5 } }}>
                        <Box sx={{ px: { xs: 0.5, sm: 0.75, md: 1 }, pb: { xs: 0.35, sm: 0.55, md: 0.75 } }}>
                            <CANodeView {...view} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                        </Box>

                        <Box sx={{ px: { xs: 0.5, sm: 0.75, md: 1 }, pb: { xs: 0.35, sm: 0.55, md: 0.75 } }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: { xs: 0.5, sm: 0.75, md: 1 } }}>
                                <Box />
                                <CANodeView {...dataAccess} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                            </Box>
                        </Box>

                        <Box sx={{ px: { xs: 0.5, sm: 0.75, md: 1 }, pb: { xs: 0.35, sm: 0.55, md: 0.75 } }}>
                            <CANodeView {...database} isInteractive={areNodesInteractive} onNodeClick={onNodeClick} />
                        </Box>
                    </Box>
                </Box>
                </Box>

                {edges.map((edge) => {
                    const startNode = nodesById.get(edge.source);
                    const endNode = nodesById.get(edge.target);

                    if (!startNode || !endNode) {
                        return null;
                    }

                    return (
                        <Edge
                            key={edge.id}
                            startNode={startNode}
                            endNode={endNode}
                            status={edge.status}
                            arrowHeadType={resolveArrowHeadType(edge.type)}
                            containerRef={diagramContainerRef}
                            routeHint={routeHintsByEdgeId[edge.id]}
                            layoutVersion={layoutVersion}
                        />
                    );
                })}
            </Container>
        </Container>
        </>
    );
}