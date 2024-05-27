import { Graph, Node, Color } from './graph';
import { renderGraph } from './renderer';
import { Queue } from './queue'

export function printGraph(graph: Graph, svg: SVGSVGElement){
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

export function breadthFirstSearch(graph: Graph, s: Node, svg: SVGElement){
    const adjList = graph.getAdjacencyList();
    const V = graph.nodes;


    // Initialization
    graph.nodes.forEach(u => {
        if (u.index !== s.index) {
            u.color = Color.WHITE;
            u.d = Number.MAX_VALUE;
            u.pred = -1;
        }
    })
    s.color = Color.GRAY;
    s.d = 0;
    s.pred = -1;
    const Q = new Queue<Node>();
    Q.enqueue(s);
    while (!Q.isEmpty()){
        // Main loop logica
        // Might need to change the adjacency list so that it maps Node to Node[]
    }
}