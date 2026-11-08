import type {
  AnalysisSummary,
  CAComponentType,
  CaEdge,
  CaLayer,
  CaNode,
  Interaction,
} from '../lib/types';
import {
  COMPONENT_TYPES,
  EDGE_STATUSES,
  EDGE_TYPES,
  LAYER_METADATA,
  NODE_STATUSES,
} from '../lib/types';
import { getAnalysisSummary, getInteractionDetails } from './analysis.api';

const validComponentTypes: ReadonlySet<CAComponentType> = new Set(
  COMPONENT_TYPES
);

const validLayers: ReadonlySet<CaLayer> = new Set(
  Object.keys(LAYER_METADATA) as CaLayer[]
);

const validNodeStatuses: ReadonlySet<CaNode['status']> = new Set(NODE_STATUSES);

const validEdgeTypes: ReadonlySet<CaEdge['type']> = new Set(EDGE_TYPES);

const validEdgeStatuses: ReadonlySet<CaEdge['status']> = new Set(EDGE_STATUSES);

export interface UseCaseDiagramData {
  interactionId: string;
  interactionName: string;
  nodes: CaNode[];
  edges: CaEdge[];
}

function toCaNodes(rawNodes: unknown): CaNode[] {
  if (!Array.isArray(rawNodes)) {
    return [];
  }

  return rawNodes.flatMap((rawNode) => {
    if (!rawNode || typeof rawNode !== 'object') {
      return [];
    }

    const node = rawNode as Record<string, unknown>;
    const id = node.id;
    const type = node.type;
    const layer = node.layer;
    const status = node.status;

    if (
      typeof id !== 'string' ||
      typeof type !== 'string' ||
      typeof layer !== 'string' ||
      typeof status !== 'string' ||
      !validComponentTypes.has(type as CAComponentType) ||
      !validLayers.has(layer as CaLayer) ||
      !validNodeStatuses.has(status as CaNode['status'])
    ) {
      return [];
    }

    const name = typeof node.name === 'string' ? node.name : undefined;
    const file_path =
      typeof node.file_path === 'string' ? node.file_path : undefined;

    return [
      {
        id,
        name,
        type: type as CAComponentType,
        layer: layer as CaLayer,
        file_path,
        status: status as CaNode['status'],
      },
    ];
  });
}

function toCaEdges(rawEdges: unknown): CaEdge[] {
  if (!Array.isArray(rawEdges)) {
    return [];
  }

  return rawEdges.flatMap((rawEdge) => {
    if (!rawEdge || typeof rawEdge !== 'object') {
      return [];
    }

    const edge = rawEdge as Record<string, unknown>;
    const id = edge.id;
    const source = edge.source;
    const target = edge.target;
    const type = edge.type;
    const status = edge.status;

    if (
      typeof id !== 'string' ||
      typeof source !== 'string' ||
      typeof target !== 'string' ||
      typeof type !== 'string' ||
      typeof status !== 'string' ||
      !validEdgeTypes.has(type as CaEdge['type']) ||
      !validEdgeStatuses.has(status as CaEdge['status'])
    ) {
      return [];
    }

    return [
      {
        id,
        source,
        target,
        type: type as CaEdge['type'],
        status: status as CaEdge['status'],
      },
    ];
  });
}

function getInteractionsForUseCase(
  summary: AnalysisSummary,
  useCaseName: string
): Interaction[] {
  const useCase = summary.use_cases.find(
    (candidate) => candidate.name === useCaseName
  );

  if (!useCase) {
    throw new Error(`Use case not found in analysis summary: ${useCaseName}`);
  }

  if (!useCase.interactions?.length) {
    throw new Error(`Use case has no interactions: ${useCaseName}`);
  }

  return useCase.interactions;
}

function selectInteraction(
  interactions: Interaction[],
  useCaseName: string,
  interactionName?: string
): Interaction {
  if (interactionName) {
    const interaction = interactions.find(
      (candidate) => candidate.interaction_name === interactionName
    );
    if (!interaction) {
      throw new Error(
        `Interaction not found for use case ${useCaseName}: ${interactionName}`
      );
    }
    return interaction;
  }

  if (interactions.length > 1) {
    throw new Error(
      `Use case ${useCaseName} has multiple interactions; provide an interaction name to select one.`
    );
  }

  return interactions[0];
}

export async function getUseCaseDiagramData(
  useCaseName: string,
  interactionName?: string
): Promise<UseCaseDiagramData> {
  const summary = (await getAnalysisSummary()) as AnalysisSummary;
  const interactions = getInteractionsForUseCase(summary, useCaseName);
  const interaction = selectInteraction(
    interactions,
    useCaseName,
    interactionName
  );
  const detail = (await getInteractionDetails(
    interaction.interaction_id
  )) as Record<string, unknown>;

  return {
    interactionId: interaction.interaction_id,
    interactionName:
      typeof detail.interaction_name === 'string'
        ? detail.interaction_name
        : interaction.interaction_name,
    nodes: toCaNodes(detail.nodes),
    edges: toCaEdges(detail.edges),
  };
}
