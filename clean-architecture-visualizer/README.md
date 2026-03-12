# Clean Architecture Visualizer (web app)

This directory contains the web application for the Clean Architecture Visualizer project. It exposes a browser-based UI for exploring Clean Architecture “engines” and their interactions.

## Prerequisites

- Node.js and npm installed.
- Git installed (if you are cloning the repo).

## Installation

Clone the repository (if you have not already):

```bash
git clone https://github.com/paulgries/Clean-Architecture-Visualizer.git
cd Clean-Architecture-Visualizer
```

Install dependencies for the web app:

```bash
cd clean-architecture-visualizer
npm install
npm run build
npm link
```

## Running the app

Start the development server:

```bash
cave view <filepath>
```

This will start the frontend (and any backend services configured in this package). Check the console output for the local URL (typically http://localhost:5173 or similar, depending on the dev setup).

## Running tests

To run the backend/unit tests:

```bash
npm test
```

The Jest configuration for the backend lives in jest.config.js, and backend tests are under tests/backend/.

## Project structure

Key subdirectories and files:
- src/ – Backend/core logic for the visualizer.
- frontend/ – Frontend code for the UI.
- tests/backend/ – Backend tests.
- examples/ – Example projects and data used with the visualizer.
- package.json – Scripts and dependencies for this package.

For higher-level context about the overall project, see the top-level README.md in the repository root.
