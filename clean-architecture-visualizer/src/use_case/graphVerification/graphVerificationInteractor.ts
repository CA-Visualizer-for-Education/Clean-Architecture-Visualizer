import type { FileAccessInterface } from '../../data_access/fileAccessInterface.js';
import type { CleanArchInfoAccessInterface } from '../../data_access/cleanArchInfoAccessInterface.js';
import type { SessionDBAccessInterface } from '../../data_access/sessionDBAccessInterface.js';
import type { GraphVerificationInputBoundary } from './graphVerificationInputBoundary.js';
import type { cleanNode } from '../../types/cleanNode.js';
import { useCaseGraph } from '../../entity/useCaseGraph.js';
import type {
  EdgeStorage,
  FileStorage,
  NodeStorage,
} from '../../types/sessionData.js';
import type { cleanLayer } from '../../types/cleanLayer.js';
import { GraphVerificationOutputData } from './graphVerificationOutputData.js';
import type { GraphVerificationInputData } from './graphVerificationInputData.js';
import type { GraphVerificationOutputBoundary } from './graphVerificationOutputBoundary.js';

export class GraphVerificationInteractor implements GraphVerificationInputBoundary {
  private readonly internalDirectories = ['use_case', 'interface_adapter'];
  private readonly externalDirectories = [
    'entity',
    'views',
    'data_access',
    'database',
  ];

  // Paths are defined as <File Name, File Path>
  private readonly internalFilePaths = new Map<string, string>();
  private readonly externalFilePaths = new Map<string, string>();

  // The node of files <File Name, Node>
  private readonly externalNodes: Record<string, cleanNode> = {};

  private crossUseCaseEdges: Array<[cleanNode, cleanNode]>[] = [];
  private crossUseCaseFiles = new Set<string>();
  private outputData: GraphVerificationOutputData;

  constructor(
    private readonly fileAccess: FileAccessInterface,
    private readonly cleanArchInfoAccess: CleanArchInfoAccessInterface,
    private readonly db: SessionDBAccessInterface,
    private readonly presenter: GraphVerificationOutputBoundary,
    private readonly useCaseGraphList: useCaseGraph[] = [],
    outputData: GraphVerificationOutputData = new GraphVerificationOutputData()
  ) {
    this.outputData = outputData;
  }

  async execute(inputData: GraphVerificationInputData): Promise<void> {
    // restart db
    this.db.resetDB();
    const formatForCLI = inputData.isToCommandLine();

    // main use case logic
    await this.buildFilePaths();
    await this.buildUseCaseGraphs();
    await this.developOutNeighbours();
    await this.verifyOutNeighbours();
    await this.populateDatabase();

    // Paths are defined as <File Name, File Path>
    if (formatForCLI) {
      this.prepareOutput();
      this.presenter.prepareSuccessView(this.outputData);
    }
  }

  /**
   * Build the file paths for internal and external directories. With keys representing file names and
   * values being their respective file paths.
   */
  private async buildFilePaths(): Promise<void> {
    // Must now account for packaging by module -- if features exists, packaging by module
    const currPath = process.cwd();
    if (await this.fileAccess.bfsFindDir(currPath, 'features')) {
      await Promise.all([
        this.fileAccess.getFilePaths('features', this.internalFilePaths),
        ...this.externalDirectories.map((dir) =>
          this.fileAccess.getFilePaths(dir, this.externalFilePaths)
        ),
      ]);
    } else {
      await Promise.all([
        ...this.internalDirectories.map((dir) =>
          this.fileAccess.getFilePaths(dir, this.internalFilePaths)
        ),
        ...this.externalDirectories.map((dir) =>
          this.fileAccess.getFilePaths(dir, this.externalFilePaths)
        ),
      ]);
    }
  }

  /**
   * Create a useCaseGraph for each use case, and assign files to that use case.
   */
  private async buildUseCaseGraphs(): Promise<void> {
    const useCases = await this.fileAccess.getUseCases();
    for (const useCase of useCases) {
      const graph = new useCaseGraph(useCase);
      for (const [fileName, filePath] of this.internalFilePaths) {
        if (filePath.toLowerCase().includes(useCase.toLowerCase())) {
          graph.addFile(fileName, filePath);
        }
      }
      this.useCaseGraphList.push(graph);
    }
  }

