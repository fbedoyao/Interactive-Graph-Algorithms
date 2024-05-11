export class Graph {
    private adjacencyList: Map<string, string[]>;

    constructor() {
        this.adjacencyList = new Map();
    }

    addNode(node: string) {
        if (!this.adjacencyList.has(node)) {
            this.adjacencyList.set(node, []);
        }
    }

    addEdge(node1: string, node2: string) {
        this.adjacencyList.get(node1)?.push(node2);
        this.adjacencyList.get(node2)?.push(node1);
    }

    getAdjacencyList() {
        return this.adjacencyList;
    }
}
