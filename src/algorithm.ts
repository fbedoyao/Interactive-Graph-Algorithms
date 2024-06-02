import { Graph, Node, Edge, Color } from './graph';
import { renderGraph } from './renderer';
import { Queue } from './queue'
import { LinkedList } from './linkedList';
import { MstForest } from './mstForest';
import { geoRotation } from 'd3';

export function printGraph(graph: Graph){
    const adjList = graph.getAdjacencyList();
    const outputBox = document.getElementById("output-box");

    if (outputBox) {
        outputBox.innerHTML = ""; // Clear previous content (if any)
        adjList.forEach((adjNodes: number[], node: number) => {
            const outputLine = `${node} -> ${adjNodes}<br>`;
            outputBox.innerHTML += outputLine;
        });
    }
}

export async function kruskal(graph: Graph, redrawGraph: () => void){
    if (!graph.isWeighted){
        console.log("Minimum Spanning Tree is not defined for unweighted graphs.");
        return null;
    }
    if (!graph.isConnected()){
        console.log("Minimum Spanning Tree is not defined for unconnected graphs.");
        return null;
    }
    let A: Set<Edge> = new Set();
    const forest = new MstForest();
    for (let v of graph.nodes){
        forest.makeSet(v);
    }
    const sortedEdges = getEdgesSortedByNonDecreasingWeight(graph);
    for (let edge of sortedEdges){
        const u = graph.getNodeByIndex(edge.source);
        const v = graph.getNodeByIndex(edge.target);
        if (!forest.findSet(u).equals(forest.findSet(v))){
            edge.isHighlighted = true;
            A = union(A, new Set<Edge>([{source: u.index, target: v.index, w: edge.w, isHighlighted: false}]));
            forest.union(u, v);
            redrawGraph();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    console.log(A);
    return A;
}

  // Function to return edges in non-decreasing order by weight
function getEdgesSortedByNonDecreasingWeight(graph: Graph): Edge[] {
    return graph.edges.slice().sort((a, b) => a.w - b.w);
}

function union<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    let unionSet = new Set<T>(setA); // Start with all elements from setA
    setB.forEach((elem) => {
        unionSet.add(elem); // Add elements from setB
    });
    return unionSet;
}

export async function stronglyConnectedComponents(graph: Graph, redrawGraph: () => void){

    const outputBox = document.getElementById("output-box");
    if (outputBox) {
        outputBox.innerHTML = "";
    } else {
        console.log("Error with the outputbox");
    }

    // Call DFS to compute finishing times u.f for each vertex u
    await depthFirstSearch(graph, redrawGraph);

    // Compute G_t
    const reversedGraph = reverseGraph(graph);

    // DFS(G_t), but in the main loop of DFS, consider the vertices in order of decreasing u.f
    const dfsVisit = (graph: Graph, node: Node, result: number[]): void => {
        result.push(node.index);
        node.color = Color.GRAY; // Mark the node as being visited
        const adjacencyList = graph.getAdjacencyList();
        const neighbors = adjacencyList.get(node.index) || [];

        for (let neighborIndex of neighbors) {
            const neighborNode = graph.getNodeByIndex(neighborIndex);
            if (neighborNode.color === Color.WHITE) {
                dfsVisit(graph, neighborNode, result);
            }
        }
        node.color = Color.BLACK; // Mark the node as fully processed
    };

    outputBox.innerHTML += "Strongly Connected Components<br><br>";
    let sccNum = 1;
    for (let node of getNodesSortedByDecreasingF(reversedGraph)) {
        if (node.color === Color.WHITE) {
            const result = [];
            dfsVisit(reversedGraph, node, result);
            const outputLine = `SCC${sccNum++}: ${result}<br>`;
            outputBox.innerHTML += outputLine;
        }
    }
    console.log("End of SCC");
}

export function reverseGraph(graph: Graph): Graph {
    const reversedGraph = new Graph();
    reversedGraph.isDirected = graph.isDirected;
    reversedGraph.isWeighted = graph.isWeighted;

    // Copy nodes
    graph.nodes.forEach(node => {
        const newNode = { index: node.index, x: node.x, y: node.y, color: Color.WHITE, d: node.d, pred: -1, f:node.f};
        reversedGraph.nodes.push({ ...newNode });
    });

    // Reverse edges
    graph.edges.forEach(edge => {
        reversedGraph.addEdge(edge.target, edge.source, edge.w);
    });

    return reversedGraph;
}

function getNodesSortedByDecreasingF(graph: Graph): Node[] {
    return graph.nodes.slice().sort((a, b) => b.f - a.f);
}


let time = 0;
let topologicallySortedNodes = null;

function detectCycle(graph: Graph): boolean {
    graph.nodes.forEach(node => {
        node.color = Color.WHITE;
    });

    // Helper function for DFS
    const dfsVisit = (graph: Graph, node: Node): boolean => {
        node.color = Color.GRAY; // Mark the node as being visited
        const adjacencyList = graph.getAdjacencyList();
        const neighbors = adjacencyList.get(node.index) || [];

        for (let neighborIndex of neighbors) {
            const neighborNode = graph.getNodeByIndex(neighborIndex);
            if (neighborNode.color === Color.WHITE) {
                if (dfsVisit(graph, neighborNode)) {
                    return true;
                }
            } else if (neighborNode.color === Color.GRAY) {
                return true; // Cycle detected
            }
        }

        node.color = Color.BLACK; // Mark the node as fully processed
        return false;
    };

    // Perform DFS from each unvisited node
    for (let node of graph.nodes) {
        if (node.color === Color.WHITE) {
            if (dfsVisit(graph, node)) {
                return true; // Cycle found
            }
        }
    }
    return false; // No cycles found
}

export async function topologicalSort(graph: Graph, redrawGraph: () => void): Promise<string> {
    topologicallySortedNodes = new LinkedList();

    // Check if there is a cycle in the graph
    if (!graph.isDirected || detectCycle(graph)) {
        console.log("Graph contains a cycle or is not directed.");
        return "Topological sort is only defined for directed acyclic graphs.";
    }

    await depthFirstSearch(graph, redrawGraph, true);
    console.log("End of Topological Sort");
    return "Topologically sorted nodes: \n" + topologicallySortedNodes.getListAsString();
}

export async function depthFirstSearch(graph: Graph, redrawGraph: () => void, topSort: boolean = false) {
    const V = graph.nodes;

    V.forEach(u => {
        u.color = Color.WHITE;
        u.pred = -1;
    });

    time = 0;

    for (const u of graph.nodes) {
        if (u.color === Color.WHITE) {
            await DFSVisit(graph, u, redrawGraph, topSort);
        }
    }
    console.log("End of DFS");
}

async function DFSVisit(graph: Graph, u: Node, redrawGraph: () => void, topSort: boolean = false) {
    const adjList = graph.getAdjacencyList();
    time = time + 1;
    u.d = time;
    u.color = Color.GRAY;
    redrawGraph();
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    const adjNodes = adjList.get(u.index) || [];
    for (const v_index of adjNodes) {
        const v = graph.getNodeByIndex(v_index);
        if (v.color === Color.WHITE) {
            v.pred = u.index;
            await DFSVisit(graph, v, redrawGraph, topSort);
        }
    }
    u.color = Color.BLACK;
    time = time + 1;
    u.f = time;
    if (topSort) {
        topologicallySortedNodes.addToFront(u.index);
    }
    redrawGraph();
    await new Promise(resolve => setTimeout(resolve, 1000)); 
}

export async function breadthFirstSearchAsync(graph: Graph, s_index: number, redrawGraph: () => void){
    const adjList = graph.getAdjacencyList();
    const V = graph.nodes;

    // Initialization
    const s = graph.getNodeByIndex(s_index);
    V.forEach(u => {
        if (u.index !== s.index) {
            u.color = Color.WHITE;
            u.d = Number.MAX_VALUE;
            u.pred = -1;
        }
    })
    s.color = Color.GRAY;
    s.d = 0;
    s.pred = -1;
    const Q = new Queue<number>();
    Q.enqueue(s.index);

    redrawGraph();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1000 ms = 1 second

    while (!Q.isEmpty()){
        const u_index = Q.dequeue();
        console.log("curr index: " + u_index);
        const u = graph.getNodeByIndex(u_index);
        const adjNodes = adjList.get(u_index);
        
        for (const v_index of adjNodes) {
            const v = graph.getNodeByIndex(v_index);
            if (v.color === Color.WHITE){
                v.color = Color.GRAY;
                v.d = u.d + 1;
                v.pred = u_index;
                Q.enqueue(v.index);

                redrawGraph();
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1000 ms = 1 second
            }
        }
        u.color = Color.BLACK;

        redrawGraph();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1000 ms = 1 second
    }
    console.log("End of BFS");
}