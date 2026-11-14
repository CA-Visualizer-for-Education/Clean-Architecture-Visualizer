import type { SessionDBAccessInterface } from '../../data_access/sessionDBAccessInterface.js';
import type { EdgeStorage, NodeStorage } from '../../types/sessionData.js';
import type { GetUseCaseInfoInputBoundary } from './getUseCaseInfoInputBoundary.js';
import type { GetUseCaseInfoInputData } from './getUseCaseInfoInputData.js';
import type {
  GetUseCaseInfoOutputData,
  UseCaseEdgeResponse,
  UseCaseInfoResponse,
  UseCaseNodeResponse,
} from './getUseCaseInfoOutputData.js';

export class GetUseCaseInfoInteractor implements GetUseCaseInfoInputBoundary {
  constructor(
    private readonly db: SessionDBAccessInterface,
    private readonly outputData: GetUseCaseInfoOutputData
  ) {}

  async execute(inputData: GetUseCaseInfoInputData): Promise<void> {
    const id = inputData.getUseCaseId();
    const useCase = this.db.getUseCaseById(id);

    if (!useCase) return;

    console.log('useCase:', JSON.stringify(useCase, null, 2));

    // Edges are built first so buildNodes can make sure every edge endpoint
    // (including external nodes such as view, entities, database) has a node.
    const edges = this.buildEdges(useCase);
    const nodes = this.buildNodes(useCase, edges);

    const result: UseCaseInfoResponse = {
      interaction_name: useCase.name,
      nodes: nodes,
      edges: edges,
      decoupling: false,
    };

    /**
     * Checking for sub use case.
     * If an edge points to another node that is a use case interactor, then that edge represents a subuse case.
     */

    const hasSubCase = edges.some(
      (edge) =>
        edge.source !== edge.target && edge.target === 'useCaseInteractor'
    );

    if (hasSubCase) {
      result.decoupling = true;
    }

    this.outputData.setOutputData(result);
  }

  /**
   * Build the node list for a use case, one node per node type.
   * - Nodes come from NodeStorage entries whose filePath matches the use
   *   case's fileKeys.
   * - Any node that an edge points to or from is added too, which is what
   *   brings external nodes (view, entities, database, ...) into the graph.
   * - MISSING nodes come from the use case's missingNodes list.
   * Rows belonging to this use case are preferred, since status
   * (VALID / VIOLATION) is stored per use case.
   */
  private buildNodes(
    useCase: ReturnType<SessionDBAccessInterface['getUseCaseById']> & {},
    edges: UseCaseEdgeResponse[]
  ): UseCaseNodeResponse[] {
    const allNodes = this.db.getAllNodes();
    const suffix = `-${useCase.name}`;
    const byType = new Map<string, UseCaseNodeResponse>();

    const pick = (candidates: NodeStorage[]): NodeStorage | undefined =>
      candidates.find((n) => n.id.endsWith(suffix)) ?? candidates[0];

    const add = (node: NodeStorage | undefined): void => {
      if (!node?.type || byType.has(node.type)) return;
      byType.set(node.type, this.formatNode(node));
    };

    // 1. Nodes from the use case's files
    for (const fileKey of useCase.fileKeys) {
      const typed = allNodes.filter((n) => n.type);
      const exact = typed.filter((n) => n.filePath?.endsWith(fileKey));
      const candidates =
        exact.length > 0
          ? exact
          : typed.filter((n) => n.filePath?.includes(fileKey));
      add(pick(candidates));
    }

    // 2. Any node an edge points to or from
    for (const edge of edges) {
      for (const type of [edge.source, edge.target]) {
        if (byType.has(type)) continue;
        add(pick(allNodes.filter((n) => n.type === type)));
      }
    }

    // 3. Missing nodes — one entry per missing cleanNode type
    for (const missingType of useCase.missingNodes) {
      if (byType.has(missingType)) continue;
      add(
        this.db.getNodesByStatus('MISSING').find((n) => n.type === missingType)
      );
    }

    return [...byType.values()];
  }

  /**
   * Build the edge list for a use case by collecting all source→target
   * pairs present in the use case's outNeighbours map, then looking them
   * up in EdgeStorage for status information.
   */
  private buildEdges(
    useCase: ReturnType<SessionDBAccessInterface['getUseCaseById']> & {}
  ): UseCaseEdgeResponse[] {
    const result: UseCaseEdgeResponse[] = [];

    for (const [source, targets] of Object.entries(useCase.outNeighbours)) {
      for (const target of targets) {
        const edgeId = `${source}->${target}`;
        const edge = this.db.getEdgeById(edgeId);
        if (!edge) continue;

        result.push(this.formatEdge(edge));
      }
    }

    return result;
  }

  private formatNodeName(node: NodeStorage): string {
    if (!node.type) return node.filePath ?? 'Unknown';
    // convert from camelCase to PascalCase and add spaces between words
    // e.g. "dataAccessInterface" -> "Data Access Interface"
    const nodeNamePascalCase =
      node.type.charAt(0).toUpperCase() + node.type.slice(1);
    const words: string[] = [];

    for (let i = 0; i < nodeNamePascalCase.length; i++) {
      const char = nodeNamePascalCase[i];
      if (char === char.toUpperCase()) {
        words.push(char);
      } else {
        words[words.length - 1] += char;
      }
    }

    const nodeName = words.join(' ');

    if (node.status === 'MISSING') {
      return `${nodeName} (Missing)`;
    } else {
      return nodeName;
    }
  }

  private formatNode(node: NodeStorage): UseCaseNodeResponse {
    return {
      id: node.type,
      name: node.name ?? this.formatNodeName(node),
      type: node.type,
      layer: node.layer,
      ...(node.filePath && { file_path: node.filePath }),
      status: node.status,
    };
  }

  private formatEdge(edge: EdgeStorage): UseCaseEdgeResponse {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      status: edge.status,
    };
  }
}
