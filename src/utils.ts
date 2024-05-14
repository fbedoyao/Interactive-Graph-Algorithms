import * as d3 from 'd3';
import { Graph, Node, Edge } from './graph';


export function addEventListenerToSelection<T extends d3.BaseType, D>(
    selection: d3.Selection<T, D, any, any>,
    eventType: string,
    callback: (event: MouseEvent, d: D) => void
) {
    selection.on(eventType, (event, d) => callback(event, d));
}

export function printNodeIndex(e: MouseEvent, d: Node) {
    console.log("Hi from node: " + d.index);
}


export function deactivateAllButtonsExcept(buttonId: string){
    const buttons = document.querySelectorAll<HTMLButtonElement>("#toolbar button"); // Narrow down the type to HTMLButtonElement
    buttons.forEach(button => {
        if (button.id !== buttonId) {
            button.disabled = true;
        }
    });
}

export function enableAllButtons(){
    const buttons = document.querySelectorAll<HTMLButtonElement>("#toolbar button"); // Narrow down the type to HTMLButtonElement
    buttons.forEach(button => {
        button.disabled = false;
    });
}