export enum Color {
  WHITE = "white",
  GRAY = "#ccc",
  BLACK = "black"
}

export interface Node {
  index: number;
  x: number;
  y: number;
  color: Color;
  d: number;
  pred: number; 
}

export interface Edge {
  source: number;
  target: number;
  w: number;
}

export class Graph {
  nodes: Node[];
  edges: Edge[];
  isDirected: boolean;
  isWeighted: boolean;

  constructor() {
      this.nodes = [];
      this.edges = [];
      this.isDirected = false;
      this.isWeighted = false;
  }

  addNode(x: number, y: number): void {
    const smallestUnusedIndex = this.findSmallestUnusedIndex();
    const newNode = { index: smallestUnusedIndex, x, y, color : Color.WHITE, d: Number.MAX_VALUE, pred: -1};
    this.nodes.push(newNode);
  }

  addEdge(source: number, target: number, w: number): void {
    if (!this.isDirected){
      console.log("Trying to add edge " + source + ", " + target + " in UNDIRECTED graph.");
      if (!this.edgeExists(source, target) && !this.edgeExists(target, source)) {
        if (source !== target){
          console.log("Edge doesn't exist. Adding it to the graph.");
          const newEdge = { source, target, w };
          this.edges.push(newEdge);
        } else {
          console.log("Self-loops aren't allowed in undirected graphs. Edge can't be added to the graph.");
        }
      } else{
        console.log("Edge exists. It can't be added to the graph.")
      }
    } else {
      console.log("Trying to add edge " + source + ", " + target + " in DIRECTED graph.");
      if (!this.edgeExists(source, target)){
        if (source === target) {
          console.log("Edge is a self-loop.");
        }
        console.log("Edge doesn't exist. Adding it to the graph.");
        const newEdge = { source, target, w };
        this.edges.push(newEdge);
      } else {
        console.log("Edge exists. It can't be added to the graph.")
      }
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

  edgeExists(source: number, target: number): boolean {
    return this.edges.some(
      edge => edge.source === source && edge.target === target
    );
  }

  getNodeByIndex(nodeIndex: number): Node {
    let node = null;
    this.nodes.forEach(currNode => {
      if (nodeIndex === currNode.index){
        node = currNode;
      }
    });
    return node;
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
      if (!this.isDirected){
        adjacencyList.get(edge.target)?.push(edge.source); // If undirected graph, add this line
      }
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
      if (!this.isDirected){
        adjacencyMatrix[edge.target][edge.source] = 1; // If undirected graph, add this line
      }
    });

    return adjacencyMatrix;
  }

}