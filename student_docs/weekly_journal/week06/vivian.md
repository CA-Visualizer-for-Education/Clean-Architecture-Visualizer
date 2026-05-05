# Week 6 Journal - Vivian

## Overview
This week focused on "hardening" the codebase and establishing rigorous engineering standards. 

## Learning Objectives Met

### 1. Develop comprehensive full-stack engineering proficiency
* **Network Interception & Decoupling:** I integrated Mock Service Worker (MSW) to simulate backend responses. This allowed the frontend team to develop complex features—like the Use Case accordion and Interaction flows—against a reliable API contract, even as the backend logic was still being finalized.
* **API Standardization:** I led the discussion to consolidate backend endpoints, ensuring that our data management layer is efficient and that the frontend only requests the data it strictly needs.

### 3. Standardize collaborative development and review workflows
* **Automated Quality Controls:** I implemented `lint` and `type-check` scripts in `package.json`. By making these mandatory for merging, I established a team-wide standard that ensures code quality and prevents runtime errors, significantly reducing the burden during manual code reviews.