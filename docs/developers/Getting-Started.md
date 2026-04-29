---
sidebar_position: 1
---

# Getting Started

Welcome to the Cave developer docs! Follow the steps below to get your local environment set up and ready to contribute.

## 1. Fork & Clone the Repository

First, fork the main repository on GitHub, then clone your fork and set up the remotes:

```bash
# Clone your fork
git clone https://github.com/<your-username>/Clean-Architecture-Visualizer.git

# Navigate into the project
cd Clean-Architecture-Visualizer

# Set the original repo as upstream
git remote add upstream https://github.com/paulgries/Clean-Architecture-Visualizer.git

# Verify your remotes
git remote -v
# origin    https://github.com/<your-username>/Clean-Architecture-Visualizer.git (fetch)
# origin    https://github.com/<your-username>/Clean-Architecture-Visualizer.git (push)
# upstream  https://github.com/paulgries/Clean-Architecture-Visualizer.git (fetch)
# upstream  https://github.com/paulgries/Clean-Architecture-Visualizer.git (push)
```

## 2. Working with Branches & Remotes

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
git pull upstream main
```

**Keep your fork's main branch up to date:**
```bash
git checkout main
git pull upstream main
git push origin main
```

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
