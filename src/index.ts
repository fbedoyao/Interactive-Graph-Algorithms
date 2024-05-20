import * as d3 from 'd3';
import { Graph } from './graph';
import { renderGraph } from './renderer';
import { printGraph } from './algorithm'

// Create a new graph instance
const graph = new Graph();

// Populate the graph with dummy data
const dummyNodes = [
    { index: 0, x: 450, y: 365 },
    { index: 1, x: 455, y: 86 },
    { index: 2, x: 254, y: 222 },
    { index: 3, x: 695, y: 330 },
    { index: 4, x: 619, y: 135 },
    { index: 5, x: 284, y: 423 }
];

const dummyEdges = [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 0 },
    { source: 3, target: 1 },
    { source: 0, target: 4 },
    { source: 5, target: 2 }
];

graph.nodes = dummyNodes;
graph.edges = dummyEdges;
graph.isDirected = true;

const width = 1000;
const height = Math.min(500, width * 0.6);

const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

// Render the graph
renderGraph(graph, svg);

// Add SVG to the DOM
document.getElementById("graph-container").appendChild(svg.node());

// Event listener for the run algorithm button
document.getElementById("run-algorithm").addEventListener("click", () => {
    const algorithmSelect = document.getElementById("algorithm-select") as HTMLSelectElement;
    const selectedAlgorithm = algorithmSelect.value;

    let algorithmFunction;
    switch (selectedAlgorithm) {
        case "print":
            algorithmFunction = printGraph;
            break;
        // Add cases for other algorithms as needed
        default:
            return;
    }

    // Perform algorithm on current graph state
    algorithmFunction(graph, svg);

    // Redraw the graph to reflect algorithm changes
    renderGraph(graph, svg);
});