export interface Node {
  index: number;
  x: number;
  y: number;
}

export interface Edge {
  source: number;
  target: number;
}

export class Graph {
  nodes: Node[];
  edges: Edge[];

  constructor() {
      this.nodes = [];
      this.edges = [];
  }

  addNode(x: number, y: number): void {
    const smallestUnusedIndex = this.findSmallestUnusedIndex();
    const newNode = { index: smallestUnusedIndex, x, y };
    this.nodes.push(newNode);
  }

  addEdge(source: number, target: number): void {
    if (!this.edgeExists(source, target) && source !== target) {
      const newEdge = { source, target };
      this.edges.push(newEdge);
    }
  }

  deleteEdge(sourceIndex: number, targetIndex: number): void {
    this.edges = this.edges.filter(edge =>
        !(edge.source === sourceIndex && edge.target === targetIndex)
    );
  }

  deleteNode(nodeIndex: number): void {
        // Remove the node from the nodes array
        this.nodes = this.nodes.filter(node => node.index !== nodeIndex);

        // Remove any edges connected to the deleted node
        this.edges = this.edges.filter(edge =>
            edge.source !== nodeIndex && edge.target !== nodeIndex
        );
  }

  private findSmallestUnusedIndex(): number {
    const usedIndices = new Set(this.nodes.map(node => node.index));
    let smallestUnusedIndex = 0;
    while (usedIndices.has(smallestUnusedIndex)) {
        smallestUnusedIndex++;
    }
    return smallestUnusedIndex;
  }

  private edgeExists(source: number, target: number): boolean {
    return this.edges.some(
      edge => edge.source === source && edge.target === target
    );
  }

  getAdjacencyList(): Map<number, number[]> {
    const adjacencyList = new Map<number, number[]>();

    // Initialize adjacency list with empty arrays for each node
    this.nodes.forEach(node => {
      adjacencyList.set(node.index, []);
    });

    // Populate adjacency list with edges
    this.edges.forEach(edge => {
      adjacencyList.get(edge.source)?.push(edge.target);
      adjacencyList.get(edge.target)?.push(edge.source); // If undirected graph, add this line
    });

    return adjacencyList;
  }

  getAdjacencyMatrix(): number[][] {
    const matrixSize = this.nodes.length;
    const adjacencyMatrix: number[][] = [];

    // Initialize matrix with zeros
    for (let i = 0; i < matrixSize; i++) {
      adjacencyMatrix.push(new Array(matrixSize).fill(0));
    }

    // Populate matrix with edges
    this.edges.forEach(edge => {
      adjacencyMatrix[edge.source][edge.target] = 1;
      adjacencyMatrix[edge.target][edge.source] = 1; // If undirected graph, add this line
    });

    return adjacencyMatrix;
  }

}