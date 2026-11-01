---
sidebar_position: 1
---

# Getting Started

Welcome to the Cave developer docs! Follow the steps below to get your local environment set up and ready to contribute.

## 1. Clone the Repository

First, fork the main repository on GitHub, then clone your fork and set up the remotes:

```bash
# Clone your fork
git clone https://github.com/CA-Visualizer-for-Education/Clean-Architecture-Visualizer.git

# Navigate into the project
cd Clean-Architecture-Visualizer
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

**Pull the latest changes from the main repo:**

```bash
git pull main
```

To keep a readable and linear commit history we use [conventional commits](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13). Each commit should be a task that can be summarized by its commit to make the lives of reviewers easier.

Let's say you have 5 commits that acheive one thing. We can check it out with

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

Let's say the work done in `a5` was unnessecary or you want to restart on a part of a task

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

## 3. Navigate into the Project

```bash
cd clean-architecture-visualizer
```

## 4. Install Dependencies & Set Up the Project

```bash
npm install
npm run setup
```

## 5. Post Setup

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
