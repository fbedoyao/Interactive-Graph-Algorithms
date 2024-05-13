import * as d3 from 'd3';
import { Graph, Node, Edge } from './graph';
import { deactivateAllButtonsExcept, enableAllButtons } from './utils';


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
                .attr("x1", d => graph.nodes[d.source].x)
                .attr("y1", d => graph.nodes[d.source].y)
                .attr("x2", d => graph.nodes[d.target].x)
                .attr("y2", d => graph.nodes[d.target].y);
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
        // Update node selection
        const updatedNodes = svg.selectAll<SVGGElement, Node>(".node") // Specify the type of the data as Node
            .data(graph.nodes, d => d.index);
    
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
    
        // Update edge positions
        updateEdgePositions();
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


    document.getElementById("delete-graph").addEventListener("click", () => {
        deleteAllNodesAndEdges();
    });
    

    // Initially draws the edges
    updateEdgePositions()
}