---
sidebar_position: 4
---

# CAVE Frontend

## Table of Contents

- [Start Here](#start-here)
- [Daily Workflow](#daily-workflow)
- [Standards and Architecture](#standards-and-architecture)

## Start Here

This section is for getting the app running quickly and making your first change with minimal setup friction.

### Quick start

1. Use Node.js `20.19.0` or later. Verify your local versions before installing dependencies:
   ```bash
   node --version
   npm --version

2. Install dependencies:

   ```bash
   cd clean-architecture-visualizer/frontend
   npm install
   ```

3. Start the frontend:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173).

### Launching options

#### Option 1: Via the CLI (recommended)

From the project root that you wish to validate your adherence to clean architecture (or anywhere after `npm link`):

```bash
cave start
```

This will:

1. Read the directory
2. Start the Express server on port `3131`
3. Start the Vite dev server on port `5173` in `--mode backend` and proxy it behind the Express server
4. Open your browser to `http://localhost:3131`

#### Option 2: Run frontend only with mock data (MSW)

```bash
cd clean-architecture-visualizer/frontend
npm install
npm run dev
```

#### Option 3: Build and preview production output

```bash
cd clean-architecture-visualizer/frontend
npm install
npm run build
npm run preview
```

### Role-based onboarding paths

#### Frontend feature dev path

1. Start with `npm run dev`.
2. Find placement using the file structure section below (`pages`, `components`, `api`, `actions`).
3. Implement feature with shared types/constants in `src/lib`.
4. Run `npm run type-check`, `npm run lint`, and relevant tests.

#### Bugfix-only path

1. Reproduce quickly with `npm run dev`.
2. Add or update the smallest focused test (`test:unit` first, `test:e2e` if user flow regression).
3. Fix the issue close to source (avoid broad refactors).
4. Re-run checks before opening PR.

#### Docs/contributor path

1. Run the app locally once to validate screenshots/steps.
2. Update docs and command names exactly as defined in `package.json` scripts.
3. Confirm new instructions are copy-paste runnable from the stated directory.

### Common pitfalls

- Wrong folder path: run frontend commands from `clean-architecture-visualizer/frontend`, not `cave-docs`.
- Missing Playwright setup: run `npm run setup` before the first e2e run on a new machine.
- Backend mode confusion: use `npm run dev` for mock-data frontend flow and `npm run dev:backend` when you intend to connect to backend mode.

## Daily Workflow

### Command map

The following scripts are defined for development, testing, and quality checks:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server at `http://localhost:5173`. |
| `npm run dev:backend` | Starts Vite in backend mode. |
| `npm run build` | Runs TypeScript project build and production bundling. |
| `npm run preview` | Serves the local production build for verification. |
| `npm run setup` | Installs Playwright browsers for e2e tests. |
| `npm run lint` | Runs ESLint with warnings treated as failures. |
| `npm run type-check` | Runs TypeScript checks without emitting files. |
| `npm run test:unit` | Executes Vitest unit tests. |
| `npm run test:e2e` | Runs Playwright end-to-end tests. |
| `npm run test:e2e:ui` | Runs Playwright tests in UI mode. |
| `npm run test:e2e:debug` | Runs Playwright in debug mode. |

### Suggested daily loop

1. Pull latest changes and run `npm install` if lockfile changed.
2. Start local dev with `npm run dev`.
3. Implement changes in small commits.
4. Before PR: run `npm run type-check`, `npm run lint`, and relevant tests.

### Testing and debugging

- Unit tests: use `npm run test:unit` for component logic and utilities.
- End-to-end tests: use `npm run test:e2e` for full user workflows.
- Debugging e2e failures: use `npm run test:e2e:debug` or `npm run test:e2e:ui`.

## Standards and Architecture

### Tech stack

The project uses:

- React + Vite for the app shell and build pipeline.
- Material UI for core UI components.
- TypeScript for type safety.
- React Query patterns in `actions` for data workflows.
- MSW for mock endpoint behavior during frontend-only development.
- Vitest and Playwright for unit and e2e testing.

### Frontend file structure

The frontend app lives in `clean-architecture-visualizer/frontend/src`.

```text
frontend/src/
   actions/     # React Query hooks and action-level data logic
   api/         # API clients and endpoint wrappers
   assets/      # Static assets used by the app
   components/  # Reusable UI components
   hooks/       # Reusable React hooks
   i18n/        # Translation setup and locale resources
   lib/         # Shared types, constants, themes, and core frontend models
   mocks/       # MSW handlers and mock data
   pages/       # Route-level page components
   styles/      # Shared/global style utilities
   utils/       # Pure helper functions
   App.tsx      # Root app composition
   main.tsx     # Frontend entry point
```

Placement rules:

- Put route-level UI in `pages`, and reusable pieces in `components`.
- Put data fetching and server interaction in `api` plus `actions` (not in presentational components).
- Put shared cross-feature definitions in `lib`.
- Put reusable hooks in `hooks` and generic helpers in `utils`.

### Reusable types and constants

Define reusable values once and import them where needed.

- If a type or constant is used in more than one file, place it in `src/lib`.
- Shared types go in `src/lib/types.ts`.
- Shared constants go in `src/lib/storageKeys.ts` (and similar files in `src/lib` when needed).
- Before creating new definitions, check `src/lib` and reuse existing definitions.

### File naming conventions

- Use `index.tsx` for a component entry file and `styles.ts` for styled definitions.
- Use `PascalCase` folder names for components and pages (for example: `CodeViewer`, `CheckerMode`).
- Use `camelCase` for utility/lib files (for example: `storageKeys.ts`).
- Use descriptive names for hooks and tests (for example: `useSomething.ts`, `ComponentName.test.tsx`).

### UI styling conventions

#### Using the MUI colour palette

Use theme palette values instead of hardcoded hex values whenever possible.

Recommended approach:

1. Add or update palette tokens in the shared MUI theme.
2. Reference tokens with `theme.palette.*` in styled components.
3. Use semantic names (`primary`, `secondary`, `error`, `warning`, `success`, `info`) rather than one-off colour values.

Example:

```tsx
import { styled } from '@mui/material/styles';

export const Panel = styled('section')(({ theme }) => ({
   backgroundColor: theme.palette.background.paper,
   color: theme.palette.text.primary,
   border: `1px solid ${theme.palette.divider}`,
}));
```

If a new colour is needed, prefer adding it to the theme first, then consuming it from components.

#### Component file separation: `index.tsx` plus `styles.ts`

For most reusable UI components, separate structure and logic from styling.

- `index.tsx`: component logic, props, hooks, and JSX structure.
- `styles.ts`: styled wrappers and visual primitives.

Benefits:

- Keeps component logic readable.
- Makes style reuse and review easier.
- Reduces merge conflicts when one person changes logic and another changes styling.

Suggested pattern:

```tsx
// index.tsx
import { Container, Title } from './styles';

type Props = {
   title: string;
};

export default function FeatureCard({ title }: Props) {
   return (
      <Container>
         <Title>{title}</Title>
      </Container>
   );
}
```

```ts
// styles.ts
import { styled } from '@mui/material/styles';

export const Container = styled('article')(({ theme }) => ({
   backgroundColor: theme.palette.background.paper,
   borderRadius: theme.shape.borderRadius,
   padding: theme.spacing(2),
}));

export const Title = styled('h3')(({ theme }) => ({
   color: theme.palette.text.primary,
   margin: 0,
}));
```

Notes:

- Small one-file components are fine when separation adds unnecessary overhead.
- For larger components, default to this split to keep files maintainable.

Good examples in this codebase:

- `frontend/src/components/code/CodeViewer/index.tsx` plus `frontend/src/components/code/CodeViewer/styles.ts`
- `frontend/src/components/code/FileExplorer/index.tsx` plus `frontend/src/components/code/FileExplorer/styles.ts`
- `frontend/src/components/diagram/ViolationsSideBarContent/index.tsx` plus `frontend/src/components/diagram/ViolationsSideBarContent/styles.ts`
- `frontend/src/components/diagram/SideBar/index.tsx` plus `frontend/src/components/diagram/SideBar/styles.ts`
- `frontend/src/pages/CheckerMode/index.tsx` plus `frontend/src/pages/CheckerMode/styles.ts`

### Accessibility

Build accessibility in by default:

- Use semantic HTML and MUI components that provide built-in accessibility support.
- Ensure interactive elements are keyboard accessible and have visible focus states.
- Add accessible names for controls (`aria-label`, `aria-labelledby`, or visible text labels).
- Keep color contrast readable; do not rely on color alone to communicate status.
- Provide alt text for meaningful images and icons, and hide decorative icons from screen readers.
- For dialogs, accordions, and navigation, verify correct ARIA relationships and focus behavior.

Quick check before merging:

- Navigate key flows using keyboard only (Tab, Shift+Tab, Enter, Space, Escape).
- Confirm screen reader labels are present for key actions.
- Validate error and success states are understandable without color cues.
- In Chrome, run Lighthouse accessibility analysis on page load.
- In Chrome DevTools, inspect text contrast in the color picker contrast indicator.

### i18n

The frontend uses `i18next` with `react-i18next` and currently ships with English resources.

#### Where translation files live

- i18n setup: `frontend/src/i18n/config.ts`
- Locale files: `frontend/src/i18n/locales/en/*.json`
- Each JSON file is a namespace (for example: `home.json`, `checker.json`, `common.json`).

#### How to add new translation keys

1. Choose the correct namespace file in `frontend/src/i18n/locales/en`.
2. Add the key in nested JSON form (group by feature/component).
3. If you create a brand new namespace file, import it in `frontend/src/i18n/config.ts` and register it in `resources.en`.
4. Use the key from components with `useTranslation('<namespace>')`.

Example JSON (`frontend/src/i18n/locales/en/home.json`):

```json
{
   "cards": {
      "checker": {
         "title": "Checker Mode",
         "description": "Validate architecture violations in your project"
      }
   }
}
```

#### How to use `useTranslation` in components

```tsx
import { useTranslation } from 'react-i18next';

export default function Example() {
   const { t } = useTranslation('home');
   return <h2>{t('cards.checker.title')}</h2>;
}
```

Current codebase patterns:

- Simple string translation with `t(...)` in page/components.
- Rich text translation with `<Trans />` when markup is needed inside localized content.

#### i18n initialization notes

- Ensure `frontend/src/i18n/config.ts` is imported by pages/components that require translations (existing pages already follow this pattern).
- `fallbackLng` is set to `en`.
- Test mode supports `lng=cimode` via query parameter or `VITE_TEST_MODE=true` for deterministic test text behavior.

#### Key naming guidelines

- Prefer feature-scoped keys such as `cards.checker.title` instead of flat keys.
- Keep key names stable and descriptive; update values more often than key identifiers.
- Reuse existing keys in `common.json` for shared labels/buttons before creating duplicates.

