import { Graph } from "./graph";

export function runSampleAlgorithm(graph: Graph) {
    // Example algorithm: print the adjacency list
    const adjacencyList = graph.getAdjacencyList();
    console.log("Adjacency List:");
    adjacencyList.forEach((neighbors, node) => {
        console.log(`${node}: ${neighbors.join(", ")}`);
    });
}