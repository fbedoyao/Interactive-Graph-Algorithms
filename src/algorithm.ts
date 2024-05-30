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

let time = 0;

export async function depthFirstSearch(graph: Graph, redrawGraph: () => void){
    const adjList = graph.getAdjacencyList();
    const V = graph.nodes;

    V.forEach(u => {
        u.color = Color.WHITE;
        u.pred = -1;
    });

    time = 0;

    for (const u of graph.nodes){
        if (u.color === Color.WHITE){
            await DFSVisit(graph, u, redrawGraph);
        }
    }
    console.log("End of DFS");
}

async function DFSVisit(graph: Graph, u: Node, redrawGraph: () => void){
    const adjList = graph.getAdjacencyList();
    time = time + 1;
    u.d = time;
    u.color = Color.GRAY;
    redrawGraph();
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    const adjNodes = adjList.get(u.index);
    for (const v_index of adjNodes){
        const v = graph.getNodeByIndex(v_index);
        if (v.color === Color.WHITE){
            v.pred = u.index;
            await DFSVisit(graph, v, redrawGraph);
        }
    }
    u.color = Color.BLACK;
    time = time + 1;
    u.f = time;
    redrawGraph();
    await new Promise(resolve => setTimeout(resolve, 1000)); 
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