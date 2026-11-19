# Review request: identifier casing (#240), before the PR opens

The branch `chore/identifier-casing` renames identifiers across the backend, its
tests, and the frontend to the casing in ADR-0001 and ADR-0002, mostly by
running the rename codemod. It has reached the second-opinion gate for a PR
before it opens. The bar is "at least pretty good", not perfect.

The review is read-only. Leave the repo, GitHub, and the vault as they are. The
review file is your only output.

## What to read

- **The work:** branch `chore/identifier-casing`, base `9b22d30` (current
  `origin/main`). `git log --oneline 9b22d30..chore/identifier-casing` lists
  the 15 commits, and `git diff 9b22d30...chore/identifier-casing` shows the
  change.
- **The codemod:** `clean-architecture-visualizer/codemods/` (`rename.ts`,
  `rename-table.json`, `README.md`) and its tests in
  `clean-architecture-visualizer/tests/codemods/`.
- **The spec:** issue #240 (`gh issue view 240 --comments`), ADRs 0001–0004
  in `docs/developers/adr/`, and `GLOSSARY.md`.
- **The rules:** `AGENTS.md` and `resources/contribution_guidelines.md`.

## Checks to reproduce

Run these in a throwaway worktree under `$TMPDIR` (Node 24.2 or later):

    git worktree add "$TMPDIR/cav-240" chore/identifier-casing
    cd "$TMPDIR/cav-240"
    npm ci
    npm ci --prefix clean-architecture-visualizer
    npm ci --prefix clean-architecture-visualizer/frontend
    npm run verify
    cd clean-architecture-visualizer && npm run codemod:rename && git status --short

The last command should leave the tree clean. Remove the worktree when you're
done.

## Questions

1. Does every entry in `rename-table.json` follow ADR-0001, ADR-0002, and
   ADR-0004? Are there identifiers in scope for #240 that the table misses?
2. Does the branch rename only what #240 asks for, or does it change behaviour
   or names outside that scope?
3. Is the rename correct at every use? Look at object keys, shorthand
   properties, export lists, string-keyed lookups, JSON payloads shared with
   the frontend, and names used in `jest.mock` or `vi.mock`.
4. Are the codemod fixes (`4b6f44f`, `49a8636`, `e2a9604`) each covered by a
   test that fails without the fix?
5. Were the two merge conflicts in `dfce40b`
   (`getUseCaseInfoInteractor.ts`, `graphVerificationInteractor.ts`) resolved
   without losing behaviour from either side?
6. Is the paragraph added to `codemods/README.md` in `c9cfc44` accurate about
   what a rerun does and doesn't rename?
7. Do the commits follow the repo's commit rules, with each kind of rename in
   its own commit, as the codemod README asks?

## Claims

After your own pass, check each of these claims:

- `npm run verify` passes: 19 Jest suites with 255 tests, 7 Vitest files with
  52 tests, both type checks, and `biome ci`.
- A second run of the codemod changes nothing.
- The commit message of `bd7b3cd` says the codemod can't rename old names in
  merged code because their declarations already have the new names.

## Output

Write `review-240-<reviewer>.md` in this folder, drafted for Paul to confirm.

- Open with a one-line verdict: **open as is**, **open after fixes**, or
  **rethink**.
- Follow with a table of findings. Give each one evidence (`file:line` or
  command output) and a concrete fix.
- End signed `**<reviewer> (<model>):**`.

## Done when

Every question is answered, every check has been rerun with its result
recorded, every claim has been checked, and every finding has a fix.
