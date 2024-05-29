import * as d3 from 'd3';
import { Graph, Node, Edge, Color } from './graph';
import { deactivateAllButtonsExcept, enableAllButtons, addEventListenerToSelection, resetNodesState } from './utils';
import { breadthFirstSearch, breadthFirstSearchAsync, printGraph } from './algorithm'

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
                        
                        if(graph.edgeExists(d.target, d.source)){
                            return curvedPath(d);
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
                    }
                } else {
                    // Handle case where sourceNode or targetNode is undefined
                    return null; // or handle appropriately based on your application logic
                }
            })
            .attr("marker-end", d => graph.isDirected ? "url(#arrowhead)" : null); 
        }
    }

    // Update edge label positions
    function updateEdgeLabelsPositions(edgeLabelsSVGElement) {
        edgeLabelsSVGElement.attr("x", function(d) {
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
                        const midPoint = getMidPointOnQuadraticBezier(startPoint, controlPoint, endPoint);
                        return midPoint.x;
                    } else {
                        if(graph.edgeExists(d.target, d.source)){
                            // Two edges connecting two nodes
                            const controlPoint = getQuadraticControlPoint(sourceNode, targetNode);
                            const midPoint = getMidPointOnQuadraticBezier({x: sourceNode.x, y: sourceNode.y}, controlPoint, {x: targetNode.x, y: targetNode.y});
                            const outwardOffset = getOutwardOffset(sourceNode, targetNode, controlPoint, -15);
                            return midPoint.x + outwardOffset.x;
                        } else {
                            // Straight line
                            const dx = targetNode.x - sourceNode.x;
                            const dy = targetNode.y - sourceNode.y;
                            const midX = (sourceNode.x + targetNode.x) / 2;
                            const midY = (sourceNode.y + targetNode.y) / 2;
                            return midX - (dy / Math.sqrt(dx * dx + dy * dy)) * 20;
                        }
                    }
                }
            })
            .attr("y", function(d) {
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
                        const midPoint = getMidPointOnQuadraticBezier(startPoint, controlPoint, endPoint);
                        return midPoint.y -10;
                    } else {
                        if(graph.edgeExists(d.target, d.source)){
                            // Two edges connecting two nodes
                            const controlPoint = getQuadraticControlPoint(sourceNode, targetNode);
                            const midPoint = getMidPointOnQuadraticBezier({x: sourceNode.x, y: sourceNode.y}, controlPoint, {x: targetNode.x, y: targetNode.y});
                            const outwardOffset = getOutwardOffset(sourceNode, targetNode, controlPoint, -15);
                            return midPoint.y + outwardOffset.y;
                        } else {
                            // Straight line
                            const dx = targetNode.x - sourceNode.x;
                            const dy = targetNode.y - sourceNode.y;
                            const midX = (sourceNode.x + targetNode.x) / 2;
                            const midY = (sourceNode.y + targetNode.y) / 2;
                            return midY + (dx / Math.sqrt(dx * dx + dy * dy)) * 20;
                        }
                    }
                }
            });
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
                graph.addEdge(sourceNode, d.index, 0);
                selectedEdge = graph.edges.find(edge => edge.source === sourceNode && edge.target === d.index);
                sourceNode = null;
                redrawGraph();
                console.log(graph);
                modal.style.display = "block";
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
            console.log("Click on edge " + "(" + d.source + ", " + d.target + ") w =" + d.w);
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
            .attr("stroke", "black")
            .attr("stroke-width", 2)
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
        document.getElementById("add-node").addEventListener("click", () => toggleAddNodeMode());
        document.getElementById("add-edge").addEventListener("click", () => toggleAddEdgeMode());
        document.getElementById("drag-tool").addEventListener("click", () => toggleDragMode());
        document.getElementById("delete-node").addEventListener("click", () => toggleDeleteNodeMode());
        document.getElementById("delete-edge").addEventListener("click", () => toggleDeleteEdgeMode());
        document.getElementById("delete-graph").addEventListener("click", () => deleteAllNodesAndEdges());
        document.getElementById("change-graph-type").addEventListener("click", () => changeGraphType());
        document.getElementById("run-algorithm").addEventListener("click", () => runAlgorithm());
        algorithmSelect.addEventListener("change", () => handleAlgorithmChange());
        sourceNodeSelect.addEventListener("change", () => handleSourceNodeSelectChange());
        updateWeightButton.addEventListener("click", () => handleClickUpdateWeightButton());
        document.getElementById("change-graph-is-weighted").addEventListener("click", () => changeGraphIsWeighted());
    }

    // Function to calculate midpoint of a quadratic Bézier curve
    function getMidPointOnQuadraticBezier(startPoint, controlPoint, endPoint) {
        const t = 0.5;
        const x = Math.pow(1 - t, 2) * startPoint.x + 2 * (1 - t) * t * controlPoint.x + Math.pow(t, 2) * endPoint.x;
        const y = Math.pow(1 - t, 2) * startPoint.y + 2 * (1 - t) * t * controlPoint.y + Math.pow(t, 2) * endPoint.y;
        return { x, y };
    }

    // Function to calculate control point for quadratic Bézier curve
    function getQuadraticControlPoint(sourceNode, targetNode) {
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
    function getOutwardOffset(sourceNode, targetNode, controlPoint, offset) {
        const midPoint = getMidPointOnQuadraticBezier(sourceNode, controlPoint, targetNode);
        const dx = midPoint.x - controlPoint.x;
        const dy = midPoint.y - controlPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        return {
            x: (dx / length) * offset,
            y: (dy / length) * offset
        };
    }

    function changeGraphIsWeighted(){
        console.log("Called changeGraphIsWeighted");
        const changeGraphIsWeightedButton = document.getElementById("change-graph-is-weighted");
        if (graph.isWeighted){
            console.log("Change from weighted to unweighted");

            graph.isWeighted = false;
            changeGraphIsWeightedButton.textContent = "Make Weighted"
        } else {
            console.log("Change from unweighted to weighted");
            graph.isWeighted = true;
            changeGraphIsWeightedButton.textContent = "Make Unweighted"
        }
        redrawGraph();
    }

    function changeGraphType() {
        console.log("Called changeGraphType");
        const changeGraphTypeButton = document.getElementById("change-graph-type");
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
            changeGraphTypeButton.textContent = "Make Directed";
        } else {
            console.log("Change from undirected to directed");
            graph.isDirected = true;
            changeGraphTypeButton.textContent = "Make Undirected";
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

    function runAlgorithm(){
        resetNodesState(graph);
        redrawGraph();
        const algorithmSelect = document.getElementById("algorithm-select") as HTMLSelectElement;
        const selectedAlgorithm = algorithmSelect.value;

        let algorithmFunction;
        switch (selectedAlgorithm) {
            case "print":
                algorithmFunction = printGraph;
                algorithmFunction(graph);
                break;
            case "bfs":
                algorithmFunction = breadthFirstSearchAsync;
                algorithmFunction(graph, parseInt(sourceNodeSelect.value, 10), redrawGraph);
                break;
            // Add cases for other algorithms as needed
            default:
                return;
        }

        // Perform algorithm on current graph state
        // algorithmFunction(graph, svg);

        // Redraw the graph to reflect algorithm changes
        redrawGraph();
    }

    function handleAlgorithmChange(){
        if (algorithmSelect.value === 'bfs') {
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

    // Function to calculate path with curvature
    function curvedPath(d) {
        const source = graph.getNodeByIndex(d.source);
        const target = graph.getNodeByIndex(d.target);
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        /*
        const curvature = 0.2; // Adjust curvature here
        const offsetX = dy * curvature;
        const offsetY = -dx * curvature;
        return `M${source.x},${source.y} Q${(source.x + target.x) / 2 + offsetX},${(source.y + target.y) / 2 + offsetY} ${target.x},${target.y}`;
        */
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
                if(graph.edgeExists(d.target, d.source)){
                    return curvedPath(d);
                }
                return `M ${sourceNode.x},${sourceNode.y} L ${targetNode.x*0.8},${targetNode.y*0.8}`;
            }
        })
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
