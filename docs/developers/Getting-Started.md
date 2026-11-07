---
sidebar_position: 1
---

# Getting Started

Welcome to the Cave developer docs! Follow the steps below to get your local environment set up and ready to contribute.

## 1. Clone the Repository

First, fork the main repository on GitHub, then clone your fork and set up the remotes:

```bash
# Clone your fork (replace <your-username> with your GitHub username)
git clone https://github.com/<your-username>/Clean-Architecture-Visualizer.git

# Navigate into the project
cd Clean-Architecture-Visualizer

# Add the main repository as `upstream`, so you can bring in its changes later
git remote add upstream https://github.com/CA-Visualizer-for-Education/Clean-Architecture-Visualizer.git
```

## 2. Working with Branches and Rebasing

Always create a new branch for your changes — never commit directly to `main`.

**Create and switch to a new branch:**

```bash
git checkout -b my-feature-branch
```

**Push your branch to your fork:**

```bash
git push origin my-feature-branch
```

To bring in the latest changes from the main repository, see
[Updating your branch from `main`](#3-updating-your-branch-from-main).

To keep a readable and linear commit history we use [conventional commits](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13). Each commit should be a task that can be summarized by its commit to make the lives of reviewers easier.

Let's say you have 5 commits that achieve one thing. We can check it out with

```bash
git rebase -i HEAD~5
```

This lets us see that last five commits

```bash
pick a1 commit1
pick a2 commit2
pick a3 commit3
pick a4 commit4
pick a5 commit5
```

There are 4 useful keywords to know:

```bash
pick
fixup
drop
reword
```

`pick` means that we use the commit as is. Whereas `fixup` merges the work done in a commit while keeping the name and root of the previous commit. E.g.:

```bash
pick a1 commit1
pick a2 commit2
pick a3 commit3
fixup a4 commit4
pick a5 commit5
```

becomes,

```bash
pick a1 commit1
pick a2 commit2
pick a3 commit3
pick a5 commit5
```

with no loss of work.

Let's say the work done in `a5` was unnecessary or you want to restart on a part of a task

`git rebase -i HEAD~4`

```bash
pick a1 commit1
pick a2 commit2
pick a3 commit3
drop a5 commit5
```

becomes 

```bash
pick a1 commit1
pick a2 commit2
pick a3 commit3
```

We are able to chain `fixup` and reword allows us to rename a commit. Say we want to merge all the remaining work on a branch and name it conventionally we can do:

`git rebase -i HEAD~3`

```bash
reword a1 commit1
fixup a2 commit2
fixup a3 commit3
```

Then we will only have one commit left on the branch named conventionally.

## 3. Updating your branch from `main`

`main` keeps moving while you work. Bring its changes into your branch before you ask for
a review, and again whenever a PR that your work depends on has merged. Commit your work
first: git won't merge over uncommitted changes.

```bash
git fetch upstream
git merge upstream/main
```

Once your PR is open, merge rather than rebase: a merge keeps the commits your reviewers
have already seen, and your PR is squashed into one commit when it merges anyway.

If git reports conflicts, open each file it lists, keep both changes (yours and `main`'s),
and delete the conflict markers. Then `git add` those files and run `git commit`.

### After a rename

Some PRs rename files and identifiers across the codebase, to bring it in line with the
[style guide](./Style-Guide.md). If you've just merged one of them, code you wrote on your
branch may still use the old names. Fix them before you check and push:

1. Update imports of renamed files with the rename codemod:

   ```bash
   cd clean-architecture-visualizer
   npm run codemod:rename
   cd ..
   ```

   The codemod needs Node 24.2 or later, which is newer than the rest of the repo needs.
   Check your version with `node --version`.

2. Fix old identifier names by hand. `npm run verify` reports each one as a type error,
   such as `has no exported member 'CANode'`, `Cannot find name 'CANode'`, or
   `Property 'resetDB' does not exist`. Look up the old name in
   `clean-architecture-visualizer/codemods/rename-table.json`, which each rename PR adds
   its renames to, and use its `to` name.

If the PR also made a lint rule an error, `npm run verify` lists the lines in your code that
break it. `npm run check:fix` fixes many of them for you; the [style guide](./Style-Guide.md)
explains the rest.

### Check and push

Before you push, run every check that CI runs, from the repository root:

```bash
npm run verify
```

Then push to your fork with `git push origin my-feature-branch`.

## 4. Navigate into the Project

```bash
cd clean-architecture-visualizer
```

## 5. Install Dependencies & Set Up the Project

```bash
npm install
npm run setup
```

## 6. Post Setup

You should now be able to run all tests within the directory with:

```bash
npm test
```

You can test a specific file/directory with:

```bash
npm test -- <path-to-file/directory>
```

CI also type-checks the backend's source and tests. To run the same check locally:

```bash
npm run type-check
```

## 7. Working on the Docs

The docs site in `docs/` uses npm, like the rest of the repo. From the repo root:

```bash
cd docs
npm ci
npm start
```

Before opening a PR that changes `docs/`, check that the site builds:

```bash
npm run build
```