  /**
   * Build the outneighbourmaps in each use case using the information from the
   * paths.
   */
  private async developOutNeighbours(): Promise<void> {
    const externalFileNames = [...this.externalFilePaths.keys()].map(
      (name) => name.split('.').at(0) ?? ''
    );

    // Maps external files to the names of the use case graphs they belong to
    let externalFilesToUseCaseGraphs = new Map<string, Set<string>>();
    // Map external file paths to their representative (default is themselves)
    let externalFileRepresentative = new Map<string, string>();
    [...this.externalFilePaths.values()].map((filePath) => {
      externalFileRepresentative.set(filePath, filePath);
      externalFilesToUseCaseGraphs.set(filePath, new Set<string>());
    });
    // allEdges will store all of the edges in the form of (fromNodePath, toNodePath)
    let allEdges: string[][] = [];
    // map use case graph names to graphs
    let useCaseGraphNamesToGraph = new Map<string, useCaseGraph>();
    let useCaseIndex = 0;
    for (const graph of this.useCaseGraphList) {
      this.crossUseCaseEdges.push([]);
      // Get a list of formatted file names in this use case.
      const useCaseFiles = [...graph.getFiles().keys()].map(
        (name) => name.split('.').at(0) ?? ''
      );
      // We use a shallow copy to prevent looking at external files that import external files
      // We only want to look at internal files that import external files
      // Consider removing this if it doesn't affect the overall outcome
      for (const [fileName, filePath] of [...graph.getFiles()]) {
        const fromNode = this.resolveNode(filePath);
        if (!fromNode) continue;
        this.externalNodes[fileName] = fromNode;
        // Stores the names of the files imported (does not store the actual path)
        const imports = await this.fileAccess.getFileImports(filePath);
        for (const importPath of imports) {
          const toNode =
            this.resolveImportToNode(this.internalFilePaths, importPath) ??
            this.resolveImportToNode(this.externalFilePaths, importPath);
          if (toNode) {
            let importFileName = importPath.split('/').at(-1) ?? '';
            importFileName = importFileName.split('.').at(0) ?? '';
            //Check if the imported file is an external file path
            if (
              !useCaseFiles.includes(importFileName) &&
              !externalFileNames.includes(importFileName)
            ) {
              this.crossUseCaseEdges[useCaseIndex].push([fromNode, toNode]);
              this.crossUseCaseFiles.add(filePath);
            } else {
              graph.setNodeNeighbour(fromNode, toNode);
              // A problem we are having is the extensions between js and ts
              // To get around that, we find the externalFileName (has extension) that has the importFileName (no extension)
              const externalFileNamePath = [...this.externalFilePaths].find(
                ([externalFileName, _]) =>
                  externalFileName.includes(importFileName)
              );
              // Making the assumption that no two files are ever named the same
              // this.externalFilePaths maps the name of the file to its filePath
              // importFileName only contains the name of the file

              if (externalFileNamePath) {
                graph.addFile(externalFileNamePath[0], externalFileNamePath[1]);
                // Gets the external file path from the modified import path and adds the use case graph name
                // to the set of use case graphs that the external file belongs to
                // Nothing to optimize.
                externalFilesToUseCaseGraphs
                  .get(externalFileNamePath[1])
                  ?.add(graph.getName());
              }
            }
          }
        }
      }
      useCaseIndex++;
    }

    for (const [fileName, filePath] of this.externalFilePaths) {
      const fromNode = this.resolveNode(filePath);
      if (!fromNode) continue;
      this.externalNodes[fileName] = fromNode;
      const imports = await this.fileAccess.getFileImports(filePath);

      // Get all use case graphs that import this file, add them to externalFilePathToUseCaseGraphs
      // We only set neighbour if it is an internal file and both paths resolve to clean nodes
      // There is probably room to optimize since we iterate #graphs * #imports * #internal_files
      this.useCaseGraphList.map((graph) => {
        useCaseGraphNamesToGraph.set(graph.getName(), graph);
        // Want to add all external files to all use case graphs
        graph.addFile(fileName, filePath);
        imports.map((importPath) =>
          [...graph.getFiles().keys()].map((targetFileName) => {
            const base = targetFileName.toLowerCase().replace(/\.[^.]+$/, '');
            const res = importPath.toLowerCase().includes(base);
            if (res) {
              if (
                this.resolveNode(importPath) &&
                this.internalFilePaths.has(targetFileName)
              ) {
                // We need to set node neighbour and add file now
                // When we do dsu, we only look at external->external edges
                graph.setNodeNeighbour(
                  fromNode,
                  this.resolveNode(importPath) as cleanNode
                );
                graph.addFile(fileName, filePath);
                externalFilesToUseCaseGraphs
                  .get(filePath)
                  ?.add(graph.getName());
              }
            }
          })
        );
      });

      // Add all edges to allEdges as long as it resolves to a node and the import is not an
      // internal file in CA and unite them.
      imports.map((importPath) => {
        if (!this.resolveNode(importPath)) return;
        if (this.resolveImportToFileName(this.internalFilePaths, importPath)) {
          return;
        }

        const targetFileName = this.resolveImportToFileName(
          this.externalFilePaths,
          importPath
        );

        if (!targetFileName) return;

        const toFilePath = this.externalFilePaths.get(targetFileName) as string;
        allEdges.push([filePath, toFilePath]);
        this.unite(
          filePath,
          toFilePath,
          externalFileRepresentative,
          externalFilesToUseCaseGraphs
        );
      });
    }
    allEdges.map(([fromNodePath, toNodePath]) => {
      if (
        toNodePath &&
        this.internalFilePaths.has(toNodePath.split('/').at(-1) ?? '')
      ) {
      }
      const fromNodePathRep = this.findRep(
        fromNodePath,
        externalFileRepresentative,
        externalFilesToUseCaseGraphs
      );

      const fromNode = this.resolveNode(fromNodePath);
      const toNode = this.resolveNode(toNodePath);
      [
        ...(externalFilesToUseCaseGraphs.get(fromNodePathRep) as Set<string>),
      ].map((useCaseGraphName) => {
        const currGraph = useCaseGraphNamesToGraph.get(useCaseGraphName);
        currGraph?.addFile(fromNodePath.split('/').at(-1) ?? '', fromNodePath);
        currGraph?.addFile(toNodePath.split('/').at(-1) ?? '', toNodePath);
        currGraph?.setNodeNeighbour(fromNode as cleanNode, toNode as cleanNode);
      });
    });
  }

