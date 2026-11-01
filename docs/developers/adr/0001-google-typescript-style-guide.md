# Google's TS/JS Style Guide, enforced with Biome

CAVE's TypeScript follows Google's
[TS/JS Style Guide](https://google.github.io/styleguide/tsguide.html) (checked at commit
`5ec8577`, 2026-10-29), enforced by the Biome rules in the root `biome.json` rather than by
ESLint. Biome already formats and lints the repo and runs in CI, so one tool does both, and
Google's naming rules match the defaults of Biome's `useNamingConvention`. Students can read
Google's guide for the reasons behind each rule.

## Where we're stricter than Google

- **`any`**: Google says "Consider *not* to use `any`"; `noExplicitAny` makes it an error.
- **`import type`**: Google says you "may" use it; `useImportType` requires it for type-only
  imports.
- **Non-null assertions (`!`)**: Google allows them with "an obvious or explicit reason";
  `noNonNullAssertion` makes them an error.
- **Array types**: Google uses `T[]` for simple types and `Array<T>` for complex ones. We
  always use `T[]` (`readonly T[]`, `(Foo | Bar)[]`), so a single Biome rule,
  `useConsistentArrayType` with `shorthand`, decides every case.

## Considered options

- **Airbnb JavaScript Style Guide**: the best-known JavaScript guide, but Airbnb publishes
  no TypeScript rules of its own, and its rule that acronyms are all uppercase or all
  lowercase conflicts with ADR-0002.
- **typescript-eslint rule sets alone** (`strict`, `stylistic`): widely used, but they are
  rules without a written rationale, and they need ESLint running beside Biome.
