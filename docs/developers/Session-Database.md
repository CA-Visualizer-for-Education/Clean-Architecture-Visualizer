---
sidebar_position: 2
---

# Session Database

Cave uses a lightweight file-based session store to persist analysis data between CLI commands. There is no external database — everything is written to a single JSON file in your operating system's temp directory.

## How It Works

When Cave runs, it creates a session file at:

`<os.tmpdir()>/clean-arch-cli-session.json`

For example on macOS/Linux this is typically `/tmp/clean-arch-cli-session.json`, and on Windows `C:\Users\<you>\AppData\Local\Temp\clean-arch-cli-session.json`.

The `SessionDB` class is a generic key-value store that reads and writes this file synchronously. It is typed against `SessionData`, which defines the full shape of everything Cave tracks about your project.

:::note
Always call `.load()` before any read operation — the in-memory state is not automatically synced from disk. Whenever an instance of the `SessionDBAccess` is created `.load()` is run.
:::

## SessionData Structure

This is the top-level type stored in the session file:

| Field | Type | Description |
|---|---|---|
| `projectName` | `string` | Name of the project being analyzed |
| `numUseCases` | `number` | Total number of use cases found |
| `numViolations` | `number` | Total number of clean architecture violations |
| `useCases` | `UseCaseEntry[]` | Per-use-case breakdown (see below) |
| `files` | `FileStorage[]` | All scanned files and their classifications |
| `edges` | `EdgeStorage[]` | Dependency edges between nodes |
| `nodes` | `NodeStorage[]` | All nodes discovered in the project |

### Use Case Entry

Each entry in the `useCases` array contains:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Use case name |
| `outNeighbours` | `neighbourMap` | Adjacency map of node dependencies |
| `fileKeys` | `string[]` | References into the `files` array |
| `violationEdges` | `[cleanNode, cleanNode][]` | Edges that violate clean architecture |
| `missingNodes` | `cleanNode[]` | Expected nodes that were not found |

## Storage Types

### `FileStorage`

Represents a single scanned file:

| Field | Type | Description |
|---|---|---|
| `filePath` | `string` | Absolute path to the file |
| `fileType` | `"java" \| "not_java"` | Whether the file is a Java source file |
| `layer` | `cleanLayer` | Which clean architecture layer it belongs to |
| `node` | `cleanNode` | The node type it represents |

### `EdgeStorage`

Represents a dependency between two nodes:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique edge identifier |
| `source` | `string` | Source node name |
| `target` | `string` | Target node name |
| `type` | `"DEPENDENCY"` | Always `DEPENDENCY` |
| `status` | `"VALID" \| "INCORRECT_DEPENDENCY"` | Whether the dependency is allowed |

### `NodeStorage`

Represents a single node in the architecture graph:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique node identifier |
| `name` | `string?` | Display name |
| `filePath` | `string?` | Path to the corresponding file |
| `type` | `cleanNode` | Node type classification |
| `layer` | `cleanLayer` | Clean architecture layer |
| `status` | `"VALID" \| "MISSING" \| "VIOLATION"` | Health status of the node |

## Clean Architecture Layers

Cave maps every file to one of four clean architecture layers:

| Value | Layer |
|---|---|
| `enterpriseBusinessRules` | Entities |
| `applicationBusinessRules` | Use Cases |
| `interfaceAdapters` | Controllers, Presenters, ViewModels |
| `frameworksAndDrivers` | Views, Databases, Data Access |

## Node Types

Cave recognises the following node types across all layers:

| Node | Layer |
|---|---|
| `entities` | Enterprise Business Rules |
| `inputBoundary` `inputData` `outputBoundary` `outputData` `useCaseInteractor` | Application Business Rules |
| `controller` `presenter` `viewModel` | Interface Adapters |
| `view` `dataAccess` `dataAccessInterface` `database` | Frameworks & Drivers |

## `neighbourMap`

The `neighbourMap` type describes which node types each node is allowed (or found) to depend on:

```typescript
type neighbourMap = Record<cleanNode, cleanNode[]>;
```

For example, a `controller` entry in the map would list all the node types it has outgoing dependencies to. This is used to detect violations — if a dependency points inward past the allowed boundary, it is flagged as `INCORRECT_DEPENDENCY`.