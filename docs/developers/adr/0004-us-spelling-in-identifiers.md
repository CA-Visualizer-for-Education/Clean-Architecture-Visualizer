# US spelling in identifiers, Canadian spelling in prose

Every name in code uses US spelling (`neighbor`, `color`, `initialize`, `analyze`),
including JSON field names. Comments, docs, ADRs, and English UI text use Canadian spelling
(`neighbour`, `colour`, `analyse`). The platforms CAVE builds on already spell their names
the US way (`color` and `center` in CSS and MUI, `behavior: 'smooth'`, `normalize()`), so
Canadian identifiers would sit beside US ones, as in `sx={{ color: lineColour }}`, and a
search for one spelling would miss the other. Editor spell checkers and most codebases,
including Canadian ones, use US spelling in code too. Prose stays Canadian because its
readers are CAVE's students and contributors. Biome can't check spelling, so review
enforces this.

## Considered options

- **Canadian spelling everywhere**: consistent with the repo's prose, but mixes spellings
  wherever our names meet platform and library names, which can't be renamed.
