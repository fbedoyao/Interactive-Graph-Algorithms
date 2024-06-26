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
  f: number;
  key: number; 
  isHighlighted: boolean;
}

export interface Edge {
  source: number;
  target: number;
  w: number;
  isHighlighted: boolean;
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

  getEdge(sourceIndex: number, targetIndex: number): Edge {
    if (this.isDirected){
      for (let edge of this.edges){
        if (edge.source === sourceIndex && edge.target === targetIndex){
          return edge;
        }
      }
    } else {
      for (let edge of this.edges){
        if ((edge.source === sourceIndex && edge.target === targetIndex) || (edge.source === targetIndex && edge.target === sourceIndex)){
          return edge;
        }
      }
    }
    console.log("Couldn't getEdge");
    return null;
  }

  getWeight(u: Node, v: Node): number{
    if (!this.isWeighted){
      return 0;
    }
    if (this.isDirected){
      for (let edge of this.edges){
        if(edge.source === u.index && edge.target === v.index){
          return edge.w;
        }
      }
    } else {
      for (let edge of this.edges){
        if((edge.source === u.index && edge.target === v.index) || (edge.target === u.index && edge.source === v.index)){
          return edge.w;
        }
      }
    }
    console.log("Edge wasn't found");
    return -1; // Edge wasn't found
  }

  addNode(x: number, y: number): void {
    const smallestUnusedIndex = this.findSmallestUnusedIndex();
    const newNode = { index: smallestUnusedIndex, x, y, color : Color.WHITE, d: Number.MAX_VALUE, pred: -1, f: 0, key: Number.MAX_VALUE, isHighlighted: false};
    this.nodes.push(newNode);
  }

  addEdge(source: number, target: number, w: number): void {
    if (!this.isDirected){
      console.log("Trying to add edge " + source + ", " + target + " in UNDIRECTED graph.");
      if (!this.edgeExists(source, target) && !this.edgeExists(target, source)) {
        if (source !== target){
          console.log("Edge doesn't exist. Adding it to the graph.");
          const newEdge = { source, target, w, isHighlighted: false };
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
        const newEdge = { source, target, w, isHighlighted: false };
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

    // Function to check if the graph is connected
    isConnected(): boolean {
      if (this.nodes.length === 0) return true;
  
      const visited = new Set<number>();
      const adjacencyList = this.getAdjacencyList();
  
      const dfs = (nodeIndex: number) => {
        visited.add(nodeIndex);
        const neighbors = adjacencyList.get(nodeIndex) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            dfs(neighbor);
          }
        }
      };
  
      // Start DFS from the first node
      dfs(this.nodes[0].index);
  
      // Check if all nodes are visited
      return visited.size === this.nodes.length;
    }

}