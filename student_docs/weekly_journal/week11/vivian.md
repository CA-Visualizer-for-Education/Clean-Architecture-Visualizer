# Week 11 Journal - Vivian

## Overview
This week was a major milestone in project integration, focusing on unifying the full-stack environment, establishing a robust testing infrastructure, and initiating comprehensive technical documentation for the frontend.

## Learning Objectives Met

### 1. Implement frontend and design frontend architecture
* **Full-Stack Orchestration:** I engineered a unified launch sequence that allows the backend and frontend to be initialized via a single CLI command. This involved configuring a "backend mode" in frontend that dynamically disables the Mock Service Worker (MSW) and proxies requests to the Express server, ensuring a seamless development experience for the team.
* **Refining Home Page:** I improved the visual hierarchy of the Home page by integrating our custom Clean Architecture logo and populating the Info Dialog with instructional content. This ensures the frontend is not only functional but also intuitive for students.

### 4. Ensure good testing practices for frontend
* **Hybrid Testing Infrastructure:** I designed and implemented a dual-layered testing strategy combining Vitest for unit tests and Playwright for E2E testing. This setup includes a global configuration to handle the MSW lifecycle and i18next mocking, ensuring tests are isolated and reliable.
* **Resilient Test Selection:** To facilitate stable testing, I introduced `cimode` for internationalization, allowing tests to assert against permanent translation keys rather than volatile localized strings. I also integrated unit tests into our CI pipeline while maintaining E2E tests for local verification of complex flows, such as navigating the Monaco editor.
* **Developer Experience Improvements:** I configured path aliasing (`@/*`) in `tsconfig` and `vite.config` to resolve nested directory complexity, streamlining the codebase for better maintainability and cleaner imports.

### 5. Write technical documentation
* **Frontend Architecture Guide:** I began drafting the comprehensive technical README for the frontend. This documentation focuses on the development lifecycle, architectural patterns, and setup instructions to ensure seamless knowledge transfer and scalability for future contributors.