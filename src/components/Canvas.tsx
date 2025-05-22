import * as d3 from "d3";
import { Delaunay } from "d3";
import { useEffect, useRef } from "react";

type Point = {
    x: number;
    y: number;
    terrain: "plains" | "forest" | "mountains" | "ocean" | "city";
}

const terrainColors: Record<Point["terrain"], string> = {
    mountains: "#808080",
    ocean: "#4F42B5",
    forest: "#228B22",
    plains: "#90EE90",
    city: "#FF6347",
}

interface Props {
    points: Point[];
    width: number;
    height: number;
}

export default function Canvas({ points, width, height }: Props) {
    const ref = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        const svg = d3.select(ref.current);
        svg.selectAll("*").remove(); // Clear previous content

        const delaunay = Delaunay.from(points.map(p => [p.x, p.y]));
        const voronoi = delaunay.voronoi([0, 0, width, height]);

        svg.append("g").selectAll("path").data(points).join("path").attr("d", (_, i) => voronoi.renderCell(i)).attr("stroke", "#333").attr("fill", d => terrainColors[d.terrain]);

        svg.append("g").selectAll("circle").data(points).join("circle").attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 2).attr("fill", "black");
    }, [points]);

    return <svg ref={ref} width={width} height={height} />
}