  /**
   * Given an external file path, find the xternal file path that represents it
   * @param externalFilePath The external file path we are trying to get the rep of
   * @param externalFilePathRepresentatives The map of external file paths to their reps
   * @param externalFilePathToUseCaseGraphs The map of external file paths to the set of use cases they belong to.
   * @returns The representative (string)
   */
  private findRep(
    externalFilePath: string,
    externalFilePathRepresentatives: Map<string, string>,
    externalFilePathToUseCaseGraphs: Map<string, Set<string>>
  ): string {
    if (
      externalFilePath == externalFilePathRepresentatives.get(externalFilePath)
    ) {
      return externalFilePath;
    }
    const externalFilePathRep: string = externalFilePathRepresentatives.get(
      externalFilePath
    ) as string;
    const rep1Graphs =
      externalFilePathToUseCaseGraphs.get(externalFilePathRep) ??
      new Set<string>();
    const rep2Graphs =
      externalFilePathToUseCaseGraphs.get(externalFilePath) ??
      new Set<string>();
    externalFilePathToUseCaseGraphs.set(
      externalFilePathRep,
      new Set([...rep1Graphs, ...rep2Graphs])
    );
    return this.findRep(
      externalFilePathRep,
      externalFilePathRepresentatives,
      externalFilePathToUseCaseGraphs
    );
  }

