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
    const Q = new Queue<number>();
    Q.enqueue(s.index);
    while (!Q.isEmpty()){
        const u_index = Q.dequeue();
        const u = this.getNodeByIndex(u_index);
        graph.nodes.forEach(v => {
            if (v.color === Color.WHITE){
                v.color = Color.GRAY;
                v.d = u.d + 1;
                v.pred = u;
                Q.enqueue(v.index);
            }
        })
        u.color = Color.BLACK;
    }
}