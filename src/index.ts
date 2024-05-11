import { Graph } from "./graph";
import { visualizeGraph } from "./visualization";
import { runSampleAlgorithm } from "./algorithms";

// Create a new graph instance
const graph = new Graph();

// Example: Add some nodes and edges to the graph
graph.addNode("A");
graph.addNode("B");
graph.addNode("C");
graph.addEdge("A", "B");
graph.addEdge("B", "C");

// Visualize the graph
const container = document.getElementById("graph-container");
if (container) {
    visualizeGraph(container, graph);
}

// Run a sample algorithm
runSampleAlgorithm(graph);