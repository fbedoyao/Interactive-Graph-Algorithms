import { Graph } from './graph';

export function printGraph(graph: Graph){
    const adjList = graph.getAdjacencyList();
    adjList.forEach((adjNodes: number[], node: number) => {
        console.log(node + " -> " + adjNodes);
    })
}