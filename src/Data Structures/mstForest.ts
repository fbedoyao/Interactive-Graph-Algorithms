import { Node } from './graph'

class SetOfNodeIndexes {
    private _set: Set<number>;


    constructor(set: Set<number>) {
        this._set = set;
    }

    get set(): Set<number> {
        return this._set;
    }

    contains(index: number){
        return this._set.has(index);
    }

    // Equality based on set content
    equals(other: SetOfNodeIndexes): boolean {
        if (this._set.size !== other.set.size) return false;
        for (let item of this._set) {
            if (!other.set.has(item)) return false;
        }
        return true;
    }
}

export class MstForest {
    forest: Set<SetOfNodeIndexes>;

    constructor() {
        this.forest = new Set();
    }

    makeSet(node: Node){
        this.forest.add(new SetOfNodeIndexes(new Set([node.index])))
    }

    findSet(node: Node): SetOfNodeIndexes{
        for (let set of this.forest){
            if (set.contains(node.index)){
                return set;
            }
        }
        return null;
    }

    union(u: Node, v: Node): void {
        const setU = this.findSet(u);
        const setV = this.findSet(v);

        if (setU && setV && !setU.equals(setV)) {
            // Create a new set that is the union of setU and setV
            const newSet = new SetOfNodeIndexes(new Set([...setU.set, ...setV.set]));

            // Remove the old sets from the forest
            this.forest.delete(setU);
            this.forest.delete(setV);

            // Add the new merged set to the forest
            this.forest.add(newSet);
        }
    }
}