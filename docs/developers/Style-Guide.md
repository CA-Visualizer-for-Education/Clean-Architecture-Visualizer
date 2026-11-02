---
sidebar_position: 1.5
---

# Style Guide

CAVE's TypeScript follows Google's
[TS/JS Style Guide](https://google.github.io/styleguide/tsguide.html), with the project's own
decisions recorded as ADRs. This page lists every rule in one place; follow the links for
the reasons.

Biome checks most rules in CI. Each new rule starts as a warning while the existing code is
brought into line, and becomes an error once its last warning is fixed; `import type` is an
error already, because no code broke it. Rules marked **(review)** are checked in code
review, because Biome can't check them.

## Names

### Casing

- Variables, functions, methods, and properties are `camelCase`; classes, interfaces, types,
  and enums are `PascalCase`; constants are `CONSTANT_CASE`.
  [Google: Naming style](https://google.github.io/styleguide/tsguide.html#naming-style)
- Enum members are `PascalCase` (`NodeKind.Controller`), where Google uses `CONSTANT_CASE`.
  [ADR-0001](./adr/0001-google-typescript-style-guide.md)
- Abbreviations are cased as words: `CaDiagram`, `SessionDbAccess`, `getUseCaseById`, not
  `CADiagram` or `SessionDBAccess`. Prose and UI text still write "CA" and "DB".
  [ADR-0002](./adr/0002-strict-abbreviation-casing.md),
  [Google: Camel case](https://google.github.io/styleguide/tsguide.html#camel-case)
- Names describe what a thing is or does; avoid abbreviations a new reader wouldn't know.
  [Google: Descriptive names](https://google.github.io/styleguide/tsguide.html#descriptive-names)

### Spelling (review)

- Names in code use US spelling (`color`, `neighbor`, `initialize`), matching the platforms
  and libraries they sit beside. Comments, docs, and English UI text use Canadian spelling
  (`colour`, `neighbour`, `analyse`). [ADR-0004](./adr/0004-us-spelling-in-identifiers.md)

### Use case vocabulary (review)

- In code, "use case" names the set of classes that handle one user interaction:
  `useCaseId`, not `interactionId`. "User interaction" appears only in prose. The other
  Clean Architecture terms (Interactor, Input Boundary, Output Data, and so on) are defined
  in the
  [glossary](https://github.com/CA-Visualizer-for-Education/Clean-Architecture-Visualizer/blob/main/GLOSSARY.md);
  use them as written there.

### Files and folders

- File and folder names are kebab-case: `data-access/`, `create-feature-interactor.ts`,
  `use-analysis.ts`. [ADR-0003](./adr/0003-file-and-folder-names.md)
- **Frontend:** React component files, and folders named after a component, are PascalCase
  matching the component they export (`NavBar.tsx`, `CheckerMode/index.tsx`). Biome allows
  PascalCase in `frontend/src/components/`, `frontend/src/pages/`, and
  `frontend/tests/unit/pages/`; other files in those folders, such as `index.tsx`,
  `styles.ts`, and hooks, stay kebab-case **(review)**.
- Every import matches the file's case exactly. macOS and Windows ignore case by default,
  but CI runs on Linux, which doesn't.
- Biome checks file names only. Folder names are checked in review until a CI check is
  added.
- Files whose names or exports a tool sets keep them: the MSW worker script
  (`frontend/public/mockServiceWorker.js`, which Biome skips), `*.config.ts` and
  `*.config.js` files, and type declaration files (`*.d.ts`).

### Names a library defines

- Keep a name as the library spells it (`baseURL` in axios and Playwright, Vite's
  environment keys), and add a `biome-ignore` comment on that line naming the library, so
  nobody "fixes" it. [ADR-0002](./adr/0002-strict-abbreviation-casing.md)

## TypeScript

- **Named exports only.** No `export default`; every import uses the real name of what it
  imports. Config files and type declarations are exempt, because their tools need a default
  export.
  [Google: Exports](https://google.github.io/styleguide/tsguide.html#exports)
- **`import type` for type-only imports**, so it's clear which imports exist at runtime.
  Google allows this; CAVE requires it.
  [ADR-0001](./adr/0001-google-typescript-style-guide.md),
  [Google: Import type](https://google.github.io/styleguide/tsguide.html#import-type)
- **No `any`.** Use a real type, or `unknown` and narrow it. Google discourages `any`; CAVE
  rejects it. [ADR-0001](./adr/0001-google-typescript-style-guide.md),
  [Google: `any` type](https://google.github.io/styleguide/tsguide.html#any-type)
- **No non-null assertions (`!`).** Check for `null` or `undefined` instead, so the type
  checker can follow it. Google allows them with a reason; CAVE rejects them.
  [ADR-0001](./adr/0001-google-typescript-style-guide.md),
  [Google: Type and non-nullability assertions](https://google.github.io/styleguide/tsguide.html#type-and-non-nullability-assertions)
- **Arrays:** write `T[]` for simple and generic types (`string[]`, `Foo<Bar>[]`), which
  Biome checks. For union, object, and function types, write `Array<…>`
  (`Array<Foo | Bar>`) **(review)**.
  [ADR-0001](./adr/0001-google-typescript-style-guide.md),
  [Google: `Array<T>` type](https://google.github.io/styleguide/tsguide.html#arrayt-type)

## JSON field names

- JSON field names in API requests and responses are camelCase, with US spelling
  ([ADR-0004](./adr/0004-us-spelling-in-identifiers.md)) and the use case vocabulary:
  `useCaseId`, not `interaction_id`. Keys in the JSON data files the backend loads use US
  spelling too. Stored session data is already camelCase, so one convention holds from
  storage to screen.
- Biome's naming rule checks the field names where they're declared in TypeScript, quoted
  keys included. Agreement between the backend and frontend is checked by the route tests,
  which compare whole response bodies, and in review **(review)**.
- This matches the major API style guides (checked 2026-11-02):
  - Google, [JSON Style Guide: Property Name Format](https://google.github.io/styleguide/jsoncguide.html#Property_Name_Format):
    "Property names must be lower camel-cased, ASCII strings."
  - Microsoft, [Azure REST API Guidelines: JSON](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md#json-field-name-casing),
    from Microsoft's REST API Guidelines: "DO use camel case for all JSON field names. Do
    not upper-case acronyms; use camel case."
  - JSON:API, [Recommendations: Naming](https://jsonapi.org/recommendations/#naming):
    "Member names SHOULD be camel-cased (i.e., `wordWordWord`)".
