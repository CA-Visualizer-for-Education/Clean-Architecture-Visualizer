# File and folder names are kebab-case, except React components

Files and folders use kebab-case (`data-access/`, `create-feature-interactor.ts`,
`use-analysis.ts`). React component files, and the folders named after a component, use
PascalCase matching the component they export (`NavBar.tsx`, `CheckerMode/index.tsx`).
Lowercase names can't differ only by case, which matters because Windows and macOS treat
file names as case-insensitive by default and Linux, where CI runs, doesn't: an import
whose case doesn't match the file works on a laptop and fails in CI. Google's JavaScript
guide requires lowercase file names, and Angular separates words in file names with
hyphens. React components are the exception because PascalCase file names that match the
component are what students see in React's own docs, in Airbnb's React guide, and in MUI,
the component library CAVE uses.

## Consequences

- Biome's `useFilenamingConvention` enforces kebab-case, with PascalCase also allowed under
  `frontend/src/components/` and `frontend/src/pages/`. Biome can't tell a component file
  from any other file there, so review keeps `index.tsx`, `styles.ts`, and hooks in
  kebab-case.
- Component files keep the case risk: every import must match the file's case exactly.
  `components/common/NavBar.tsx` beside `components/layout/Navbar.tsx` shows how easily
  the casing drifts.
- Biome's docs don't say whether the rule checks folder names.
- The rule for utility files in `Frontend.md` changes from camelCase (`storageKeys.ts`) to
  kebab-case (`storage-keys.ts`).

## Considered options

- **Kebab-case everywhere, components included** (`nav-bar.tsx`): one rule with no
  exceptions and no case risk, used by shadcn/ui and the default of eslint-plugin-unicorn's
  `filename-case` rule. Rejected so that CAVE's frontend reads like the React code students
  meet elsewhere.
- **camelCase files** (most of CAVE's files before this decision): no major guide
  prescribes it, and it carries the same case risk as PascalCase.

## Sources

Checked 2026-11-01.

- Google JavaScript Style Guide, [File name](https://google.github.io/styleguide/jsguide.html#file-name):
  "File names must be all lowercase and may include underscores (`_`) or dashes (`-`), but no
  additional punctuation." Google's [TS/JS Style Guide](https://google.github.io/styleguide/tsguide.html)
  has no file-name rule beyond a passing "files are `snake_case`".
- Angular, [Style guide](https://angular.dev/style-guide): "Separate words within a file
  name with hyphens (`-`)".
- Microsoft, [Adjust case sensitivity](https://learn.microsoft.com/en-us/windows/wsl/case-sensitivity):
  "Windows file system treats file and directory names as case-insensitive" and "Linux file
  system treats file and directory names as case-sensitive."
- Apple, [File system formats in Disk Utility](https://support.apple.com/guide/disk-utility/file-system-formats-dsku19ed921c/mac):
  case-sensitive APFS is a separate format from the default.
- Git, [`core.ignoreCase`](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coreignoreCase):
  set automatically on case-insensitive file systems such as APFS and NTFS.
- React, [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components):
  examples use `App.js`, `Gallery.js`, and `Profile.js`; the older
  [File Structure](https://legacy.reactjs.org/docs/faq-structure.html) page says "React
  doesn't have opinions on how you put files into folders."
- Airbnb, [React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react):
  "Use PascalCase for filenames" and "Use the filename as the component name."
- shadcn/ui, [component files](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/ui):
  `alert-dialog.tsx`, `aspect-ratio.tsx`, `button-group.tsx`.
- eslint-plugin-unicorn, [`filename-case`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/filename-case.md):
  "The default is `kebabCase`."
- Very Technology, [The design behind kebab-case-ing our React apps](https://www.verytechnology.com/insights/the-design-behind-kebab-case-ing-our-react-apps):
  a team's reasons for kebab-case, including Git and capitalization.
- Biome, [`useFilenamingConvention`](https://biomejs.dev/linter/rules/use-filenaming-convention):
  supports kebab-case and PascalCase, and treats extra dots (`foo.test.ts`) as extensions.