  /**
   * Given two external file paths, the map of reps and map of external files to their use case graphs, unite
   * them to have the same rep and unite all of the sets of use case graphs.
   * @param externalFilePath1 The first external file path to unite.
   * @param externalFilePath2 The other external file path to unite.
   * @param externalFilePathRepresentatives The map of external files to their reps.
   * @param externalFilePathsToUseCaseGraphs The map of external files to the use case graphs they belong to.
   * @returns void
   */
  private unite(
    externalFilePath1: string,
    externalFilePath2: string,
    externalFilePathRepresentatives: Map<string, string>,
    externalFilePathsToUseCaseGraphs: Map<string, Set<string>>
  ): void {
    const rep1 = this.findRep(
      externalFilePath1,
      externalFilePathRepresentatives,
      externalFilePathsToUseCaseGraphs
    );
    const rep2 = this.findRep(
      externalFilePath2,
      externalFilePathRepresentatives,
      externalFilePathsToUseCaseGraphs
    );
    if (rep1 != rep2) {
      externalFilePathRepresentatives.set(rep1, rep2);
      const rep1Graphs =
        externalFilePathsToUseCaseGraphs.get(rep1) ?? new Set<string>();
      const rep2Graphs =
        externalFilePathsToUseCaseGraphs.get(rep2) ?? new Set<string>();
      externalFilePathsToUseCaseGraphs.set(
        rep2,
        new Set([...rep1Graphs, ...rep2Graphs])
      );
    }
  }

  /**
   * Given an import path, decide which node this file belongs to.
   * @param importPath the path to a file.
   * @returns
   */
  private resolveNode(importPath: string): cleanNode | null {
    if (!importPath) {
      console.warn('resolveNode called with undefined/empty importPath');
      return null;
    }
    importPath = importPath.toLowerCase().replace(/_/g, '');
    if (importPath.includes('viewmodel')) return 'viewModel'; // must be verified before 'view'
    if (importPath.includes('view')) return 'view';
    if (importPath.includes('database')) return 'database';
    if (importPath.includes('entity') || importPath.includes('entities'))
      return 'entities';
    if (importPath.includes('accessinterface')) return 'dataAccessInterface'; // must be verified before 'dataAccess'
    if (importPath.includes('access')) return 'dataAccess';
    if (importPath.includes('controller')) return 'controller';
    if (importPath.includes('presenter')) return 'presenter';
    if (importPath.includes('inputboundary')) return 'inputBoundary';
    if (importPath.includes('inputdata')) return 'inputData';
    if (importPath.includes('outputboundary')) return 'outputBoundary';
    if (importPath.includes('outputdata')) return 'outputData';
    if (importPath.includes('interactor')) return 'useCaseInteractor';
    return null;
  }

  /**
   * Given an import path, decide which layer this directory belongs to.
   * @param importPath the path to a file.
   * @returns
   */
  private resolveLayer(importPath: string): cleanLayer | undefined {
    importPath = importPath.toLowerCase().replace(/_/g, '');
    if (importPath.includes('viewmodel')) return 'interfaceAdapters'; // must be verified before 'view'
    if (importPath.includes('view')) return 'frameworksAndDrivers';
    if (importPath.includes('database')) return 'frameworksAndDrivers';
    // if (importPath.includes('entities')) return 'enterpriseBusinessRules';
    if (importPath.includes('entity') || importPath.includes('entities'))
      return 'enterpriseBusinessRules';
    if (importPath.includes('accessinterface'))
      return 'applicationBusinessRules'; // must be verified before 'dataAccess'
    if (importPath.includes('access')) return 'frameworksAndDrivers';
    if (importPath.includes('controller')) return 'interfaceAdapters';
    if (importPath.includes('presenter')) return 'interfaceAdapters';
    if (importPath.includes('inputboundary')) return 'applicationBusinessRules';
    if (importPath.includes('inputdata')) return 'applicationBusinessRules';
    if (importPath.includes('outputboundary'))
      return 'applicationBusinessRules';
    if (importPath.includes('outputdata')) return 'applicationBusinessRules';
    if (importPath.includes('interactor')) return 'applicationBusinessRules';
  }

  /**
   * Given a raw import path, find the file name (map key) it refers to within
   * the given file map. Import paths come straight from the source line (still
   * containing quotes/relative-path segments and a possibly different
   * extension), so this matches on the file's basename with its extension
   * stripped rather than requiring an exact key match.
   * @param nodeType a map from file name to file path.
   * @param importPath a raw import path.
   * @returns the matching file name, or undefined if none match.
   */
  private resolveImportToFileName(
    nodeType: Map<string, string>,
    importPath: string
  ): string | undefined {
    const entries = [...nodeType.entries()].sort(
      (a, b) => b[0].length - a[0].length
    );
    for (const [fileName] of entries) {
      const fileType = fileName.toLowerCase().replace(/\.[^.]+$/, '');
      if (!fileType) continue;
      if (importPath.toLowerCase().includes(fileType)) {
        return fileName;
      }
    }
    return undefined;
  }

