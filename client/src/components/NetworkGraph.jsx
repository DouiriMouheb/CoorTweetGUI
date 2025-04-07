import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const NetworkGraph = ({ networkData }) => {
  console.log("Network data received in NetworkGraph:", networkData);

  const svgRef = useRef(null);

  useEffect(() => {
    if (!networkData || !networkData.data) return;

    const data = networkData.data;
    console.log(data, "eeeeehi");

    // Generate a color scale based on the number of communities
    const generateColorScale = (communities) => {
      // Get unique community IDs
      const uniqueCommunities = [
        ...new Set(communities.map((node) => node.community)),
      ];

      // Create a color scale that will generate colors based on the community ID
      const colorScale = d3
        .scaleOrdinal()
        .domain(uniqueCommunities)
        .range(d3.schemeCategory10); // Use d3's built-in color scheme

      // If we have more communities than colors in the scheme, extend with more vibrant colors
      if (uniqueCommunities.length > 10) {
        // Generate additional colors using HSL for better distinguishability
        const extraColors = [];
        for (let i = 0; i < uniqueCommunities.length - 10; i++) {
          // Distribute hues evenly around the color wheel
          const hue = (i * 137.5) % 360; // Golden angle approximation for better distribution
          extraColors.push(d3.hsl(hue, 0.75, 0.65).toString());
        }
        colorScale.range([...d3.schemeCategory10, ...extraColors]);
      }

      // Create a mapping of community ID to color
      const communityColorMap = {};
      uniqueCommunities.forEach((community) => {
        communityColorMap[community] = colorScale(community);
      });

      return communityColorMap;
    };

    // Clear previous SVG content
    if (!svgRef.current) return;
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 600;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%");

    // Create nodes objects from vertices
    const nodes = data.vertices.map((vertex) => ({
      id: vertex.name,
      name: vertex.name.split(" ")[0], // First part of name for display
      fullName: vertex.name,
      community: vertex.community,
      radius: 8,
    }));

    // Generate dynamic color map based on communities in the data
    const communityColors = generateColorScale(nodes);

    // Create links array from edges
    const links = data.edges.map((edge) => ({
      source: nodes.find((n) => n.id === edge.from),
      target: nodes.find((n) => n.id === edge.to),
      weight: edge.weight,
    }));

    // Group nodes by community
    const communities = {};
    nodes.forEach((node) => {
      if (!communities[node.community]) {
        communities[node.community] = [];
      }
      communities[node.community].push(node);
    });

    // Create container for graph with zoom capability
    const container = svg.append("g");

    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.1, 8])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        })
    );

    // Add community hulls
    const hullsGroup = container.append("g").attr("class", "hulls");

    // Function to draw hulls around communities
    const drawHulls = () => {
      // Remove existing hulls
      hullsGroup.selectAll("path").remove();

      // Draw hull for each community
      Object.entries(communities).forEach(([communityId, communityNodes]) => {
        if (communityNodes.length < 3) return; // Need at least 3 points for a hull

        // Calculate hull points
        const hullPoints = [];
        communityNodes.forEach((node) => {
          // Add points around each node to create a smoother hull
          const padding = 20;
          const angles = [0, 72, 144, 216, 288]; // 5 points around each node
          angles.forEach((angle) => {
            const rad = (angle * Math.PI) / 180;
            hullPoints.push([
              node.x + (node.radius + padding) * Math.cos(rad),
              node.y + (node.radius + padding) * Math.sin(rad),
            ]);
          });
        });

        // Create hull path
        const hull = d3.polygonHull(hullPoints);
        if (hull) {
          // Draw the hull
          hullsGroup
            .append("path")
            .attr("d", `M${hull.join("L")}Z`)
            .attr("fill", communityColors[communityId] || "#999")
            .attr("fill-opacity", 0.1)
            .attr("stroke", communityColors[communityId] || "#999")
            .attr("stroke-opacity", 0.3)
            .attr("stroke-width", 1);
        }
      });
    };

    // Create links
    const link = container
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#ccc")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.weight));

    // Create nodes
    const node = container
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => communityColors[d.community] || "#999")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);

        // Create tooltip
        const tooltip = container
          .append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${d.x + 15},${d.y + 15})`);

        tooltip
          .append("rect")
          .attr("width", d.fullName.length * 7)
          .attr("height", 20)
          .attr("rx", 3)
          .attr("fill", "white")
          .attr("stroke", "#ccc");

        tooltip
          .append("text")
          .attr("x", 5)
          .attr("y", 14)
          .text(d.fullName)
          .attr("font-size", "12px");

        d.tooltip = tooltip;
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", null);

        if (d.tooltip) {
          d.tooltip.remove();
          d.tooltip = null;
        }
      })
      .call(drag());

    // Add labels for nodes
    const label = container
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("font-size", "8px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text((d) => d.name);

    // Define drag behavior
    function drag() {
      return d3
        .drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }

    // Create a separate force simulation for each community
    const communityCenters = {};
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    // Calculate positions for community centers in a circle
    Object.keys(communities).forEach((communityId, index, array) => {
      const angle = (index / array.length) * 2 * Math.PI;
      communityCenters[communityId] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(70)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("x", d3.forceX().strength(0.05))
      .force("y", d3.forceY().strength(0.05))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("community", (alphaDecay) => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const center = communityCenters[node.community] || {
            x: width / 2,
            y: height / 2,
          };

          // Apply force toward community center
          const strength = 0.1 * alphaDecay;
          node.vx = (node.vx || 0) + (center.x - node.x) * strength;
          node.vy = (node.vy || 0) + (center.y - node.y) * strength;
        }
      });

    // Update position on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      label.attr("x", (d) => d.x).attr("y", (d) => d.y);

      // Update hulls
      drawHulls();
    });

    return () => {
      simulation.stop();
    };
  }, [networkData]);

  return (
    <div className="w-full h-full flex p-2 flex-col justify-center items-center">
      <div
        className="p-2 flex-grow shadow"
        style={{ height: "300px", width: "400px" }}
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      <div className="mt-4 text-sm text-left">
        <p>
          This visualization shows connections between users grouped by
          communities.
        </p>
        <p>• Nodes represent users, colored by their community</p>
        <p>
          • Edges represent connections, with thickness indicating relationship
          strength
        </p>
        <p>
          • Communities are encircled with a light boundary of the same color
        </p>
        <p>
          • You can zoom with the mouse wheel and pan by dragging the background
        </p>
      </div>
    </div>
  );
};

export default NetworkGraph;
