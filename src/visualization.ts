import * as d3 from "d3";
import { Graph } from "./graph";

export function visualizeGraph(container: HTMLElement, graph: Graph) {
    const adjacencyList = graph.getAdjacencyList();

    // Create SVG
    const svg = d3.select(container).append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    // Draw nodes
    const nodes = Array.from(adjacencyList.keys());
    const nodePositions = calculateNodePositions(nodes.length);
    const nodeElements = svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d, i) => `translate(${nodePositions[i].x}, ${nodePositions[i].y})`)
        .call(d3.drag() // Enable drag behavior
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded)
        );

    // Draw circles for nodes
    nodeElements.append("circle")
        .attr("r", 20)
        .style("fill", "steelblue");

    // Add labels to nodes
    nodeElements.append("text")
        .text(d => d)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "12px");

    // Draw edges
    const edgeElements = svg.append("g").selectAll(".edge")
        .data(getEdges(adjacencyList))
        .enter()
        .append("line")
        .attr("class", "edge")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("x1", d => nodePositions[nodes.indexOf(d.source)].x)
        .attr("y1", d => nodePositions[nodes.indexOf(d.source)].y)
        .attr("x2", d => nodePositions[nodes.indexOf(d.target)].x)
        .attr("y2", d => nodePositions[nodes.indexOf(d.target)].y);

    function calculateNodePositions(numNodes: number) {
        const nodePositions = [];
        const radius = 100; // Adjust the radius to control the size of the graph
        const centerX = 250; // Adjust the center X coordinate
        const centerY = 150; // Adjust the center Y coordinate
        const angleIncrement = (2 * Math.PI) / numNodes;
        for (let i = 0; i < numNodes; i++) {
            const angle = i * angleIncrement;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            nodePositions.push({ x, y });
        }
        return nodePositions;
    }

    function getEdges(adjacencyList: Map<string, string[]>) {
        const edges = [];
        adjacencyList.forEach((neighbors, source) => {
            neighbors.forEach(target => {
                edges.push({ source, target });
            });
        });
        return edges;
    }

    function dragStarted(event, d) {
        d3.select(this).raise().classed("active", true);
    }

    function dragged(event, d) {
        d3.select(this).attr("transform", `translate(${event.x},${event.y})`);

        // Update edge positions
        edgeElements
            .attr("x1", d => nodePositions[nodes.indexOf(d.source)].x)
            .attr("y1", d => nodePositions[nodes.indexOf(d.source)].y)
            .attr("x2", d => nodePositions[nodes.indexOf(d.target)].x)
            .attr("y2", d => nodePositions[nodes.indexOf(d.target)].y);
    }

    function dragEnded(event, d) {
        d3.select(this).classed("active", false);
    }
}
