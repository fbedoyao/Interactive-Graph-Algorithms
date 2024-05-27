import { Graph, Node, Color } from './graph';
import { renderGraph } from './renderer';
import { Queue } from './queue'

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

export function breadthFirstSearch(graph: Graph, s_index: number){
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
    while (!Q.isEmpty()){
        const u_index = Q.dequeue();
        const u = graph.getNodeByIndex(u_index);
        const adjNodes = adjList.get(u_index);
        adjNodes.forEach(v_index => {
            const v = graph.getNodeByIndex(v_index);
            if (v.color === Color.WHITE){
                v.color = Color.GRAY;
                v.d = u.d + 1;
                v.pred = u_index;
                Q.enqueue(v.index);
            }
        })
        u.color = Color.BLACK;
    }
    console.log("End of BFS");
}