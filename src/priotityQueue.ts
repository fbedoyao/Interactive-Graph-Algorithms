import { Node } from "graph"

export class PriorityQueue {
    private heap: Node[];

    constructor() {
        this.heap = [];
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

        while (currentIndex > 0 && this.heap[currentIndex].key < this.heap[parentIndex].key) {
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

            if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].key < this.heap[leftChildIndex].key) {
                smallerChildIndex = rightChildIndex;
            }

            if (this.heap[currentIndex].key <= this.heap[smallerChildIndex].key) {
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
}