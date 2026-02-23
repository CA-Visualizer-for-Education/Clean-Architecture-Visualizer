# Week 4 Journal - Vivian

## Overview
My primary goal was to establish a scalable frontend structure and explore infrastructure for a multilingual application (i18n). I dedicated time to mapping out how our React/TypeScript frontend would communicate with the backend while maintaining a clean separation of concerns.

## Learning Objectives Met

### 1. Develop comprehensive full-stack engineering proficiency
* **Frontend Architecture Design:** I proposed a directory structure that separates the `api/` layer (Axios services) from the `actions/` layer (React Query hooks). This modular approach mirrors Clean Architecture principles, ensuring the UI remains decoupled from data-fetching logic.

### 3. Standardize collaborative development and review workflows
* **CI/CD Foundation:** I initiated the basic CI setup Pull Request. While troubleshooting the initial pipeline failures, I gained a deeper understanding of how environment-specific configurations impact automated testing, which is crucial for maintaining a stable main branch.

### 5. Write technical documentation
* **Internationalization (i18n) Strategy:** I reserach and documented a roadmap for multilingual support using `i18next`. By establishing the `locales/` JSON structure early, I suggested a template for adding future language support without refactoring the core UI. THis has been intergated into the frontend architecture design accordingly.