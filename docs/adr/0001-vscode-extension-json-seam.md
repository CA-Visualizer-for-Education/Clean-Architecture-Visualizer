# VSCode extension consumes a headless `cave verify --json` command

The planned VSCode extension needs structured violations (file path, line, snippet,
human-readable message) out of the verification engine. We decided to expose these by
adding a one-shot `cave verify --json` CLI command that prints a structured
`ViolationResponse` to stdout, and have the extension spawn it as a child process —
rather than spawning the `cave start` REST server or calling the engine's interactors
in-process.

## Considered Options

- **REST server (`cave start`)**: already serves structured violations over HTTP, but
  forces the extension to manage a port, server lifecycle, and startup/teardown.
- **In-process library calls**: tightest integration, but the engine has no exported
  library API and is hardwired to `process.cwd()`, so it would require a real
  `verify(projectPath)` refactor first.
- **Headless `--json` command (chosen)**: reuses the existing `GetViolations` path with
  no ports and no library refactor; a one-shot process is simple to invoke, test, and
  version alongside the extension in this repo.

## Consequences

The `--json` output is now an API contract between the engine and the extension — its
shape (and the added full file path / populated `message`) must stay stable or be
versioned deliberately. The engine stays `cwd`-driven: the extension sets the child
process `cwd` to the resolved project root.

The contract as implemented: stdout is a single JSON object
`{ schema_version, status: "clean" | "violations" | "no_layout", project_root,
use_cases, violations }`; the exit code is 0 whenever analysis ran and non-zero only
on a crash. Each violation's `file_context.path` is relative to the project root
(`file` remains the basename the web frontend uses). Bump `schema_version` on any
breaking change; the extension refuses versions it doesn't know.
