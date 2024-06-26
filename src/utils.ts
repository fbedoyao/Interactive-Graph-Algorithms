import * as d3 from 'd3';
import { Graph, Node, Edge, Color } from './Data Structures/graph';


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
    const toolBarButtons = document.querySelectorAll<HTMLButtonElement>("#toolbar button"); // Narrow down the type to HTMLButtonElement
    toolBarButtons.forEach(button => {
        if (button.id !== buttonId) {
            button.disabled = true;
        }
    });
    // Also, disable the "Run Algorithm" button
    const runAlgorithmButton = document.getElementById("run-algorithm") as HTMLButtonElement;
    if (runAlgorithmButton) {
        runAlgorithmButton.disabled = true;
        runAlgorithmButton.classList.add("disabled-button");
    } else {
        console.log("Run Algorithm button not found");
    }
}

export function enableAllButtons(){
    const buttons = document.querySelectorAll<HTMLButtonElement>("#toolbar button"); // Narrow down the type to HTMLButtonElement
    buttons.forEach(button => {
        button.disabled = false;
    });

    // Also, disable the "Run Algorithm" button
    const runAlgorithmButton = document.getElementById("run-algorithm") as HTMLButtonElement;
    if (runAlgorithmButton) {
        runAlgorithmButton.disabled = false;
        runAlgorithmButton.classList.remove("disabled-button");
    } else {
        console.log("Run Algorithm button not found");
    }
}

export function resetNodesState(graph: Graph){
    graph.nodes.forEach(function(node){
        node.color = Color.WHITE;
        node.d = Number.MAX_VALUE;
        node.pred = -1;
    })
}

export function resetEdgeState(graph: Graph){
    graph.edges.forEach(edge => {
        edge.isHighlighted = false;
    })
}

export function getContainerBounds() {
    return {
        minX: 20,
        minY: 20,
        maxX: 980,
        maxY: 483
    };
}

export function getFixedPointOnCircle(cx, cy, radius, angle) {
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
    };
}

export function getOutwardControlPoint(cx, cy, px, py, distance) {
    const dx = px - cx;
    const dy = py - cy;
    const length = Math.sqrt(dx * dx + dy * dy);
    const scale = (length + distance) / length;
    return {
        x: cx + dx * scale,
        y: cy + dy * scale
    };
}

// Function to calculate midpoint of a quadratic Bézier curve
export function getMidPointOnQuadraticBezier(startPoint, controlPoint, endPoint) {
    const t = 0.5;
    const x = Math.pow(1 - t, 2) * startPoint.x + 2 * (1 - t) * t * controlPoint.x + Math.pow(t, 2) * endPoint.x;
    const y = Math.pow(1 - t, 2) * startPoint.y + 2 * (1 - t) * t * controlPoint.y + Math.pow(t, 2) * endPoint.y;
    return { x, y };
}

// Function to calculate control point for quadratic Bézier curve
export function getQuadraticControlPoint(sourceNode, targetNode) {
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const curvature = 0.2;
    const offsetX = dy * curvature;
    const offsetY = -dx * curvature;
    return {
        x: (sourceNode.x + targetNode.x) / 2 + offsetX,
        y: (sourceNode.y + targetNode.y) / 2 + offsetY
    };
}

// Calculate outward offset for edge labels
export function getOutwardOffset(sourceNode, targetNode, controlPoint, offset) {
    const midPoint = getMidPointOnQuadraticBezier(sourceNode, controlPoint, targetNode);
    const dx = midPoint.x - controlPoint.x;
    const dy = midPoint.y - controlPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    return {
    x: (dx / length) * offset,
    y: (dy / length) * offset
    };
}

// Function to calculate path with curvature
export function curvedPath(d, graph: Graph) {
    const source = graph.getNodeByIndex(d.source);
    const target = graph.getNodeByIndex(d.target);
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    const offset = 15; // Adjust this value to shorten the path
    const shortenFactor = offset / dr;
    const sx = source.x + dx * shortenFactor;
    const sy = source.y + dy * shortenFactor;
    const tx = target.x - dx * shortenFactor;
    const ty = target.y - dy * shortenFactor;
    const curvature = 0.2; // Adjust curvature here
    const offsetX = dy * curvature;
    const offsetY = -dx * curvature;
    return `M${sx},${sy} Q${(sx + tx) / 2 + offsetX},${(sy + ty) / 2 + offsetY} ${tx},${ty}`;
}

