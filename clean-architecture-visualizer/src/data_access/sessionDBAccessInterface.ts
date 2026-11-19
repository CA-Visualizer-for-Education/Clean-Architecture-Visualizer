import type { UseCaseGraph } from '../entity/useCaseGraph.js';
import type { CleanLayer } from '../types/clean-layer.js';
import type { CleanNode } from '../types/cleanNode.js';
import type {
  EdgeStorage,
  FileStorage,
  NodeStorage,
  SessionData,
} from '../types/sessionData.js';

export interface SessionDbAccessInterface {
  // Setters
  setProjectName(name: string): void;
  setNumUseCases(count: number): void;
  setNumViolations(count: number): void;

  // Setters — useCases
  setUseCases(useCaseList: UseCaseGraph[], files: FileStorage[]): void;
  upsertUseCase(entry: SessionData['useCases'][number]): void;
  removeUseCase(id: string): void;

  // Setters — files
  setFiles(files: FileStorage[]): void;
  upsertFile(file: FileStorage): void;
  removeFile(filePath: string): void;

  // Setters — edges
  setEdges(edges: EdgeStorage[]): void;
  upsertEdge(edge: EdgeStorage): void;
  removeEdge(id: string): void;

  // Setters — nodes
  setNodes(nodes: NodeStorage[]): void;
  upsertNode(node: NodeStorage): void;
  removeNode(id: string): void;

  // Getters
  getProjectName(): string;
  getNumUseCases(): number;
  getNumViolations(): number;

  // Getters — useCases
  getAllUseCases(): SessionData['useCases'];
  getUseCaseById(id: string): SessionData['useCases'][number] | undefined;
  getUseCaseNeighbours(
    id: string
  ): SessionData['useCases'][number]['outNeighbours'] | undefined;
  getUseCaseFileKeys(id: string): string[] | undefined;
  getUseCaseViolationEdges(
    id: string
  ): SessionData['useCases'][number]['violationEdges'] | undefined;
  getUseCaseMissingNodes(id: string): CleanNode[] | undefined;

  // Getters — files
  getAllFiles(): FileStorage[];
  getFileByPath(filePath: string): FileStorage | undefined;
  getFilesByLayer(layer: CleanLayer): FileStorage[];
  getFilesByType(fileType: FileStorage['fileType']): FileStorage[];
  getFilesByNode(node: CleanNode): FileStorage[];

  // Getters — edges
  getAllEdges(): EdgeStorage[];
  getEdgeById(id: string): EdgeStorage | undefined;
  getEdgesBySource(source: string): EdgeStorage[];
  getEdgesByTarget(target: string): EdgeStorage[];
  getEdgesByStatus(status: EdgeStorage['status']): EdgeStorage[];

  // Getters — nodes
  getAllNodes(): NodeStorage[];
  getNodeById(id: string): NodeStorage | undefined;
  getNodesByType(type: CleanNode): NodeStorage[];
  getNodesByLayer(layer: CleanLayer): NodeStorage[];
  getNodesByStatus(status: NodeStorage['status']): NodeStorage[];
  getNodeByFilePath(filePath: string): NodeStorage | undefined;
  getNodeByName(name: string): NodeStorage | undefined;

  // reset db
  resetDb(): undefined;
}
