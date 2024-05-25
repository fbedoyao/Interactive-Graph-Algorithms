import * as d3 from 'd3';
import { Graph, Node, Edge } from './graph';
import { deactivateAllButtonsExcept, enableAllButtons, addEventListenerToSelection, printNodeIndex } from './utils';
import { printGraph } from './algorithm'

export function renderGraph(graph: Graph, svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {
    // State Variables
    let draggingEnabled = false;
    let addingNodesEnabled = false;
    let deletingEdgesEnabled = false;
    let deletingNodesEnabled = false;
    let addingEdgesEnabled = false;
    let sourceNode = null;

    // Functions to handle drag events
    function dragstarted(event, d) {
        if (draggingEnabled) {
            d3.select(this).raise();
        }
    }

    function dragged(event, d) {
        if (draggingEnabled) {
            const containerBounds = getContainerBounds();
            const newX = d.x + event.dx;
            const newY = d.y + event.dy;
            const constrainedX = Math.max(containerBounds.minX, Math.min(containerBounds.maxX, newX));
            const constrainedY = Math.max(containerBounds.minY, Math.min(containerBounds.maxY, newY));
            d3.select(this).attr("transform", `translate(${constrainedX}, ${constrainedY})`);
            d.x = constrainedX;
            d.y = constrainedY;
            redrawGraph();
            updateEdgePositions(edge);
        }
    }

    function dragended(event, d) {
        if (draggingEnabled) {
            console.log("Nodes after dragging:", graph.nodes);
        }
    }

    // Utility Functions
    function getContainerBounds() {
        return {
            minX: 20,
            minY: 20,
            maxX: 980,
            maxY: 483
        };
    }

    function updateEdgePositions(edgesSVGElement) {
        if (graph.edges.length > 0) {
            edgesSVGElement.attr("d", function(d) {
                const sourceNode = graph.nodes.find(node => node.index === d.source);
                const targetNode = graph.nodes.find(node => node.index === d.target);
                
                if (sourceNode && targetNode) {
                    if (sourceNode.index === targetNode.index) {
                        // Self-looping path
                        const startPointAngle = 5 * Math.PI / 4;
                        const endPointAngle = 7 * Math.PI / 4;
                        const startPoint = getFixedPointOnCircle(sourceNode.x, sourceNode.y, 15, startPointAngle);
                        const endPoint = getFixedPointOnCircle(sourceNode.x, sourceNode.y, 15, endPointAngle);
                        const controlPoint = getOutwardControlPoint(sourceNode.x, sourceNode.y, (startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2, 30);
                        return `M ${startPoint.x},${startPoint.y} Q ${controlPoint.x},${controlPoint.y} ${endPoint.x},${endPoint.y}`;
                    } else {
                        // Regular path (shortened line)
                        const dx = targetNode.x - sourceNode.x;
                        const dy = targetNode.y - sourceNode.y;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        const shortenLength = 15; // Adjust to shorten or lengthen the lines
                        const newX = sourceNode.x + (dx / length) * (length - shortenLength);
                        const newY = sourceNode.y + (dy / length) * (length - shortenLength);
                        return `M ${sourceNode.x},${sourceNode.y} L ${newX},${newY}`;
                    }
                } else {
                    // Handle case where sourceNode or targetNode is undefined
                    return null; // or handle appropriately based on your application logic
                }
            })
            .attr("marker-end", d => graph.isDirected ? "url(#arrowhead)" : null); 
        }
    }
        
    

    function deleteAllNodesAndEdges() {
        graph.nodes = [];
        graph.edges = [];
        //svg.selectAll("*").remove();
        redrawGraph();
    }

    function addNodeOnClick(event) {
        if (addingNodesEnabled) {
            const [x, y] = d3.pointer(event, this);
            graph.addNode(x, y);
            redrawGraph();
        }
    }

    function handleNodeClick(event, d) {
        if (deletingNodesEnabled) {
            console.log("Deleting node " + d.index);
            graph.deleteNode(d.index);
            redrawGraph();
        } else if (addingEdgesEnabled) {
            if (sourceNode === null) {
                sourceNode = d.index;
                console.log("Adding edge ...");
                console.log("source: " + d.index);
            } else {
                console.log("target: " + d.index);
                graph.addEdge(sourceNode, d.index);
                sourceNode = null;
                redrawGraph();
                console.log(graph);
            }
        } else {
            console.log("Clicked on node " + d.index);
        }
    }

    function handleEdgeClick(event, d) {
        if (deletingEdgesEnabled) {
            graph.deleteEdge(d.source, d.target);
            redrawGraph();
        } else {
            console.log("Click on edge " + "(" + d.source + ", " + d.target + ")");
        }
    }

    function redrawGraph() {
        const updatedEdges = svg
            .selectAll<SVGPathElement, Edge>(".edge")
            .data(graph.edges);
        updatedEdges.exit().remove();
        const newEdgePaths = updatedEdges
            .enter()
            .append("path")
            .classed("edge", true)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("marker-end", d => graph.isDirected ? "url(#arrowhead)" : null); // Set marker-end for new edges

        const mergedEdges = newEdgePaths.merge(updatedEdges);
        updateEdgePositions(mergedEdges);
        mergedEdges.lower();

        const updatedNodes = svg
            .selectAll<SVGGElement, Node>(".node")
            .data(graph.nodes, d => d.index);
        updatedNodes.exit().remove();
        const newNodeGroups = updatedNodes
            .enter()
            .append("g")
            .classed("node", true)
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
        newNodeGroups
            .append("circle")
            .attr("r", 15);
        newNodeGroups
            .append("text")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(d => d.index);
        const mergedNodes = newNodeGroups.merge(updatedNodes);
        mergedNodes
            .attr("transform", d => `translate(${d.x}, ${d.y})`)
            .call(drag);
        addEventListenerToSelection<SVGGElement, Node>(mergedNodes, "click", handleNodeClick);
        addEventListenerToSelection<SVGPathElement, Edge>(mergedEdges, "click", handleEdgeClick);
        applyDeletionClass(mergedNodes, deletingNodesEnabled);
        applyDeletionClass(mergedEdges, deletingEdgesEnabled);
    }

    function applyDeletionClass(selection, condition) {
        if (condition) {
            selection.classed("deletion-active", true);
        } else {
            selection.classed("deletion-active", false);
        }
    }

    function setupEventListeners() {
        document.getElementById("add-node").addEventListener("click", () => toggleAddNodeMode());
        document.getElementById("add-edge").addEventListener("click", () => toggleAddEdgeMode());
        document.getElementById("drag-tool").addEventListener("click", () => toggleDragMode());
        document.getElementById("delete-node").addEventListener("click", () => toggleDeleteNodeMode());
        document.getElementById("delete-edge").addEventListener("click", () => toggleDeleteEdgeMode());
        document.getElementById("delete-graph").addEventListener("click", () => deleteAllNodesAndEdges());
        document.getElementById("change-graph-type").addEventListener("click", () => changeGraphType());
        document.getElementById("run-algorithm").addEventListener("click", () => runAlgorithm());
    }

    function changeGraphType() {
        console.log("Called changeGraphType");
        const changeGraphTypeButton = document.getElementById("change-graph-type");
        if (graph.isDirected){
            console.log("Graph is directed");
            graph.edges.forEach(e => {
                const source = e.source;
                const target = e.target;
                if (e.source === e.target) {
                    graph.deleteEdge(source, target);
                }
            });
            graph.isDirected = false;
            changeGraphTypeButton.textContent = "Make Directed";
        } else {
            console.log("Graph is undirected");
            graph.isDirected = true;
            changeGraphTypeButton.textContent = "Make Undirected";
        }
        redrawGraph();
    }

    function toggleAddNodeMode() {
        addingNodesEnabled = !addingNodesEnabled;
        const addButton = document.getElementById("add-node");
        if (addingNodesEnabled) {
            deactivateAllButtonsExcept("add-node");
            addButton.classList.add("active");
            svg.style('cursor', 'crosshair').on("click", addNodeOnClick);
        } else {
            enableAllButtons();
            addButton.classList.remove("active");
            svg.style('cursor', 'auto').on("click", null);
        }
    }

    function toggleAddEdgeMode() {
        addingEdgesEnabled = !addingEdgesEnabled;
        const addEdgeButton = document.getElementById("add-edge");
        if (addingEdgesEnabled) {
            deactivateAllButtonsExcept("add-edge");
            addEdgeButton.classList.add("active");
        } else {
            enableAllButtons();
            addEdgeButton.classList.remove("active");
        }
    }

    function toggleDragMode() {
        draggingEnabled = !draggingEnabled;
        const dragToolButton = document.getElementById("drag-tool");
        if (draggingEnabled) {
            deactivateAllButtonsExcept("drag-tool");
            dragToolButton.classList.add("active");
            svg.classed('dragging', true);
        } else {
            enableAllButtons();
            dragToolButton.classList.remove("active");
            svg.classed('dragging', false);
        }
    }

    function toggleDeleteNodeMode() {
        deletingNodesEnabled = !deletingNodesEnabled;
        const deleteNodesButton = document.getElementById("delete-node");
        if (deletingNodesEnabled) {
            deactivateAllButtonsExcept("delete-node");
            deleteNodesButton.classList.add("active");
        } else {
            enableAllButtons();
            deleteNodesButton.classList.remove("active");
        }
        redrawGraph();
    }

    function toggleDeleteEdgeMode() {
        deletingEdgesEnabled = !deletingEdgesEnabled;
        const deleteEdgesButton = document.getElementById("delete-edge");
        if (deletingEdgesEnabled) {
            deactivateAllButtonsExcept("delete-edge");
            deleteEdgesButton.classList.add("active");
        } else {
            enableAllButtons();
            deleteEdgesButton.classList.remove("active");
        }
        redrawGraph();
    }

    function runAlgorithm(){
        const algorithmSelect = document.getElementById("algorithm-select") as HTMLSelectElement;
        const selectedAlgorithm = algorithmSelect.value;

        let algorithmFunction;
        switch (selectedAlgorithm) {
            case "print":
                algorithmFunction = printGraph;
                break;
            // Add cases for other algorithms as needed
            default:
                return;
        }

        // Perform algorithm on current graph state
        algorithmFunction(graph, svg);

        // Redraw the graph to reflect algorithm changes
        redrawGraph();
    }

    // Self - loops
    function getFixedPointOnCircle(cx, cy, radius, angle) {
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    }

    function getOutwardControlPoint(cx, cy, px, py, distance) {
        const dx = px - cx;
        const dy = py - cy;
        const length = Math.sqrt(dx * dx + dy * dy);
        const scale = (length + distance) / length;
        return {
            x: cx + dx * scale,
            y: cy + dy * scale
        };
    }

    // Main execution starts here

    const defs = svg.append("defs");

    // Arrowhead marker
    defs.append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)  // Adjust the position of the arrowhead relative to the end of the line
        .attr("refY", 0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,-5 L 10,0 L 0,5")
        .attr("fill", "#000");

    const edge = svg
        .selectAll(".edge")
        .data(graph.edges)
        .enter()
        .append(function(d) {
            if (d.source !== d.target) {
              return document.createElementNS("http://www.w3.org/2000/svg", "path");
            } else {
              return document.createElementNS("http://www.w3.org/2000/svg", "path");
            }
          })
        .classed("edge", true)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("d", function(d) {
            const sourceNode = graph.nodes.find(node => node.index === d.source);
            const targetNode = graph.nodes.find(node => node.index === d.target);
            if (sourceNode.index === targetNode.index) {
                const startPointAngle = 5 * Math.PI / 4; // ? degrees
                const endPointAngle = 7 * Math.PI / 4; // 315 degrees
                const startPoint = getFixedPointOnCircle(sourceNode.x, sourceNode.y, 15, startPointAngle);
                const endPoint = getFixedPointOnCircle(sourceNode.x, sourceNode.y, 15, endPointAngle);
                const controlPoint = getOutwardControlPoint(sourceNode.x, sourceNode.y, (startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2, 30);
                return `M${startPoint.x},${startPoint.y} Q${controlPoint.x},${controlPoint.y} ${endPoint.x},${endPoint.y}`;
            } else {
                return `M ${sourceNode.x},${sourceNode.y} L ${targetNode.x*0.8},${targetNode.y*0.8}`;
            }
        })
        .attr("marker-end", d => graph.isDirected ? "url(#arrowhead)" : null); // Initial setup includes arrowhead for directed graphs


    const node = svg
        .selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("g")
        .classed("node", true)
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

    node
        .append("circle")
        .attr("r", 15);
    
    node
        .append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(d => d.index);

    const drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    node.call(drag);

    setupEventListeners();
    addEventListenerToSelection<SVGGElement, Node>(node, "click", handleNodeClick);
    addEventListenerToSelection<SVGGElement, Edge>(edge, "click", handleEdgeClick);
    updateEdgePositions(edge);
}
