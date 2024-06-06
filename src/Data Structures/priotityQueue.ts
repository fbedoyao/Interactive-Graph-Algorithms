import { Node } from "./graph";

export class PriorityQueue {
    private heap: Node[];
    private comparator: (a: Node, b: Node) => number;

    constructor(nodes: Node[] = [], comparator: (a: Node, b: Node) => number) {
        this.heap = [];
        this.comparator = comparator;
        if (nodes) {
            for (let node of nodes) {
                this.insert(node);
            }
        }
    }

    private leftChildIndex(index: number): number {
        return 2 * index + 1;
    }

    private rightChildIndex(index: number): number {
        return 2 * index + 2;
    }

    private parentIndex(index: number): number {
        return Math.floor((index - 1) / 2);
    }

    private swap(index1: number, index2: number): void {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }

    private heapifyUp(index: number): void {
        let currentIndex = index;
        let parentIndex = this.parentIndex(currentIndex);

        while (currentIndex > 0 && this.comparator(this.heap[currentIndex], this.heap[parentIndex]) < 0) {
            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
            parentIndex = this.parentIndex(currentIndex);
        }
    }

    private heapifyDown(index: number): void {
        let currentIndex = index;
        let leftChildIndex = this.leftChildIndex(currentIndex);
        let rightChildIndex = this.rightChildIndex(currentIndex);

        while (leftChildIndex < this.heap.length) {
            let smallerChildIndex = leftChildIndex;

            if (rightChildIndex < this.heap.length && this.comparator(this.heap[rightChildIndex], this.heap[leftChildIndex]) < 0) {
                smallerChildIndex = rightChildIndex;
            }

            if (this.comparator(this.heap[currentIndex], this.heap[smallerChildIndex]) <= 0) {
                break;
            }

            this.swap(currentIndex, smallerChildIndex);
            currentIndex = smallerChildIndex;
            leftChildIndex = this.leftChildIndex(currentIndex);
            rightChildIndex = this.rightChildIndex(currentIndex);
        }
    }

    public isEmpty(): boolean {
        return this.heap.length === 0;
    }

    public hasElement(node: Node): boolean {
        return this.heap.some(u => node.index === u.index);
    }

    public insert(node: Node): void {
        this.heap.push(node);
        this.heapifyUp(this.heap.length - 1);
    }

    public extractMin(): Node | null {
        if (this.isEmpty()) {
            return null;
        }

        if (this.heap.length === 1) {
            return this.heap.pop()!;
        }

        const minNode = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.heapifyDown(0);
        return minNode;
    }

    public updatePriorityByKey(node: Node, newKey: number): void {
        const index = this.heap.indexOf(node);
        if (index === -1) return;

        const oldKey = node.key;
        node.key = newKey;

        if (this.comparator({ ...node, key: newKey }, { ...node, key: oldKey }) < 0) {
            this.heapifyUp(index);
        } else {
            this.heapifyDown(index);
        }
    }

    public updatePriorityByD(node: Node, newD: number): void {
        const index = this.heap.indexOf(node);
        if (index === -1) return;

        const oldD = node.d;
        node.d = newD;

        if (this.comparator({ ...node, d: newD }, { ...node, d: oldD }) < 0) {
            this.heapifyUp(index);
        } else {
            this.heapifyDown(index);
        }
    }
}