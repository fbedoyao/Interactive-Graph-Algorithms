import * as d3 from 'd3';
import { Graph, Node, Edge } from './graph';
import { deactivateAllButtonsExcept, enableAllButtons, addEventListenerToSelection, printNodeIndex } from './utils';


export function renderGraph(graph: Graph, svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {

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

    node.append("circle")
        .attr("r", 15);
    
    node.append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(d => d.index);
    
    const drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    node.call(drag);

    let draggingEnabled = false;
    let addingNodesEnabled = false;
    let deletingEdgesEnabled = false;
    let deletingNodesEnabled = false;
    let addingEdgesEnabled = false;
    let sourceNode = null;

    function getContainerBounds() {        
        return {
          minX: 20,
          minY: 20,
          maxX: 980,
          maxY: 483
        };
    }

    function dragstarted(event, d) {
        if (draggingEnabled) {
            d3.select(this).raise();
        }
    };
    
    function dragged(event, d) {
        if (draggingEnabled){
            // Get container boundaries
            const containerBounds = getContainerBounds();
        
            // Calculate new position of the dragged node
            const newX = d.x + event.dx;
            const newY = d.y + event.dy;
        
            // Check if the new position is within the container boundaries
            const constrainedX = Math.max(containerBounds.minX, Math.min(containerBounds.maxX, newX));
            const constrainedY = Math.max(containerBounds.minY, Math.min(containerBounds.maxY, newY));
        
            // Update the visual position of the node only if it stays within the boundaries
            d3.select(this)
                .attr("transform", `translate(${constrainedX}, ${constrainedY})`);
        
            // Update the position of the dragged node in the graph data structure
            d.x = constrainedX;
            d.y = constrainedY;
        
            // Update the positions of the connected edges
            redrawGraph();
            updateEdgePositions();

        }
    }
    
    function dragended(event, d) {
        if (draggingEnabled){
            console.log("Nodes after dragging:", graph.nodes);
        }
    }

    function updateEdgePositions() {
        if (graph.edges.length > 0){
            edge
                .attr("x1", d => {
                    const sourceNode = graph.nodes.find(node => node.index === d.source);
                    return sourceNode ? sourceNode.x : 0; // Return node's x if found, otherwise default to 0
                })
                .attr("y1", d => {
                    const sourceNode = graph.nodes.find(node => node.index === d.source);
                    return sourceNode ? sourceNode.y : 0; // Return node's y if found, otherwise default to 0
                })
                .attr("x2", d => {
                    const targetNode = graph.nodes.find(node => node.index === d.target);
                    return targetNode ? targetNode.x : 0; // Return node's x if found, otherwise default to 0
                })
                .attr("y2", d => {
                    const targetNode = graph.nodes.find(node => node.index === d.target);
                    return targetNode ? targetNode.y : 0; // Return node's y if found, otherwise default to 0
                });
        }
    }

    function deleteAllNodesAndEdges() {
        // Clear nodes and edges arrays
        graph.nodes = [];
        graph.edges = [];
    
        // Remove all visual elements from the SVG
        svg.selectAll("*").remove();
    }

    function redrawGraph() {

        // Update edge selection
        const updatedEdges = svg.selectAll<SVGLineElement, Edge>(".edge")
            .data(graph.edges);

        // Remove any edges that are no longer in the data
        updatedEdges.exit().remove();

        // Enter selection for new edges
        const newEdgeLines = updatedEdges.enter()
            .append("line")
            .classed("edge", true)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Merge new edges with existing edges
        const mergedEdges = newEdgeLines.merge(updatedEdges);

        // Update positions of existing edges
        mergedEdges
            .attr("x1", d => {
                const sourceNode = graph.nodes.find(node => node.index === d.source);
                return sourceNode ? sourceNode.x : 0; // Return node's x if found, otherwise default to 0
            })
            .attr("y1", d => {
                const sourceNode = graph.nodes.find(node => node.index === d.source);
                return sourceNode ? sourceNode.y : 0; // Return node's y if found, otherwise default to 0
            })
            .attr("x2", d => {
                const targetNode = graph.nodes.find(node => node.index === d.target);
                return targetNode ? targetNode.x : 0; // Return node's x if found, otherwise default to 0
            })
            .attr("y2", d => {
                const targetNode = graph.nodes.find(node => node.index === d.target);
                return targetNode ? targetNode.y : 0; // Return node's y if found, otherwise default to 0
            });
        // Update edge positions
        updateEdgePositions();

        // Update node selection
        const updatedNodes = svg.selectAll<SVGGElement, Node>(".node") // Specify the type of the data as Node
            .data(graph.nodes, d => d.index);
        
        // Remove any nodes that are no longer in the data
        updatedNodes.exit().remove();

        // Enter selection for new nodes
        const newNodeGroups = updatedNodes.enter()
            .append("g")
            .classed("node", true)
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
    
        // Append circle and text to new nodes
        newNodeGroups.append("circle")
            .attr("r", 15);
    
        newNodeGroups.append("text")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(d => d.index);
    
        // Merge new nodes with existing nodes
        const mergedNodes = newNodeGroups.merge(updatedNodes);
    
        // Update existing nodes
        mergedNodes.attr("transform", d => `translate(${d.x}, ${d.y})`);
    
        // Apply drag behavior to all nodes
        mergedNodes.call(drag);

        // Add event listeners
        addEventListenerToSelection<SVGGElement, Node>(mergedNodes, "click", (e, d) => {
            if (document.getElementById("delete-node").classList.contains("active")){
                // Delete logic here
                graph.deleteNode(d.index);
                redrawGraph();
                console.log(graph);
            } else if (addingEdgesEnabled) {
                if (sourceNode === null){
                    sourceNode = d.index;
                    redrawGraph();
                } else{
                    const targetNode = d.index;
                    graph.addEdge(sourceNode, targetNode);
                    sourceNode = null;
                    redrawGraph();
                }
            }
        })

        // Apply deletion-active class to newly added nodes if deletion mode is enabled
        if (deletingNodesEnabled) {
            mergedNodes.classed("deletion-active", true);
        } else {
            mergedNodes.classed("deletion-active", false);
        }
    }

    document.getElementById("add-node").addEventListener("click", () => {
        addingNodesEnabled = !addingNodesEnabled; // Toggle the flag
    
        const addButton = document.getElementById("add-node");
        if (addingNodesEnabled) {
            deactivateAllButtonsExcept("add-node");
            addButton.classList.add("active"); // Change button appearance
            // Enable adding nodes functionality
            svg.style('cursor', 'crosshair'); // Change cursor to crosshair
            svg.on("click", function(event) {
                if (addingNodesEnabled) { // Check if adding nodes is enabled
                    const [x, y] = d3.pointer(event, this); // Get the mouse coordinates relative to the SVG
                    graph.addNode(x, y); // Call the addNode function with the coordinates
                    redrawGraph(); // Redraw the graph to reflect the changes
                }
            });
        } else {
            enableAllButtons();
            addButton.classList.remove("active"); // Change button appearance
            svg.style('cursor', 'auto'); // Change cursor to crosshair
            svg.on("click", null); // Disable adding nodes functionality
        }
    });

    document.getElementById("add-edge").addEventListener("click", () => {
        addingEdgesEnabled = !addingEdgesEnabled;

        const addEdgeButton = document.getElementById("add-edge");
        if (addingEdgesEnabled){
            deactivateAllButtonsExcept("add-edge");
            addEdgeButton.classList.add("active");
        } else {
            enableAllButtons();
            addEdgeButton.classList.remove("active");
        }
    });

    document.getElementById("drag-tool").addEventListener("click", () => {
        draggingEnabled = !draggingEnabled;
        const dragToolButton = document.getElementById("drag-tool");
        if (draggingEnabled) {
            deactivateAllButtonsExcept("drag-tool");
            dragToolButton.classList.add("active");
            //node.style('cursor', 'move');
            svg.classed('dragging', true); // Apply class to SVG container
        } else {
            enableAllButtons();
            dragToolButton.classList.remove("active");
            //node.style('cursor', 'pointer')
            svg.classed('dragging', false); // Remove class from SVG container
        }
    });

    document.getElementById("delete-node").addEventListener("click", () => {
        deletingNodesEnabled = !deletingNodesEnabled;
        const deleteNodesButton = document.getElementById("delete-node");
        if (deletingNodesEnabled) {
            deactivateAllButtonsExcept("delete-node");
            deleteNodesButton.classList.add("active");
            node.classed("deletion-active", true);
            redrawGraph();
        } else{
            enableAllButtons();
            deleteNodesButton.classList.remove("active");
            node.classed("deletion-active", false);
            redrawGraph();
        }
    })

    addEventListenerToSelection<SVGGElement, Node>(node, "click", (e, d) => {
        if (document.getElementById("delete-node").classList.contains("active")){
            // Delete logic here
            graph.deleteNode(d.index);
            redrawGraph();
            console.log(graph);
        } else if (addingEdgesEnabled) {
            if (sourceNode === null){
                sourceNode = d.index;
            } else{
                const targetNode = d.index;
                graph.addEdge(sourceNode, targetNode);
                sourceNode = null;
                redrawGraph();
                console.log(graph);
            }
        }
    })

    document.getElementById("delete-edge").addEventListener("click", () => {
        deletingEdgesEnabled = !deletingEdgesEnabled;
        const deleteEdgesButton = document.getElementById("delete-edge");
        if (deletingEdgesEnabled) {
            deactivateAllButtonsExcept("delete-edge");
            deleteEdgesButton.classList.add("active");
            edge.classed("deletion-active", true);
            redrawGraph();
        } else{
            enableAllButtons();
            deleteEdgesButton.classList.remove("active");
            edge.classed("deletion-active", false);
            redrawGraph(); // Redraw the graph to update edge visibility
        }
    })

    // Add event listener to edges for deletion
    addEventListenerToSelection<SVGGElement, Edge>(edge, "click", (event, d) => {
        if (document.getElementById("delete-edge").classList.contains("active")) {
            console.log("clicking on edge: " + d.source + ", " + d.target);
            graph.deleteEdge(d.source, d.target);
            redrawGraph();
        }
    });


    document.getElementById("delete-graph").addEventListener("click", () => {
        deleteAllNodesAndEdges();
    });

    updateEdgePositions()
}