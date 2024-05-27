export class Queue<T> {
    private items: T[] = [];

    // Enqueue: Add an element to the end of the queue
    enqueue(element: T): void {
        this.items.push(element);
    }

    // Dequeue: Remove an element from the front of the queue
    dequeue(): T | undefined {
        return this.items.shift();
    }

    // Peek: Get the element at the front of the queue without removing it
    peek(): T | undefined {
        return this.items[0];
    }

    // Check if the queue is empty
    isEmpty(): boolean {
        return this.items.length === 0;
    }

    // Get the size of the queue
    size(): number {
        return this.items.length;
    }

    // Clear the queue
    clear(): void {
        this.items = [];
    }
}
