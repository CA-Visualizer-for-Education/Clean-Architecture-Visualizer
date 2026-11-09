# Clean Architecture Visualizer (CAVE)

CAVE analyzes a student's project and reports whether its code adheres to Clean
Architecture. This glossary fixes the vocabulary for the architectural concepts CAVE
reasons about, so issues, diagnostics, and code use one word per concept.

## Language

**Node**:
A single element in a student's project that CAVE classifies by Clean Architecture
role (controller, presenter, entities, data access interface, use case interactor, and
so on). One source file typically maps to one node.
_Avoid_: File, class, component

**Edge**:
A directed dependency from one node to another, derived from an import (or an
`implements`/`extends` relationship).
_Avoid_: Link, reference, connection

**Layer**:
One of the four Clean Architecture rings a node belongs to: enterprise business rules,
application business rules, interface adapters, frameworks and drivers.
_Avoid_: Ring, level, tier

**Dependency Rule**:
The constraint defining which target nodes a given node is allowed to depend on. The
rulebook maps each node role to its permitted out-neighbours.
_Avoid_: Policy, constraint set

**Use-Case Graph**:
The set of nodes and edges CAVE builds for a single use case (or feature), evaluated as
one unit against the Dependency Rule.
_Avoid_: Module graph, feature graph

**Violation**:
An edge that the Dependency Rule forbids — a node depending on a target it is not
allowed to depend on.
_Avoid_: Error, infraction, breakage

**Located Violation**:
A violation CAVE could tie to a specific file and import line (and snippet), so it can
be shown as an inline diagnostic.
_Avoid_: Resolved violation, placed violation

**Unlocated Violation**:
A violation CAVE detected logically but could not tie to a file and line, so it can only
be reported in summary form, not as an inline diagnostic.
_Avoid_: Unresolved violation, orphan violation

**Cross Use-Case Edge**:
An edge from a node in one Use-Case Graph to a node that belongs to a different use
case. Tracked separately from Dependency-Rule violations.
_Avoid_: External edge, foreign edge

**Missing Node**:
A node role CAVE expected within a Use-Case Graph but did not find. Has no file or line
to anchor to.
_Avoid_: Absent node, gap
