const graph = {
    nodes: [
      {
        index: 0,
        x: 450,
        y: 365
      },
      {
        index: 1,
        x: 455,
        y: 86
      },
      {
        index: 2,
        x: 254,
        y: 222
      },
      {
        index: 3,
        x: 695,
        y: 330
      },
      {
        index: 4,
        x: 619,
        y: 135
      },
      {
        index: 5,
        x: 284,
        y: 423,
      }
    ],
    edges: [
        { source: 0, target: 1},
        { source: 1, target: 2},
        { source: 2, target: 0},
        { source: 3, target: 1},
        { source: 0, target: 4},
        { source: 5, target: 2},
    ]
  };
  
const width = 1000;
const height = Math.min(500, width * 0.6);

const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

const edges = svg
  .selectAll(".edge")
  .data(graph.edges)
  .enter()
  .append("line")
  .classed("edge", true)
  .attr("stroke", "black")
  .attr("stroke-width", 2)

const node = svg
    .selectAll(".node")
    .data(graph.nodes)
    .enter()
    .append("g")
    .classed("node", true)
    .attr("transform", d => `translate(${d.x}, ${d.y})`); // Initial position of the group

node.append("circle")
    .attr("r", 15);

node.append("text")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .text(d => d.index);

let draggingEnabled = false;

const drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

node.call(drag);

function updateEdgePositions() {
    edges
        .attr("x1", d => graph.nodes[d.source].x)
        .attr("y1", d => graph.nodes[d.source].y)
        .attr("x2", d => graph.nodes[d.target].x)
        .attr("y2", d => graph.nodes[d.target].y);
}

function getContainerBounds() {
    const container = document.getElementById("graph-container");
    const containerRect = container.getBoundingClientRect();
    
    return {
      minX: 20,
      minY: 20,
      maxX: 980,
      maxY: 483
    };
    

    /*
    const minX = containerRect.left;
    const minY = containerRect.top;
    const maxX = containerRect.right;
    const maxY = containerRect.bottom;
    return { minX, minY, maxX, maxY };
    */
  }

function dragstarted(event, d) {
    if (draggingEnabled) {
        d3.select(this).raise();
    }
}

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
    console.log("Nodes after dragging:", graph.nodes);
}

document.getElementById("drag-tool").addEventListener("click", () => {
    draggingEnabled = !draggingEnabled;
    const dragToolButton = document.getElementById("drag-tool");
    if (draggingEnabled) {
        dragToolButton.classList.add("active");
        node.style('cursor', 'move');
    } else {
        dragToolButton.classList.remove("active");
        node.style('cursor', 'pointer')
    }
});

// Initially draws the edges
updateEdgePositions()

console.log(getContainerBounds())

document.getElementById("graph-container").appendChild(svg.node());
