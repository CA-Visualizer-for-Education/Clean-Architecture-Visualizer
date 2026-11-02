# Abbreviations are cased as words

Identifiers treat abbreviations and acronyms as ordinary words: `CaDiagram`,
`SessionDbAccess`, and `getUseCaseById`, not `CADiagram` or `SessionDBAccess`. This is
Google's rule ("use `loadHttpUrl`, not `loadHTTPURL`, unless required by a platform name
(e.g. `XMLHttpRequest`)") and Biome's default (`strictCase`), so it needs no configuration
and has no project-specific exceptions. It removes ambiguity at word boundaries (`CANode`
could be read as "CAN-ode"), and CAVE's code already used `Id`, `Url`, and `Db` far more
often than the all-caps forms. Prose and UI text still write "CA" and "DB", and platform
names such as `XMLHttpRequest` are used as they are. Where Biome flags a name that a library
defines, such as the `baseURL` option of axios and Playwright, that line gets a
`biome-ignore` comment naming the library.

## Considered options

- **All caps** (`CADiagram`): reads naturally for CAVE's central term, but needs Biome's
  `strictCase` turned off, which also allows names like `loadHTTPURL`.
- **An exception for `CA` only**: needs a custom naming pattern in `biome.json`, and each
  exception makes the next one easier to argue for.
