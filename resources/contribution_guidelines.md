## Contribution Guidelines

### 1. Branching Strategy

- `main`: Production-ready code. Never push directly here.
- Feature Branches: Where development happens.

The Workflow:

- Checkout main and pull the latest changes.
- Create your feature branch off main.
- When finished, open a PR targeting main.

---

### 2. Branch Naming

Use the format:

- `feature/<short-description>` for new features  
  Example: `feature/ca-visualizer-starter`
- `fix/<short-description>` for bug fixes  
  Example: `fix/visualizer-display-bug`
- `chore/<short-description>` for maintenance or refactors  
  Example: `chore/update-readme`

Use lowercase and hyphens (`-`), not underscores.

---

### 3. PR Lifecycle & Review Requirements

#### General Rules

- Scope: One PR should do one thing well (a single feature, bugfix, or refactor). Keep it small to make the review easier.
- Timing: Only open a PR when the feature is fully ready to be merged. If it is a work-in-progress, mark it as a "Draft."
- CI/CD: Every PR must pass all CI checks (lint, tests, build) before review.

#### Review Policy

We should utilize Reviewer Groups to enforce quality control. Every PR requires approvals from two specific parties before merging:

- One Professor (e.g., Paul)
- One Student Developer

---

### 4. PR Title Format

Follow the structure:

`<type>(<scope>): <short summary>`

Where:

- `type` is one of: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
- `scope` is the main module or feature being changed (e.g. `auth`, `catalogue`, `admin`, `frontend`, `backend`, `history`, `move-requests`)

Examples:

- `feat(visualizer): implement visualizer main structure`
- `fix(ca-checker): correct display colors`
- `chore(ci): add linting workflow`

---

### 5. PR Description Template

GitHub fills in the PR description from `.github/PULL_REQUEST_TEMPLATE.md` when you open a PR. Complete every section, and link issues as described in §6.

---

### 6. Linking Issues

- Link related issues using GitHub keywords:
  - `Closes #123` or `Fixes #456` will auto-close issues when merged.
- If the PR only partially addresses an issue, use:
  - `Relates to #123` or `Part of #123` (avoid `Closes`).

--

### 7. Merging

- Use **squash and merge** to maintain a clean, linear history.
- Before merging:
  - Confirm that all review comments are resolved.
  - Ensure CI is green.
  - Verify that the PR title is meaningful for the squash commit message.
- Delete the feature branch after merging.

---

### 8. Sensitive Data and Secrets

- Never commit:
  - API keys
  - Tokens
  - Real passwords or `.env` files
- Use `.env.example` to document required environment variables.
- Verify that `.gitignore` covers secrets and local configuration files.
