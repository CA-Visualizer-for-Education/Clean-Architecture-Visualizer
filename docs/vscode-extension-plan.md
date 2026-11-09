# VSCode Extension Plan — Clean Architecture Verification for Students

> Status: Planning (MVP scoped) · Date: 2026-11-09

## 1. Goal

Let a student open their project in VSCode, run one command, and immediately see
whether their code adheres to Clean Architecture — with each violation pointing at
the exact import line that breaks a dependency rule, and a plain-English explanation
of the rule.

Primary user: **the student**, self-checking as they build (not an instructor grading
submissions — that's a parked stretch item).

## 2. What it does (MVP)

1. Student opens their project (Java / Python / JS / TS; Java is the best-supported
   happy path) in VSCode.
2. Student runs **Command Palette → "CAVE: Verify Clean Architecture"** (optionally a
   status-bar button).
3. The extension analyzes the project and reports **incorrect-dependency violations**
   as **Warning-severity diagnostics**:
   - A red/yellow squiggle on the offending `import` line.
   - An entry in VSCode's native **Problems panel** that, when clicked, jumps to that
     line.
   - Each diagnostic carries a human-readable message, e.g.
     *"`LoginController` imports `User` (entities) — a controller may only depend on
     input boundaries / input data."*
4. On a clean run, an explicit **"✓ Project adheres to Clean Architecture"**
   notification (not silent).
5. If no recognizable Clean Architecture layout is found, a single **guidance
   message** instead of a flood of false violations.

## 3. Core design decisions (and why)

| # | Decision | Rationale |
|---|----------|-----------|
| Audience | Student self-checking | Tone is teaching ("here's the rule you broke"), not pass/fail scoring. |
| Engine | Reuse the existing `cave` verification engine | Don't reimplement Clean Architecture checks; the engine already exists. |
| Core output | Actionable per-violation list | What a student can act on; any aggregate score is secondary, parked. |
| Surface (Q5) | **Inline diagnostics + Problems panel** | Actionable in-editor, reuses native VSCode UI, matches teaching goal. A terminal dump just restates the existing CLI. |
| Trigger (Q6) | **Manual command** | Engine scans the whole project per run; manual trigger keeps the editor responsive. On-save is a later upgrade. |
| Languages (Q7) | **Language-agnostic**, Java documented as best-supported | Engine is already multi-language; the heuristic parser is the real limiter, not a language gate. |
| Integration seam (Q8) | **New `cave verify --json`** stdout command, spawned as a child process | No ports/server lifecycle (vs `cave start` REST); no library refactor (engine is hardwired to `process.cwd()` with no exported API). One-shot, testable. |
| Code location (Q9) | **New `vscode-extension/` folder in this repo** | Extension and the `--json` contract evolve together; one PR, shared CI. |
| Teaching payload (Q10) | **Populate `message` + resolve full file path** | The explanation is the point for a student; full path is required to anchor diagnostics anyway. |
| Severity + success (Q11) | **Warning** severity + explicit success notification | Learning feedback on work-in-progress, not compiler errors; never silently show nothing. |
| Packaging (Q12) | **Bundle the compiled engine in the `.vsix`**, run via the extension host's Node | Student installs only the extension — no `npm i -g`, no separate setup. |
| Empty state (Q13) | **Explicit "no recognizable CA layout" message** | Engine infers structure from folder names; a non-matching project must get guidance, not noise. |
| Violation kinds (Q14) | **Incorrect-dependency violations only** in MVP | They map cleanly to file+line; cross-use-case and missing-node reporting are fuzzier/noisier and parked. |
| Analyzed folder (Q15) | **Workspace root by default + `cave.projectRoot` setting** | Right default; a one-time setting handles nested projects without prompting each run. |

## 4. Engine work required (in `clean-architecture-visualizer/`)

These are prerequisites the extension depends on. All are additive to the existing engine.

1. **Add a headless JSON command** `cave verify --json`:
   - Runs the existing `GetViolations` path (not just the logical-edge CLI output).
   - Prints a single structured `ViolationResponse` JSON object to **stdout**.
   - Non-zero vs zero exit code, or a status field, to distinguish "violations found",
     "clean", and "no recognizable layout".
   - Entry point lives alongside the existing `verify` command in `src/app/index.ts`.
2. **Surface the full file path** in `file_context`:
   - Today `file_context.file` is only the **basename** (see
     `src/use_case/getViolations/GetViolationsInteractor.ts`); the full path already
     exists on the node (`NodeStorage.filePath`). Expose it (add `path` / make `file`
     absolute or workspace-relative) so diagnostics can anchor to the right document.
3. **Populate `message`** with a human-readable rule explanation:
   - Currently always `''`. Build it from the violated edge (`from` node type → `to`
     node type) and the rule in `src/database/cleanArchStaticInfo.json`.
   - `suggestion` can start minimal/empty and grow later.
4. **Accept an explicit project root** (optional but recommended): the engine is
   hardwired to `process.cwd()`. The extension can satisfy this by spawning the child
   process with `cwd` set to the resolved project root, so a code change may not be
   strictly required — but a `--path` flag would be cleaner and more testable.

### Known engine caveats to account for

- Analysis is **heuristic**: node types are inferred from **filename substrings**, and
  imports are parsed by **regex/line-scanning, not an AST**. Results can be approximate.
- `line_number` is the **first matching `import` line**; there is **no column**, and no
  handling of multiple matching imports. Diagnostics should anchor to the whole line.
- `file_context` is only attached when both snippet and line number are found; otherwise
  the violation still exists logically but has no location. The extension must handle
  **located** vs **unlocated** violations (e.g. put unlocated ones in a summary line,
  not as a phantom squiggle).

## 5. Extension architecture (`vscode-extension/`)

- **`package.json`** — contributes:
  - Command `cave.verify` ("CAVE: Verify Clean Architecture").
  - Setting `cave.projectRoot` (string, default = workspace root).
  - (Optional) a status-bar item to trigger the command.
- **Activation**: on command invocation (and/or `onStartupFinished` to register the
  status-bar item). Keep activation lazy.
- **Runner**: spawn the bundled `cave verify --json` with `cwd` = resolved project root,
  capture stdout, parse the `ViolationResponse`.
- **Diagnostics mapper**: convert each located violation into a
  `vscode.Diagnostic` (Warning) on the file's line range; group by file into a
  `DiagnosticCollection` so re-runs replace prior results cleanly.
- **Notifications**: success toast on clean run; guidance message on unrecognized layout;
  error surface if the child process fails.
- **Bundled engine**: the compiled engine ships inside the `.vsix`; build step copies the
  engine `dist/` (and its runtime deps) into the extension and keeps versions in sync.

## 6. Primary flow (happy path)

```
Student runs "CAVE: Verify Clean Architecture"
        │
        ▼
Extension resolves project root (cave.projectRoot or workspace root)
        │
        ▼
Spawn bundled `cave verify --json` with cwd = project root
        │
        ├─ exit: clean        → clear diagnostics, show "✓ adheres" toast
        ├─ exit: no layout     → clear diagnostics, show guidance message
        └─ exit: violations    → parse ViolationResponse
                                    │
                                    ├─ located violations  → Warning diagnostics (squiggle + Problems panel)
                                    └─ unlocated violations → summary notification / output line
```

## 7. Explicitly parked (post-MVP)

- Auto-run on save / on type (needs fast, incremental analysis).
- Cross-use-case-edge and missing-node reporting.
- `suggestion` / quick-fix auto-remediation.
- Aggregate compliance score / summary webview or dependency-graph panel.
- Instructor "grading mode" (pass/fail scoring of submissions).
- CI integration.

## 8. Open follow-ups (not blockers)

- Confirm how the build keeps the bundled engine version in lockstep with the repo.
- Decide workspace-relative vs absolute paths in the `--json` output (relative is more
  portable; the extension resolves against the project root).
- A `GLOSSARY.md` for shared vocabulary (node, edge, layer, use-case graph, violation,
  located vs unlocated violation) and a possible ADR for the `cave verify --json`
  integration seam — offered separately.
