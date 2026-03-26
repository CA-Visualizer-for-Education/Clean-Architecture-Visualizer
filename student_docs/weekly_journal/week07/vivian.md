# Week 7 Journal - Vivian

## Overview
This week centered on advancing the frontend architecture by integrating sophisticated editor tooling and modularizing our CI/CD pipelines to ensure long-term code stability.

## Learning Objectives Met

### 1. Implement frontend and design frontend architecture
* **Modular Editor Integration:** I integrated `monaco-editor` for the code view page. By moving away from hard-coded components to a dynamic editor implementation, I established a more scalable architecture that handles diverse file types and improves the user experience.
* **API Logic Refactoring:** I refactored the codebase API, transitioning from component-based to file-path-based lookups. This aligns our frontend logic with the actual project structure, ensuring that our React Query hooks and backend contracts are intuitive and maintainable.

### 4. Ensure good testing practices for frontend
* **CI Pipeline Optimization:** I redesigned our GitHub Actions workflow to separate frontend type-checks and testing suites into distinct, modular files. By implementing caching and conditional execution, I’ve reduced build times while ensuring no code reaches `main` without passing the CI checks.