# Review: identifier casing (#240), before the PR opens

**Verdict: open as is.** The branch does exactly what #240 asks, passes every
check, and renames correctly at every use. The findings below are cosmetic
leftovers (a few comments and test names, one const-casing choice) and two
spec-accuracy notes; none blocks merge under the "at least pretty good" bar.

## Checks rerun (throwaway worktree under `$TMPDIR`, branch `cav-240-review` at `c9cfc44`)

| Check | Result |
|---|---|
| `npm ci` (root, backend, frontend) | passed |
| `npm run verify` | **exit 0**. Jest: 19 suites / 255 tests. Vitest: 7 files / 52 tests. Both type checks pass. `biome ci` passes with 251 warnings. |
| `npm run codemod:rename` then `git status --short` | exit 0; tree left clean (second run changes nothing) |

## Questions answered

1. **Table vs ADRs.** Every entry in `rename-table.json` moves an abbreviation to
   word-casing (ADR-0002), a camelCase type to PascalCase (ADR-0001), or a
   snake_case local to camelCase; the US-spelling target `NeighborMap` follows
   ADR-0004. No identifier in #240's scope is missed: the only remaining
   PascalCase/abbreviation warnings (`CAComponentType` at
   `frontend/src/lib/types.ts:25`, `cleanNodeToCAComponentType` at
   `CADiagram.tsx:35`, and the PascalCase keys at `CADiagram.tsx:20-32`) are the
   frontend's PascalCase node type and its conversion, which #240's acceptance
   criterion explicitly leaves to #243. All remaining `useNamingConvention`
   warnings are JSON field names (`file_path`, `line_number`,
   `total_violations`, `use_cases`, ...), which are out of #240's scope.
2. **Scope.** The branch renames only identifiers #240 names, plus three already
   merged file renames (they live in `rename-table.json` for re-runnability and
   are skipped as already applied on `main`). No behaviour changes: shorthand
   renames keep their keys (`{ file_path }` → `{ file_path: filePath }`,
   `{ line_number }` → `{ line_number: lineNumber }`), JSON payload keys stay
   as the API contract (#245), and the `f2da045` `createRoot` import replaces a
   CAVE-chosen `ReactDOM` name that breaks ADR-0002, needing no biome-ignore.
   The `neighbourMap→NeighborMap` rename is #242's US-spelling work, folded in
   deliberately and documented (finding 3).
3. **Correctness at every use.** Verified the object-key, shorthand, export-list,
   string-keyed-lookup (`Object.keys(...) as CleanNode[]`), and mock-module
   cases; the passing 255 Jest + 52 Vitest tests and both type checks confirm
   every reference resolves and every shared JSON key still agrees between
   backend and frontend.
4. **Codemod fixes.** `e2a9604`, `4b6f44f`, `49a8636` each add a test; running
   each test against the parent (pre-fix) `rename.ts` fails it (1 failed, 13
   skipped), so each fix is covered by a test that fails without it.
5. **Merge conflicts (`dfce40b`).** `getUseCaseInfoInteractor.ts` keeps `main`'s
   `buildNodes(useCase, edges)` rewrite and the branch's
   `SessionDbAccessInterface` renames; `graphVerificationInteractor.ts` keeps
   `main`'s `viewmanager` check and `belongsToOtherUseCase` method and the
   branch's `CleanLayer`/`CleanNode` renames. No behaviour lost from either side.
6. **README paragraph (`c9cfc44`).** Accurate: `renameIdentifiers` finds uses
   through the declaration, so once the declaration has the new name a use of
   the old name in merged code points at nothing and is left for `npm run
   verify` to report. (File imports of merged old paths *are* still updated, and
   the paragraph correctly speaks of identifiers.)
7. **Commits.** All subjects are Conventional Commits (`type(scope): subject`,
   lowercase, no period), and each kind of rename is on its own commit
   (abbreviations/types `a3dca49`, snake_case locals `bead9cf`, spelling
   `601a66d`, library names `326e432`, docs `5d14af1`/`d548999`/`c9cfc44`).

## Claims checked

- `npm run verify` passes: **confirmed** (counts above).
- A second codemod run changes nothing: **confirmed** (clean tree).
- `bd7b3cd` message says the codemod can't rename old names in merged code
  because their declarations already have the new names: **confirmed**.

## Findings

| # | Severity | Finding | Evidence | Fix |
|---|---|---|---|---|
| 1 | Low | A few comments and test names still use the old identifiers, despite `5d14af1` ("comments") and `d548999` ("test names"). | `getUseCaseInfoInteractor.ts:98` comment "one entry per missing cleanNode type"; `tests/backend/entity/useCaseGraph.test.ts:4` `describe('useCaseGraph edge types')`; `tests/backend/use_cases/graphVerification.test.ts:578` `describe('useCaseGraph edge type storage')`. | Rewrite them to `CleanNode` and `UseCaseGraph` (comments and describe strings are cosmetic, not biome-checked). |
| 2 | Low | `ROOT_PATH→rootPath` renames a CONSTANT_CASE const to camelCase. It is out of #240's "snake_case local names" scope (ROOT_PATH is UPPER_CASE), and the Style Guide says "constants are CONSTANT_CASE"; biome accepts either form, so the old name wasn't a warning. | `codemods/rename-table.json:119,124`; `tests/backend/use_cases/init-project.test.ts`, `initModuleProject.test.ts`. | Either leave `ROOT_PATH` as-is (it wasn't warned) or keep the camelCase rename deliberately as a const-casing decision — one line in the commit message makes it reviewable. |
| 3 | Info | `neighbourMap→NeighborMap` is #242's US-spelling rename included in #240; documented in `601a66d` as needed to stop the codemod introducing a Canadian spelling (the table first said `NeighbourMap`). The Canadian local `neighbourMap` at `graphVerificationInteractor.ts:657` is correctly left for #242. | `601a66d` message; `graphVerificationInteractor.ts:657`. | None — on spec. #242 should pick up the remaining Canadian names (`outNeighbours`, `getNeighbourMap`, `getNodeNeighbours`, the JSON keys, and this local). |
| 4 | Info | Issue #240's acceptance criterion #4 says remaining warnings will be "only JSON fields and the node and layer types #243 removes", but `biome ci` still reports ~50 `useFilenamingConvention` warnings (camelCase filenames such as `CADiagram.tsx`, `sessionDBAccess.ts`, `appBuilder.ts`) and `noDefaultExport` warnings — those are #246/#235's scope. The comment hasn't been posted yet (issue has 0 comments). | `npm run verify` biome output, "Found 251 warnings". | When posting the acceptance-comment, list the file-name warnings too (or note they're deferred to #246), so the criterion's "only JSON fields and node/layer types" claim is accurate. |
| 5 | Info | `biome.json` allows only `kebab-case` filenames, so biome flags React component files (`CADiagram.tsx`, `CADiagramView.tsx`, `CANodeView/`, ...) that ADR-0003 says may be PascalCase; the config lacks ADR-0003's PascalCase exception. Pre-existing and #246's scope. | `biome.json` `useFilenamingConvention` options (`["kebab-case"]`). | None here — leave for #246, which owns file names. |

## Notes

- The release gate (`release-gate.yml`) is a CI workflow (build, `npm pack`,
  install, run `cave-test-repo` samples); it is part of issue #240's acceptance
  criteria but was not in the review request's checks or claims. It will run on
  the PR; nothing in this review suggests it will fail.

**ds4-flash (DeepSeek V4 Flash):**
