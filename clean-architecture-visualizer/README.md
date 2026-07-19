# clean-architecture-visualizer (cave)

A CLI + web tool for exploring and scaffolding Clean Architecture (CA) projects. It verifies that use cases follow CA layering rules and generates the boilerplate for new use cases, features, and projects.

Built for [CSC207](https://github.com/paulgries/Clean-Architecture-Visualizer) at the University of Toronto, where students learn Clean Architecture but often struggle to see how the layers connect in a real, long-lived codebase. `cave` sits on top of a project and visualizes the Controller → Interactor → Data Access → Presenter flow for each use case.

## Install

```bash
npm install -g clean-architecture-visualizer
```

## Usage

```bash
cave init <language>                            # scaffold a new CSC207-style CA project in the chosen programming language
cave module_init <language>                     # scaffold a new project, organized by feature module in the chosen language
cave usecase <name>                             # generate the boilerplate for a new use case
cave feature <feature>                          # add a new feature to the project
cave module_usecase <feature> <usecase>         # add a use case to an existing feature
cave verify                                     # check that use cases follow Clean Architecture rules
cave start                                      # start the backend server and frontend visualizer
cave start --backend-only                       # start only the backend server
cave end                                        # stop the server and clean up temp files
```

`cave start` launches a local web UI for browsing use case diagrams and CA layer violations in your project.

## Development

```bash
npm install
npm run build   # compile TypeScript and build the frontend
npm run dev      # build and run in development mode
npm test         # run the test suite
```
