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
      const newNode = { index: this.nodes.length, x, y };
      this.nodes.push(newNode);
  }

  addEdge(source: number, target: number): void {
      const newEdge = { source, target };
      this.edges.push(newEdge);
  }

  deleteEdge(sourceIndex: number, targetIndex: number): void {
    this.edges = this.edges.filter(edge =>
        !(edge.source === sourceIndex && edge.target === targetIndex)
    );
  }
  // Other graph manipulation methods
}