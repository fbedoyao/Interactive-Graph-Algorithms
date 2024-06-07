import * as d3 from 'd3';
import { Graph, Node, Edge, Color } from './Data Structures/graph';
import { deactivateAllButtonsExcept, enableAllButtons, addEventListenerToSelection, resetNodesState, resetEdgeState, getContainerBounds, getEdgePathDefinition, getEdgeLabelXCoordinate, getEdgeLabelYCoordinate} from './utils';
import { breadthFirstSearchAsync, depthFirstSearch, printGraph, topologicalSort, stronglyConnectedComponents, kruskal, prim, bellmanFord, dijkstra } from './algorithm'

export function renderGraph(graph: Graph, svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {
    // State Variables
    let draggingEnabled = false;
    let addingNodesEnabled = false;
    let deletingEdgesEnabled = false;
    let deletingNodesEnabled = false;
    let addingEdgesEnabled = false;
    let sourceNode = null;
    let selectedEdge = null;

    // DOM Elements
    const algorithmSelect = document.getElementById('algorithm-select') as HTMLSelectElement;
    const sourceNodeContainer = document.getElementById('source-node-container');
    const sourceNodeSelect = document.getElementById('source-node-select') as HTMLSelectElement;
    const runButton = document.getElementById('run-algorithm') as HTMLButtonElement;
    const modal = document.getElementById("updateWeightModal") as HTMLDivElement;
    const closeModal = document.getElementById("closeModal") as HTMLSpanElement;
    const updateWeightButton = document.getElementById("updateWeightButton") as HTMLButtonElement;
    const cancelButton = document.getElementById("cancelButton") as HTMLButtonElement;
    const newWeightInput = document.getElementById("newWeightInput") as HTMLInputElement;
    const outputBox = document.getElementById("output-box") as HTMLDivElement;
    const addNodeButton = document.getElementById("add-node") as HTMLButtonElement;
    const addEdgeButton = document.getElementById("add-edge") as HTMLButtonElement;
    const dragNodeButton = document.getElementById("drag-tool") as HTMLButtonElement;
    const deleteNodeButton = document.getElementById("delete-node") as HTMLButtonElement;
    const deleteEdgeButton = document.getElementById("delete-edge") as HTMLButtonElement;
    const deleteGraphButton = document.getElementById("delete-graph") as HTMLButtonElement;
    const changeIsDirectedButton = document.getElementById("change-graph-is-directed") as HTMLButtonElement;
    const changeIsWeightedButton = document.getElementById("change-graph-is-weighted") as HTMLButtonElement;


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

    function updateArrowheadColor() {
        const marker = defs.select("#arrowhead");
    
        if (marker.empty()) {
            defs.append("marker")
                .attr("id", "arrowhead")
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 10)
                .attr("refY", 0)
                .attr("markerWidth", 5)
                .attr("markerHeight", 5)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M 0,-5 L 10,0 L 0,5")
                .attr("fill", deletingEdgesEnabled ? "red" : "black");
        } else {
            marker.select("path").attr("fill", deletingEdgesEnabled ? "red" : "black");
        }
    }
    
    function updateEdgePositions(edgesSVGElement) {
        if (graph.edges.length > 0) {
            edgesSVGElement
                .attr("stroke", d => d.isHighlighted ? "blue" : "black")
                .attr("stroke-width", d => d.isHighlighted ? 4 : 2)
                .attr("d", d => getEdgePathDefinition(d, graph))
                .attr("marker-end", d => graph.isDirected ? "url(#arrowhead)" : null); 
        }
    }

    function updateEdgeLabelsPositions(edgeLabelsSVGElement) {
        edgeLabelsSVGElement
            .attr("x", d => getEdgeLabelXCoordinate(d, graph))
            .attr("y", d => getEdgeLabelYCoordinate(d, graph))
    }
    
    function deleteAllNodesAndEdges() {
        graph.nodes = [];
        graph.edges = [];
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
                graph.addEdge(sourceNode, d.index, 0);
                if (graph.isWeighted){
                    selectedEdge = graph.edges.find(edge => edge.source === sourceNode && edge.target === d.index);
                    modal.style.display = "block";
                }
                sourceNode = null;
                redrawGraph();
            }
        } else {
            console.log(d);
        }
    }

    function handleEdgeClick(event, d) {
        if (deletingEdgesEnabled) {
            graph.deleteEdge(d.source, d.target);
            redrawGraph();
        } else {
            console.log("Click on edge " + "(" + d.source + ", " + d.target + ") w =" + d.w + " isHighlighted: " + d.isHighlighted);
        }
    }

    function handleEdgeLabelHover(d, i) {
        d3.select(this).attr("fill", "#ccc");
    }
    
    function handleEdgeLabelMouseOut(d, i) {
        d3.select(this).attr("fill", "black");
    }
    
    function handleEdgeLabelClick(event, d) {
        console.log("click on w(" + d.source + ", " + d.target + ") = " + d.w);
        selectedEdge = d;
        modal.style.display = "block";
    }
    
    closeModal.onclick = function() {
        modal.style.display = "none";
        newWeightInput.value = "";
    }
    
    cancelButton.onclick = function() {
        modal.style.display = "none";
        newWeightInput.value = "";
    }

    function handleClickUpdateWeightButton() {
        console.log("click on update");
        const newWeight = parseInt(newWeightInput.value);
        if (!isNaN(newWeight) && selectedEdge) {
            selectedEdge.w = newWeight;
            console.log("new w(" + selectedEdge.source + ", " + selectedEdge.target + ") = " + selectedEdge.w);
            redrawGraph();
            modal.style.display = "none";
            newWeightInput.value = "";
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
            .attr("stroke", d => d.isHighlighted ? "blue" : "black")
            .attr("stroke-width", d => d.isHighlighted ? 4 : 2)
            .attr("marker-end", d => graph.isDirected ? "url(#arrowhead)" : null); // Set marker-end for new edges
    
        const mergedEdges = newEdgePaths.merge(updatedEdges);
        updateEdgePositions(mergedEdges);
        updateArrowheadColor();
        mergedEdges.lower();
    
        const updatedEdgeLabels = svg.selectAll<SVGTextElement, Edge>(".edge-label").data(graph.edges);
        updatedEdgeLabels.exit().remove();
        const newEdgeLabels = updatedEdgeLabels.enter().append("text")
            .attr("class", "edge-label")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("id", d => `edge-label-${d.source}-${d.target}`)
            .text(d => d.w) // Default label text or format as needed
            .attr("fill", "black") // Set initial color
            .on("mouseover", handleEdgeLabelHover)
            .on("mouseout", handleEdgeLabelMouseOut)
            .on("click", handleEdgeLabelClick) // Add click event
            .style("visibility", graph.isWeighted ? "visible" : "hidden"); // Conditionally set visibility


    
        const mergedEdgeLabels = newEdgeLabels.merge(updatedEdgeLabels);
        updateEdgeLabelsPositions(mergedEdgeLabels);

        // Ensure the text of the edge labels is updated
        mergedEdgeLabels.text(d => d.w);
        mergedEdgeLabels.style("visibility", graph.isWeighted ? "visible" : "hidden"); // Conditionally set visibility

    
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
            .attr("r", 15)
            .attr("fill", d => d.color)  // Set the fill attribute based on the condition
    
        newNodeGroups
            .append("text")
            .attr("stroke", d => d.color === Color.BLACK ? "white" : "black")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(d => d.index);
        const mergedNodes = newNodeGroups.merge(updatedNodes);
        mergedNodes
            .attr("transform", d => `translate(${d.x}, ${d.y})`)
            .select("circle")
            .attr("fill", d => d.color);  // Update the fill attribute for existing nodes
        mergedNodes
            .select("text")
            .attr("stroke", d => d.color === Color.BLACK ? "white" : "black");
    
        mergedNodes
            .call(drag);
        addEventListenerToSelection<SVGGElement, Node>(mergedNodes, "click", handleNodeClick);
        addEventListenerToSelection<SVGPathElement, Edge>(mergedEdges, "click", handleEdgeClick);
        addEventListenerToSelection<SVGGElement, Edge>(edgeLabels, "click", handleEdgeLabelClick);
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
        addNodeButton.addEventListener("click", () => toggleAddNodeMode());
        addEdgeButton.addEventListener("click", () => toggleAddEdgeMode());
        dragNodeButton.addEventListener("click", () => toggleDragMode());
        deleteNodeButton.addEventListener("click", () => toggleDeleteNodeMode());
        deleteEdgeButton.addEventListener("click", () => toggleDeleteEdgeMode());
        deleteGraphButton.addEventListener("click", () => deleteAllNodesAndEdges());
        changeIsDirectedButton.addEventListener("click", () => changeIsDirected());
        runButton.addEventListener("click", () => runAlgorithm());
        algorithmSelect.addEventListener("change", () => handleAlgorithmChange());
        sourceNodeSelect.addEventListener("change", () => handleSourceNodeSelectChange());
        updateWeightButton.addEventListener("click", () => handleClickUpdateWeightButton());
        changeIsWeightedButton.addEventListener("click", () => changeIsWeighted());
    }

    function changeIsWeighted(){
        console.log("Called changeIsWeighted");
        if (graph.isWeighted){
            console.log("Change from weighted to unweighted");

            graph.isWeighted = false;
            changeIsWeightedButton.textContent = "Make Weighted"
        } else {
            console.log("Change from unweighted to weighted");
            graph.isWeighted = true;
            changeIsWeightedButton.textContent = "Make Unweighted"
        }
        redrawGraph();
    }

    function changeIsDirected() {
        console.log("Called changeIsDirected");
        if (graph.isDirected){
            console.log("Change from directed to undirected");
            graph.edges.forEach(e => {
                const source = e.source;
                const target = e.target;
                if (e.source === e.target) {
                    //  Delete Self-loops
                    graph.deleteEdge(source, target);
                }
                if (graph.edgeExists(target, source)){
                    // Delete repeated edges (eg 0,2 and 2,0)
                    graph.deleteEdge(source, target);
                }
            });
            graph.isDirected = false;
            changeIsDirectedButton.textContent = "Make Directed";
        } else {
            console.log("Change from undirected to directed");
            graph.isDirected = true;
            changeIsDirectedButton.textContent = "Make Undirected";
        }
        redrawGraph();
    }

    function handleSourceNodeSelectChange(){
        const selectedValue = sourceNodeSelect.value;
        console.log("Selected node:", selectedValue);

        // Enable the run button if a node is selected
        if (!selectedValue){
            sourceNodeSelect.value = '0';
        }
        runButton.disabled = false;
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

    async function runAlgorithm(){
        resetNodesState(graph);
        resetEdgeState(graph);
        outputBox.textContent = "";
        redrawGraph();
        const algorithmSelect = document.getElementById("algorithm-select") as HTMLSelectElement;
        const selectedAlgorithm = algorithmSelect.value;

        let algorithmFunction;
        switch (selectedAlgorithm) {
            case "print":
                algorithmFunction = printGraph;
                await algorithmFunction(graph);
                break;
            case "bfs":
                algorithmFunction = breadthFirstSearchAsync;
                await algorithmFunction(graph, parseInt(sourceNodeSelect.value, 10), redrawGraph);
                break;
            case "dfs":
                algorithmFunction = depthFirstSearch;
                await algorithmFunction(graph, redrawGraph);
                break;
            case "top-sort":
                algorithmFunction = topologicalSort;
                outputBox.textContent = await algorithmFunction(graph, redrawGraph);
                break;
            case "scc":
                algorithmFunction = stronglyConnectedComponents;
                algorithmFunction(graph, redrawGraph);
                break;
            case "kruskal":
                algorithmFunction = kruskal;
                await algorithmFunction(graph, redrawGraph);
                break;
            case "prim":
                algorithmFunction = prim;
                await prim(graph, graph.nodes[0], redrawGraph);
                break;
            case "bellman-ford":
                algorithmFunction = bellmanFord;
                if (await algorithmFunction(graph, parseInt(sourceNodeSelect.value, 10), redrawGraph)){
                    console.log("End of Bellman Ford. No negative weight cycles.");
                } else {
                    console.log("Negative weight cycles");
                }
                break;
            case "dijkstra":
                algorithmFunction = dijkstra;
                await algorithmFunction(graph, parseInt(sourceNodeSelect.value, 10), redrawGraph);
                break;
            default:
                return;
        }
        redrawGraph();
    }

    function handleAlgorithmChange(){
        if (algorithmSelect.value === 'bfs' || algorithmSelect.value === "bellman-ford" || algorithmSelect.value === "dijkstra") {
            sourceNodeContainer.style.display = 'block';
            populateSourceNodeSelector();
        } else {
            sourceNodeContainer.style.display = 'none';
            runButton.disabled = false; // Enable the run button for other algorithms
        }
    }

    // Function to populate the source node selector
    function populateSourceNodeSelector() {
        sourceNodeSelect.innerHTML = ''; // Clear existing options
        graph.nodes.forEach( node => {
            const option = document.createElement('option');
            option.value = node.index.toString();
            option.textContent = `Node ${node.index}`;
            sourceNodeSelect.appendChild(option);
        });
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
        .attr("fill", "black");

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
        .attr("stroke", d => d.isHighlighted ? "blue" : "black")
        .attr("stroke-width", d => d.isHighlighted ? 4 : 2)
        .attr("d", d => getEdgePathDefinition(d, graph))
        .attr("marker-end", d => graph.isDirected ? "url(#arrowhead)" : null); // Initial setup includes arrowhead for directed graphs

    // Define edge labels
    const edgeLabels = svg.selectAll(".edge-label")
        .data(graph.edges)
        .enter()
        .append("text")
        .attr("class", "edge-label")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("id", d => `edge-label-${d.source}-${d.target}`)
        .text(d => d.w) // Default label text or format as needed
        .on("mouseover", handleEdgeLabelHover)
        .on("mouseout", handleEdgeLabelMouseOut)
        .on("click", handleEdgeLabelClick) // Add click event
        .style("visibility", graph.isWeighted ? "visible" : "hidden"); // Conditionally set visibility


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
    addEventListenerToSelection<SVGGElement, Edge>(edgeLabels, "click", handleEdgeLabelClick);
    updateEdgePositions(edge);
    updateEdgeLabelsPositions(edgeLabels);
}