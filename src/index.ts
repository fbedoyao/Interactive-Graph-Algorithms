import * as d3 from 'd3';
import { Graph, Color } from './Data Structures/graph';
import { renderGraph } from './renderer';

// Constants
const WIDTH = 1000;
const HEIGHT = Math.min(500, WIDTH * 0.6);

// Create a new graph instance
const graph = new Graph();

const dummyNodes = [
    { index: 0, x: 450, y: 365, color: Color.WHITE, d: Number.MAX_VALUE, pred: -1, f:0, key: Number.MAX_VALUE, isHighlighted: false},
    { index: 1, x: 455, y: 86, color: Color.WHITE, d: Number.MAX_VALUE, pred: -1, f: 0, key: Number.MAX_VALUE, isHighlighted: false },
    { index: 2, x: 254, y: 222, color: Color.WHITE, d: Number.MAX_VALUE, pred: -1, f: 0, key: Number.MAX_VALUE, isHighlighted: false },
    { index: 3, x: 695, y: 330, color: Color.WHITE, d: Number.MAX_VALUE, pred: -1, f: 0, key: Number.MAX_VALUE, isHighlighted: false },
    { index: 4, x: 619, y: 135, color: Color.WHITE, d: Number.MAX_VALUE, pred: -1, f: 0, key: Number.MAX_VALUE, isHighlighted: false },
    { index: 5, x: 284, y: 423, color: Color.WHITE, d: Number.MAX_VALUE, pred: -1, f: 0, key: Number.MAX_VALUE, isHighlighted: false }
];

const dummyEdges = [
    { source: 0, target: 1, w: 5, isHighlighted: false},
    { source: 1, target: 2, w: 3, isHighlighted: false },
    { source: 2, target: 0, w: 8, isHighlighted: false },
    { source: 3, target: 1, w: 2, isHighlighted: false },
    { source: 0, target: 4, w: 4, isHighlighted: false },
    { source: 5, target: 2, w: 7, isHighlighted: false },
    { source: 4, target: 4, w: 1, isHighlighted: false },
    { source: 0, target: 2, w: 10, isHighlighted: false }
];

graph.nodes = dummyNodes;
graph.edges = dummyEdges;
graph.isDirected = true;
graph.isWeighted = true;

const svg = d3.create("svg").attr("viewBox", [0, 0, WIDTH, HEIGHT]);

// Render the graph
renderGraph(graph, svg);

// Add SVG to the DOM
document.getElementById("graph-container").appendChild(svg.node());