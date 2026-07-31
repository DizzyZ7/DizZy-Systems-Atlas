# Atlas graph model

The Canvas topology is a navigation and comparison layer over the project metadata already published in Atlas. It is not a runtime dependency diagram.

## Nodes

Each node represents one indexed project. Node color represents the project's Atlas category. Flagship systems receive a larger visual radius and persistent label.

## Edges

An edge means two projects share enough engineering characteristics to be useful neighbors in the Atlas.

The current score uses only metadata already attached to each project:

1. **Exact shared stack entries** — strongest signal.
2. **Shared engineering-pattern families** — event-driven processing, security, observability, persistence/data, AI/decision systems, product interface, and delivery/integration.
3. **Same Atlas category** — weak supporting signal only.

Edges are rendered only after a minimum score is reached. Selecting a node highlights its relation field and dims unrelated nodes.

This deliberately avoids claims such as "service A depends on service B" unless that dependency is explicitly represented by repository evidence. The graph describes engineering similarity and reusable patterns, not production network topology.

## Interaction contract

- tap/click a node: select it and show the inline inspector;
- tap/click the selected node again: open the full project drawer;
- drag: pan the map;
- mouse wheel or +/-: zoom;
- Fit / `0`: return to the centered view;
- arrow keys: move selection between visible nodes;
- Enter: open the selected system;
- search/category filter: rebuild both nodes and relation edges from the visible project set.

## Why this exists

The purpose of the graph is to make engineering breadth legible without flattening every repository into an identical card. A reviewer can start from one familiar system — for example a webhook gateway, RAG service, or security platform — and inspect nearby work that reuses similar reliability, security, data, integration, or product patterns.
