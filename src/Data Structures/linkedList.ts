class LinkedListNode {
    value: number;
    next: LinkedListNode | null = null;

    constructor(value: number) {
        this.value = value;
    }
}

export class LinkedList {
    private head: LinkedListNode | null = null;
    private size: number = 0;

    // Add a node to the front of the list
    addToFront(value: number): void {
        const newNode = new LinkedListNode(value);

        if (this.head === null) {
            this.head = newNode;
        } else {
            newNode.next = this.head;
            this.head = newNode;
        }

        this.size++;
    }

    // Print the list
    getListAsString(): string {
        let current = this.head;
        const elements: string[] = [];
        while (current !== null) {
            elements.push(current.value.toString());
            current = current.next;
        }
        return elements.join(' , ');
    }

    // Get the size of the list
    getSize(): number {
        return this.size;
    }
}