export function getEdgePathDefinition(edge: Edge, graph: Graph){
    const sourceNode = graph.nodes.find(node => node.index === edge.source);
    const targetNode = graph.nodes.find(node => node.index === edge.target);

    if (sourceNode && targetNode) {
        if (sourceNode.index === targetNode.index) {
            // Self-looping path
            const startPointAngle = 5 * Math.PI / 4;
            const endPointAngle = 7 * Math.PI / 4;
            const startPoint = getFixedPointOnCircle(sourceNode.x, sourceNode.y, 15, startPointAngle);
            const endPoint = getFixedPointOnCircle(sourceNode.x, sourceNode.y, 15, endPointAngle);
            const controlPoint = getOutwardControlPoint(sourceNode.x, sourceNode.y, (startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2, 30);
            return `M ${startPoint.x},${startPoint.y} Q ${controlPoint.x},${controlPoint.y} ${endPoint.x},${endPoint.y}`;
        }
        if(graph.edgeExists(edge.target, edge.source)){
            // Path with curvature
            return curvedPath(edge, graph);
        } 
        // Regular path (shortened for visuals)
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const shortenLength = 15; // Adjust to shorten or lengthen the lines
        const newX = sourceNode.x + (dx / length) * (length - shortenLength);
        const newY = sourceNode.y + (dy / length) * (length - shortenLength);
        return `M ${sourceNode.x},${sourceNode.y} L ${newX},${newY}`;     
    }
    return null;
}

export function getEdgeLabelXCoordinate(edge: Edge, graph: Graph){
    const sourceNode = graph.nodes.find(node => node.index === edge.source);
    const targetNode = graph.nodes.find(node => node.index === edge.target);
    
    if (sourceNode && targetNode) {
        if (sourceNode.index === targetNode.index) {
            // Self-looping path
            const startPointAngle = 5 * Math.PI / 4;
            const endPointAngle = 7 * Math.PI / 4;
            const startPoint = getFixedPointOnCircle(sourceNode.x, sourceNode.y, 15, startPointAngle);
            const endPoint = getFixedPointOnCircle(sourceNode.x, sourceNode.y, 15, endPointAngle);
            const controlPoint = getOutwardControlPoint(sourceNode.x, sourceNode.y, (startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2, 30);
            const midPoint = getMidPointOnQuadraticBezier(startPoint, controlPoint, endPoint);
            return midPoint.x;
        } 
        if(graph.edgeExists(edge.target, edge.source)){
            // Two curves connecting two nodes
            const controlPoint = getQuadraticControlPoint(sourceNode, targetNode);
            const midPoint = getMidPointOnQuadraticBezier({x: sourceNode.x, y: sourceNode.y}, controlPoint, {x: targetNode.x, y: targetNode.y});
            const outwardOffset = getOutwardOffset(sourceNode, targetNode, controlPoint, -15);
            return midPoint.x + outwardOffset.x;
        } 
        // Straight line
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        return midX - (dy / Math.sqrt(dx * dx + dy * dy)) * 20;
    }
    return null;
}

export function getEdgeLabelYCoordinate(edge: Edge, graph: Graph){
    const sourceNode = graph.nodes.find(node => node.index === edge.source);
    const targetNode = graph.nodes.find(node => node.index === edge.target);
    if (sourceNode && targetNode) {
        if (sourceNode.index === targetNode.index) {
            // Self-looping path
            const startPointAngle = 5 * Math.PI / 4;
            const endPointAngle = 7 * Math.PI / 4;
            const startPoint = getFixedPointOnCircle(sourceNode.x, sourceNode.y, 15, startPointAngle);
            const endPoint = getFixedPointOnCircle(sourceNode.x, sourceNode.y, 15, endPointAngle);
            const controlPoint = getOutwardControlPoint(sourceNode.x, sourceNode.y, (startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2, 30);
            const midPoint = getMidPointOnQuadraticBezier(startPoint, controlPoint, endPoint);
            return midPoint.y -10;
        }
        if(graph.edgeExists(edge.target, edge.source)){
            // Two edges connecting two nodes
            const controlPoint = getQuadraticControlPoint(sourceNode, targetNode);
            const midPoint = getMidPointOnQuadraticBezier({x: sourceNode.x, y: sourceNode.y}, controlPoint, {x: targetNode.x, y: targetNode.y});
            const outwardOffset = getOutwardOffset(sourceNode, targetNode, controlPoint, -15);
            return midPoint.y + outwardOffset.y;
        }
        // Straight line
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        return midY + (dx / Math.sqrt(dx * dx + dy * dy)) * 20;
    }
    return null;
}