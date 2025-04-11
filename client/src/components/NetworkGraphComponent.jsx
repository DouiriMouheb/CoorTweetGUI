import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Maximize2, Minimize2 } from "lucide-react";

const NetworkGraphComponent = ({ networkData }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (!networkData || !networkData.data || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const data = networkData.data;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const colorScale = d3
      .scaleOrdinal()
      .domain([...new Set(data.vertices.map((d) => d.community))])
      .range(d3.schemeCategory10);

    const nodes = data.vertices.map((v) => ({
      id: v.name,
      name: v.name.split(" ")[0],
      fullName: v.name,
      community: v.community,
      radius: 8,
    }));

    const links = data.edges.map((e) => ({
      source: nodes.find((n) => n.id === e.from),
      target: nodes.find((n) => n.id === e.to),
      weight: e.weight,
    }));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(70)
      )
      .force("charge", d3.forceManyBody().strength(-250))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const zoomGroup = svg.attr("viewBox", [0, 0, width, height]).call(
      d3
        .zoom()
        .scaleExtent([0.1, 50]) // 👈 more flexible zoom range
        .on("zoom", (e) => {
          container.attr("transform", e.transform);
        })
    );

    const container = svg.append("g");

    const link = container
      .append("g")
      .attr("stroke", "#ccc")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.weight));

    const node = container
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => colorScale(d.community))
      .call(
        d3
          .drag()
          .on("start", (e, d) => {
            if (!e.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (e, d) => {
            d.fx = e.x;
            d.fy = e.y;
          })
          .on("end", (e, d) => {
            if (!e.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("mouseover", function (e, d) {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", null);
      });

    const labels = container
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "10px")
      .attr("fill", "#444")
      .text((d) => d.name);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    return () => simulation.stop();
  }, [networkData]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <button
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 z-10 bg-white shadow px-2 py-1 rounded-full hover:bg-gray-100 transition"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 p-3 rounded-lg text-sm shadow backdrop-blur">
        <p className="font-semibold mb-1 text-gray-800">Graph Overview</p>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>Nodes = users, colored by community</li>
          <li>Edges = connections, thickness = strength</li>
          <li>Zoom with mouse, drag to pan</li>
        </ul>
      </div>
    </div>
  );
};

export default NetworkGraphComponent;