  /**
   * For each import of a file, determine its what node it belongs to.
   * @param nodeType a map from file name to file path.
   * @param importPath a file path
   * @returns the node that an imported file belongs to.
   */
  private resolveImportToNode(
    nodeType: Map<string, string>,
    importPath: string
  ): cleanNode | null {
    const fileName = this.resolveImportToFileName(nodeType, importPath);
    if (!fileName) return null;
    const filePath = nodeType.get(fileName) as string;
    return this.resolveNode(filePath);
  }

  /**
   * Verify that a usecase's outneighbours are allowed by Clean Architecture.
   */
  private async verifyOutNeighbours(): Promise<void> {
    const validMap = await this.cleanArchInfoAccess.getValidOutNeighbours();

    for (const graph of this.useCaseGraphList) {
      for (const node of Object.keys(validMap) as cleanNode[]) {
        const actualNeighbours = graph.getNodeNeighbours(node);
        const validNeighbours = validMap[node];

        for (const neighbour of actualNeighbours) {
          if (!validNeighbours.includes(neighbour)) {
            graph.setViolation([node, neighbour]);
          }
        }
      }
    }
  }

  /**
   * Build a list of FileStorage objects from a file path map.
   * @param fileMap a map of file name to file path.
   * @returns a list of FileStorage objects.
   */
  private buildFileStorageList(fileMap: Map<string, string>): FileStorage[] {
    const result: FileStorage[] = [];

    for (const [, filePath] of fileMap) {
      const node = this.resolveNode(filePath);
      const layer = this.resolveLayer(filePath);
      if (!node || !layer) continue;

      result.push({
        filePath,
        fileType: this.determineFileType(filePath),
        layer,
        node,
      });
    }

    return result;
  }

