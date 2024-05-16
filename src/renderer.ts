import * as d3 from 'd3';
import { Graph, Node, Edge } from './graph';
import { deactivateAllButtonsExcept, enableAllButtons, addEventListenerToSelection, printNodeIndex } from './utils';

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
            edgesSVGElement.attr("x1", d => graph.nodes.find(node => node.index === d.source)?.x || 0)
                .attr("y1", d => graph.nodes.find(node => node.index === d.source)?.y || 0)
                .attr("x2", d => graph.nodes.find(node => node.index === d.target)?.x || 0)
                .attr("y2", d => graph.nodes.find(node => node.index === d.target)?.y || 0);
        }
    }

    function deleteAllNodesAndEdges() {
        graph.nodes = [];
        graph.edges = [];
        svg.selectAll("*").remove();
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
            graph.deleteNode(d.index);
            redrawGraph();
            console.log(graph);
        } else if (addingEdgesEnabled) {
            if (sourceNode === null) {
                sourceNode = d.index;
                console.log("source: " + d.index);
            } else {
                graph.addEdge(sourceNode, d.index);
                sourceNode = null;
                redrawGraph();
                console.log(graph);
            }
        }
    }

    function handleEdgeClick(event, d) {
        if (deletingEdgesEnabled) {
            graph.deleteEdge(d.source, d.target);
            redrawGraph();
            console.log(graph);
        }
    }

    function redrawGraph() {
        const updatedEdges = svg
            .selectAll<SVGLineElement, Edge>(".edge")
            .data(graph.edges);
        updatedEdges.exit().remove();
        const newEdgeLines = updatedEdges
            .enter()
            .append("line")
            .classed("edge", true)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        const mergedEdges = newEdgeLines
            .merge(updatedEdges);
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
        const mergedNodes = newNodeGroups
            .merge(updatedNodes);
        mergedNodes
            .attr("transform", d => `translate(${d.x}, ${d.y})`)
            .call(drag);
        addEventListenerToSelection<SVGGElement, Node>(mergedNodes, "click", handleNodeClick);
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

    // Main execution starts here
    const edge = svg
        .selectAll(".edge")
        .data(graph.edges)
        .enter()
        .append("line")
        .classed("edge", true)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    
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