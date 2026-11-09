import type { CleanNode } from '../types/cleanNode.js';
import type { NeighbourMap } from '../types/neighbourMap.js';
import type { RelationshipType } from '../types/relationship.js';

export class UseCaseGraph {
  private readonly name: string;
  private readonly outNeighbours: NeighbourMap;
  private violationEdges: [CleanNode, CleanNode][] = [];
  private readonly files = new Map<string, string>();
  private readonly edgeTypes = new Map<string, RelationshipType>();

  constructor(name: string) {
    this.name = name;
    this.outNeighbours = UseCaseGraph.createEmptyNeighbourMap();
  }

  private static createEmptyNeighbourMap(): NeighbourMap {
    return {
      controller: [],
      presenter: [],
      viewModel: [],
      view: [],
      dataAccess: [],
      database: [],
      entities: [],
      inputData: [],
      inputBoundary: [],
      outputData: [],
      outputBoundary: [],
      useCaseInteractor: [],
      dataAccessInterface: [],
    };
  }

  /**
   * Add a file to this use case.
   * @param name The name of the file.
   * @param path The path to the file.
   */
  addFile(name: string, path: string): void {
    this.files.set(name, path);
  }

  getFiles(): Map<string, string> {
    return this.files;
  }

  getName(): string {
    return this.name;
  }

  /**
   * Get the list of out-neighbours from node.
   * @param node is a CleanNode type.
   * @returns an array of cleanNodes.
   */
  getNodeNeighbours(node: CleanNode): CleanNode[] {
    return this.outNeighbours[node];
  }

  /**
   * Set a node as an out neighbour with a directed edge starting at from and ending at to.
   * This function will not add a pre-existing CleanNode, nor will it allow a node to reference
   * itself.
   * @param from is of a CleanNode type.
   * @param to is of a CleanNode type.
   */
  setNodeNeighbour(from: CleanNode, to: CleanNode): void {
    if (from === to) {
      return;
    }
    if (!this.outNeighbours[from].includes(to)) {
      this.outNeighbours[from].push(to);
    }
  }

  /**
   * Sets a violation of the Clean Architecture structure within a use case.
   * @param edge is a tuple [from, to] which indicates the origin and destination of the violation.
   */
  setViolation(edge: [CleanNode, CleanNode]): void {
    this.violationEdges.push(edge);
  }

  getViolationCount(): number {
    return this.violationEdges.length;
  }

  getViolationEdges(): [CleanNode, CleanNode][] {
    return this.violationEdges;
  }

  hasViolations(): boolean {
    return this.violationEdges.length > 0;
  }

  resetViolations(): void {
    this.violationEdges = [];
  }

  getNeighbourMap(): NeighbourMap {
    return this.outNeighbours;
  }

  /**
   * Record the relationship type of the edge from -> to. Several files can map
   * onto the same pair of nodes, so an implements/extends relationship is never
   * downgraded back to a plain dependency.
   * @param from is of a CleanNode type.
   * @param to is of a CleanNode type.
   * @param type the relationship between the two nodes.
   */
  setEdgeType(from: CleanNode, to: CleanNode, type: RelationshipType): void {
    const key = `${from}->${to}`;
    if (type === 'dependency' && this.edgeTypes.has(key)) return;
    this.edgeTypes.set(key, type);
  }

  getEdgeType(from: CleanNode, to: CleanNode): RelationshipType {
    return this.edgeTypes.get(`${from}->${to}`) ?? 'dependency';
  }

  getEdgeTypes(): Map<string, RelationshipType> {
    return this.edgeTypes;
  }

  /**
   * Iterate through the outneighbour map and return a list of nodes that NEVER appear.
   * That is a node's list is empty, and the node is never referenced by another node.
   *
   * It is assumed that this use case graph's outneighbour map has been fully developed.
   *
   * @returns a list of cleanNodes, those that are missing from this use case.
   */
  getMissingNodes(): CleanNode[] {
    let verificationList = Object.keys(this.outNeighbours) as CleanNode[];

    for (const [node, neighbours] of Object.entries(this.outNeighbours)) {
      if (neighbours.length > 0) {
        verificationList = verificationList.filter((n) => n !== node);
      }
      verificationList = verificationList.filter(
        (n) => !neighbours.includes(n as CleanNode)
      );
    }

    return verificationList;
  }
}