  /**
   * Helper function to return the fileType based on the filePath
   */
  private determineFileType(
    filePath: string
  ): 'java' | 'python' | 'javascript' | 'typescript' | 'unknown' {
    if (filePath.endsWith('.java')) return 'java';
    if (filePath.endsWith('.py')) return 'python';
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx'))
      return 'javascript';
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))
      return 'typescript';
    return 'unknown';
  }

  private buildNodeStorageList(files: FileStorage[]): NodeStorage[] {
    const result: NodeStorage[] = [];
    const seenIds = new Set<string>();

    // Go over every use case graph and every one of its files
    // Add it to the list of nodes
    this.useCaseGraphList.map((uc) => {
      // Get all violation nodes
      // There shouldn't be any violation nodes missing since violation nodes are
      // derived from violation edges and violation edges come from edges between
      // nodes that exist in and belong to the graph
      const violationNodes = new Set<cleanNode>();
      uc.getViolationEdges().map(([from, to]) => {
        violationNodes.add(from);
        violationNodes.add(to);
      });
      const nodeTypesSeen = new Set<cleanNode>();
      [...uc.getFiles().values()].map((filePath) => {
        const nodeType = this.resolveNode(filePath);
        nodeTypesSeen.add(nodeType as cleanNode);
        seenIds.add(filePath);
        // We get the file name and if it is an external file, we add it to list of files to add later
        // If it doesn't have the external file yet, set it and move on
        // If it does, we only change it if it doesn't have a violation yet
        // If an external file is a violation in at least one use case, we will make it a violation everywhere
        result.push({
          id: `${filePath}-${uc.getName()}`,
          filePath: filePath,
          type: nodeType as cleanNode,
          layer: this.resolveLayerFromNode(nodeType as cleanNode),
          status:
            violationNodes.has(nodeType as cleanNode) ||
            this.crossUseCaseFiles.has(filePath)
              ? 'VIOLATION'
              : 'VALID',
        });
      });

      // Make a node storage for all missing nodes
      // Missing nodes aren't imported and don't import anything
      // Is it missing if the file exists?
      // In this case, a missing node is one that just doesn't appear at all.
      // If a file has no imports/is not imported, it will appear, just have no edges
      // Consider the idea that if a node has no imports/is not imported, mark it as a violation
      uc.getMissingNodes().map((missingNode) => {
        if (!nodeTypesSeen.has(missingNode)) {
          result.push({
            id: `missing-${missingNode}-${uc.getName()}`,
            type: missingNode,
            layer: this.resolveLayerFromNode(missingNode),
            status: 'MISSING',
          });
        }
      });
    });

    // This is what happens if a file exists, but is not linked to a use case
    // seenIds contain the file paths. If we have seen a filePath, it must belong
    // to a use case. If not, then it goes in this loop.
    for (const file of files) {
      const id = file.filePath;
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      result.push({
        id,
        filePath: file.filePath,
        type: file.node,
        layer: file.layer,
        status: 'VALID',
      });
    }

    return result;
  }
  /**
   * Build a deduplicated list of EdgeStorage objects from all use case graphs.
   * Edges that appear in a use case's violationEdges are marked INCORRECT_DEPENDENCY,
   * all others are VALID.
   */
  private buildEdgeStorageList(): EdgeStorage[] {
    const result: EdgeStorage[] = [];
    const seenIds = new Set<string>();

    for (const uc of this.useCaseGraphList) {
      const violationSet = new Set<string>(
        uc.getViolationEdges().map(([from, to]) => `${from}->${to}`)
      );

      const neighbourMap = uc.getNeighbourMap();
      for (const [fromNode, neighbours] of Object.entries(neighbourMap) as [
        cleanNode,
        cleanNode[],
      ][]) {
        for (const toNode of neighbours) {
          const id = `${fromNode}->${toNode}`;
          if (seenIds.has(id)) continue;
          seenIds.add(id);

          result.push({
            id,
            source: fromNode,
            target: toNode,
            type: 'DEPENDENCY',
            status: violationSet.has(id) ? 'INCORRECT_DEPENDENCY' : 'VALID',
          });
        }
      }
    }

    return result;
  }

  /**
   * Fallback layer resolution by node type, for missing nodes that have no matching file.
   */
  private resolveLayerFromNode(node: cleanNode): cleanLayer {
    switch (node) {
      case 'controller':
      case 'presenter':
      case 'viewModel':
        return 'interfaceAdapters';

      case 'view':
      case 'database':
      case 'dataAccess':
        return 'frameworksAndDrivers';

      case 'inputBoundary':
      case 'inputData':
      case 'outputBoundary':
      case 'outputData':
      case 'useCaseInteractor':
      case 'dataAccessInterface':
        return 'applicationBusinessRules';
      case 'entities':
        return 'enterpriseBusinessRules';
    }
  }

  private async populateDatabase(): Promise<void> {
    const totalUseCases = this.useCaseGraphList.length;
    let violationCount = 0;

    this.useCaseGraphList.forEach((useCase) => {
      violationCount += useCase.getViolationCount();
    });

    const files: FileStorage[] = [
      ...this.buildFileStorageList(this.internalFilePaths),
      ...this.buildFileStorageList(this.externalFilePaths),
    ];
    const nodes: NodeStorage[] = this.buildNodeStorageList(files);
    const edges: EdgeStorage[] = this.buildEdgeStorageList();

    this.db.setNumUseCases(totalUseCases);
    this.db.setNumViolations(violationCount);
    this.db.setUseCases(this.useCaseGraphList, files);
    this.db.setNodes(nodes);
    this.db.setEdges(edges);
    this.db.setProjectName(await this.fileAccess.getProjectName());
  }

  private prepareOutput(): void {
    const lines: string[] = [];
    const lineColours: boolean[] = [];

    let useCaseIndex = 0;
    for (const graph of this.useCaseGraphList) {
      const violations = graph.getViolationEdges();
      const hasViolations =
        violations.length > 0 ||
        this.crossUseCaseEdges[useCaseIndex].length > 0;
      const prefix = hasViolations ? '✗' : '✓';

      lines.push(`${prefix} ${graph.getName()}`);
      lineColours.push(!hasViolations);

      if (hasViolations) {
        for (const [from, to] of this.crossUseCaseEdges[useCaseIndex]) {
          lines.push(`    ${from} → ${to} (external)`);
          lineColours.push(false);
        }
        for (const [from, to] of violations) {
          lines.push(`    ${from} → ${to}`);
          lineColours.push(false);
        }
      }
      useCaseIndex++;
    }
    this.outputData.setOutputData(lines, lineColours);
  }
  getCrossUseCaseEdges(): Array<[cleanNode, cleanNode]>[] {
    return structuredClone(this.crossUseCaseEdges);
  }
}
