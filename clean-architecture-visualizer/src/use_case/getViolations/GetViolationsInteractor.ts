import path from 'node:path';
import type { CleanArchInfoAccessInterface } from '../../data_access/cleanArchInfoAccessInterface.js';
import type { FileAccessInterface } from '../../data_access/fileAccessInterface.js';
import type { SessionDBAccessInterface } from '../../data_access/sessionDBAccessInterface.js';
import { useCaseGraph } from '../../entity/useCaseGraph.js';
import type { cleanNode } from '../../types/cleanNode.js';
import type { GetViolationsInputBoundary } from './GetViolationsInputBoundary.js';
import type { GetViolationsInputData } from './GetViolationsInputData.js';
import type { GetViolationsOutputData } from './GetViolationsOutputData.js';

export type ViolationResponse = {
  violations: ViolationEntry[];
};

export type ViolationEntry = {
  id: string;
  type: 'INCORRECT_DEPENDENCY';
  message: string;
  suggestion: string;
  related_node_ids: string[];
  related_edge_id: string;
  file_context?: FileContext;
};

export type FileContext = {
  /** Basename of the offending file (kept for the web frontend). */
  file: string;
  /** Path of the offending file, relative to the analysed project root. */
  path: string;
  line_number?: number;
  snippet?: string;
};

export class GetViolationsInteractor implements GetViolationsInputBoundary {
  constructor(
    private readonly db: SessionDBAccessInterface,
    private readonly fileAccess: FileAccessInterface,
    private readonly inputData: GetViolationsInputData,
    private readonly outputData: GetViolationsOutputData,
    private readonly cleanArchInfo?: CleanArchInfoAccessInterface
  ) {}

  async execute(): Promise<void> {
    const interactionId = this.inputData.getInteractionId();

    const useCase = this.db.getUseCaseById(interactionId);
    if (!useCase) return undefined;
    const validOutNeighbours = this.cleanArchInfo
      ? await this.cleanArchInfo.getValidOutNeighbours()
      : undefined;
    const violations: ViolationEntry[] = await Promise.all(
      useCase.violationEdges.map(async ([from, to], index) => {
        const edgeId = `${from}->${to}`;
        const relatedNodeIds = this.resolveRelatedNodeIds(
          from,
          to,
          useCase.fileKeys,
          useCase.name
        );
        const fileContext = await this.resolveFileContext(
          from,
          to,
          useCase.fileKeys,
          useCase.name
        );

        return {
          id: `v-${index}`,
          type: 'INCORRECT_DEPENDENCY',
          message: buildViolationMessage(
            from,
            to,
            validOutNeighbours?.[from],
            fileContext?.file
          ),
          suggestion: '',
          related_node_ids: relatedNodeIds,
          related_edge_id: edgeId,
          file_context: fileContext,
        };
      })
    );
    this.outputData.setOutputData(violations);
  }

  /**
   * Find node ids in the DB that match the source or target of the violation
   * and belong to this use case's file keys.
   */
  private resolveRelatedNodeIds(
    from: cleanNode,
    to: cleanNode,
    fileKeys: string[],
    useCaseName: string
  ): string[] {
    const fileKeySet = new Set(fileKeys);

    return this.db
      .getAllNodes()
      .filter(
        (n) =>
          (n.type === from || n.type === to) &&
          n.filePath !== undefined &&
          ((n.filePath.split('/').length > 0
            ? fileKeySet.has(n.filePath.split('/').at(-1) as string) &&
              this.findNodeContainsUseCase(n.id, useCaseName)
            : false) ||
            (fileKeySet.has(n.filePath) &&
              this.findNodeContainsUseCase(n.id, useCaseName)))
      )
      .map((n) => n.id);
  }

  /**
   * Reads the source file of the violation's origin node to populate file_context.
   * Returns undefined if no matching file is found in this use case's file keys.
   */
  private async resolveFileContext(
    from: cleanNode,
    to: cleanNode,
    fileKeys: string[],
    useCaseName: string
  ): Promise<FileContext | undefined> {
    const fileKeySet = new Set(fileKeys);
    // It is possible for multiple files to have the desired clean node and have the same file structure
    const matchingNodes = this.db
      .getAllNodes()
      .filter(
        (n) =>
          n.type === from &&
          n.filePath !== undefined &&
          ((n.filePath.split('/').length > 0
            ? fileKeySet.has(n.filePath.split('/').at(-1) as string) &&
              this.findNodeContainsUseCase(n.id, useCaseName)
            : false) ||
            (fileKeySet.has(n.filePath) &&
              this.findNodeContainsUseCase(n.id, useCaseName)))
      );

    if (!matchingNodes) return undefined;
    for (const matchingNode of matchingNodes) {
      const fileName = matchingNode.filePath?.split('/').at(-1);
      if (!fileName) return undefined;
      const [snippet, line_number] = await Promise.all([
        this.fileAccess.getFileSnippet(matchingNode.filePath as string, to),
        this.fileAccess.getLineNumber(matchingNode.filePath as string, to),
      ]);

      if (snippet && line_number) {
        return {
          file: fileName,
          path: path
            .relative(process.cwd(), matchingNode.filePath as string)
            .split(path.sep)
            .join('/'),
          ...(snippet && { snippet }),
          ...(line_number && { line_number }),
        };
      }
    }
    // This SHOULD never run
    return undefined;
  }

  /*
  Determines if the nodeId if part of the use case graph.
  */
  private findNodeContainsUseCase(
    nodeId: string,
    useCaseName: string
  ): boolean {
    if (nodeId.length < useCaseName.length) {
      return false;
    }
    return nodeId
      .slice(nodeId.length - useCaseName.length)
      .includes(useCaseName);
  }
}

/**
 * Turns a camelCase clean node name into plain words,
 * e.g. "useCaseInteractor" -> "use case interactor".
 */
function describeNode(node: cleanNode): string {
  return node.replace(/([A-Z])/g, ' $1').toLowerCase();
}

/** Adds an indefinite article ("a"/"an"), except for the plural "entities". */
function withArticle(node: cleanNode): string {
  const words = describeNode(node);
  if (node === 'entities') return words;
  // "use" sounds like "you", so it takes "a" ("a use case interactor").
  return /^[aeio]/.test(words) ? `an ${words}` : `a ${words}`;
}

function joinWithOr(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} or ${items.at(-1)}`;
}

/**
 * Builds a student-facing explanation of an incorrect dependency, e.g.
 * "EnrollStudentController (controller) depends on entities. In Clean
 * Architecture, a controller may only depend on input data or input boundary."
 * @param from the node type that owns the offending import.
 * @param to the node type it should not depend on.
 * @param allowed the node types `from` may depend on, if known.
 * @param fileName the offending file's name, if known.
 */
export function buildViolationMessage(
  from: cleanNode,
  to: cleanNode,
  allowed?: cleanNode[],
  fileName?: string
): string {
  const className = fileName?.split('.').at(0);
  const subject = className
    ? `${className} (${describeNode(from)})`
    : describeNode(from).replace(/^./, (c) => c.toUpperCase());
  const problem = `${subject} depends on ${describeNode(to)}.`;
  if (!allowed) return problem;
  const rule =
    allowed.length === 0
      ? `In Clean Architecture, ${withArticle(from)} must not depend on any other Clean Architecture component.`
      : `In Clean Architecture, ${withArticle(from)} may only depend on ${joinWithOr(allowed.map(describeNode))}.`;
  return `${problem} ${rule}`;
}
