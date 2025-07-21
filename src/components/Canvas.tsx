import * as d3 from "d3";
import { Delaunay } from "d3";
import { useEffect, useRef, useMemo } from "react";
import perlin from "perlin-noise";

// center point finden und radidus berechnen
// 4 punkte gleichmäßig 0, 90, 180, 270 grad
// zwischen punkten bezier kurven zeichnen und randomly offsetten
// bezier kurven kreisförmig mit zufälligen ausschlägen
// mehr punkte für smoothness
// nur pixel innerhalb der bezier kurven erlaubt für landmasse
// bei 0 starten, 90 grad nach rechts = endpunkt für 1. und anfang für 2. bezier kurve
// dann halber winkel (90 / 2) = 45 grad = punkt zwischen 1. und 2. bezier kurve, random radius

// innerhalb der voronoi zellen (weiße bereiche) flüsse zeichnen

const OCEAN = "#4F42B5";
const PLAINS = "#90EE90";
const FOREST = "#228B22";
const MOUNTAINS = "#808080";

type Point = {
    x: number;
    y: number;
}

interface Props {
    seeds: Point[];
    width: number;
    height: number;
    vision: {
        showSeedPoints: boolean;
        showDelaunay: boolean;
        showVoronoiBefore: boolean;
        showCentroids: boolean;
        showVoronoiAfter: boolean;
        showNoisePattern: boolean;
        showPerlinElevations: boolean;
        showFullMap: boolean;
    }
}

export default function Canvas({ seeds, width, height, vision }: Props) {
    const ref = useRef<SVGSVGElement | null>(null);

    const { elevation, perlinWidth } = useMemo(() => {
        const perlinWidth = Math.ceil(width / 4);
        const perlinHeight = Math.ceil(height / 4);
        const elevation = perlin.generatePerlinNoise(
            perlinWidth,
            perlinHeight, 
            { octaveCount: 4, amplitude: 0.5, persistence: 0.5 }
        );
        return { elevation, perlinWidth };
    }, [width, height]);

    let basePoints: [number, number][] = seeds.map(c => [c.x, c.y]);
    let delaunaySeeds = Delaunay.from(basePoints);
    let voronoiSeeds = delaunaySeeds.voronoi([0, 0, width, height]);

    const centroids: { x: number; y: number }[] = [];
    for (let i = 0; i < seeds.length; i++) {
        const cell = voronoiSeeds.cellPolygon(i);
        if (cell) {
            const centroid = d3.polygonCentroid(cell);
            centroids.push({ x: centroid[0], y: centroid[1] });
        }
    }

    // Use centroids as new points for Voronoi
    basePoints = centroids.map(c => [c.x, c.y]) as [number, number][];
    let delaunayCentroids = Delaunay.from(basePoints);
    let voronoiCentroids = delaunayCentroids.voronoi([0, 0, width, height]);

    useEffect(() => {
        if (!ref.current) return;

        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        if (vision.showNoisePattern) {
            const noiseGroup = svg.append("g");
            const cellSize = 4; // Adjust for resolution/performance | larger = faster, lower resolution.
            
            // loop over canvas in steps of cellSize
            for (let y = 0; y < height; y += cellSize) {
                for (let x = 0; x < width; x += cellSize) {

                    // Find distance to the nearest seed point
                    // start with largest possible distance
                    let minDist = Infinity;

                    for (const p of centroids) {
                        // compute difference between x and y between cell and seed
                        const dx = x - p.x;
                        const dy = y - p.y;
                        // calculate euclidean distance
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist) minDist = dist;
                    }
                    // Map distance to grayscale (adjust scale as needed)
                    // max possible distance on canvas (corner to corner)
                    const maxDist = Math.sqrt(width * width + height * height);
                    // normalize minDist to [0,1], multiply by 255 for standard grayscale,
                    // then round down. = values above 255
                    const gray = Math.floor((minDist / (maxDist * 0.05)) * 255);
                    noiseGroup.append("rect")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", `rgb(${gray},${gray},${gray})`)
                        .attr("stroke", "none");
                }
            }
        }

        // make perlin elevations apply only to island area
        if (vision.showPerlinElevations) {
            const noiseGroup = svg.append("g");
            const cellSize = 4; // Adjust for resolution/performance
            for (let y = 0; y < height; y += cellSize) {
                for (let x = 0; x < width; x += cellSize) {
                    let minDist = Infinity;

                    for (let i = 0; i < seeds.length; i++) {
                        const p = seeds[i];
                        const dx = x - p.x;
                        const dy = y - p.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist) {
                            minDist = dist;
                        }
                    }

                    const nx = Math.floor(x / cellSize);
                    const ny = Math.floor(y / cellSize);
                    const elevationValue = elevation[ny * perlinWidth + nx]; // 0..1

                    let color;
                    if (elevationValue < 0.3) color = OCEAN; // ocean
                    else if (elevationValue < 0.4) color = PLAINS; // plains
                    else if (elevationValue < 0.6) color = FOREST; // forest
                    else color = MOUNTAINS; // mountains

                    noiseGroup.append("rect")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", color)
                        .attr("stroke", "none");
                }
            }
        }

        if (vision.showFullMap) {
            const mapGroup = svg.append("g");
            const centerX = width / 2;
            const centerY = height / 2;
            const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
            const islandRadius = 0.5; // 0..1

            for (let i = 0; i < seeds.length; i++) {
                const cell = voronoiCentroids.cellPolygon(i);
                if (!cell) continue;

                // Compute centroid of the cell
                const centroid = d3.polygonCentroid(cell);
                const dx = centroid[0] - centerX;
                const dy = centroid[1] - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

                // Perlin elevation at centroid
                const nx = Math.floor(centroid[0] / 4);
                const ny = Math.floor(centroid[1] / 4);
                let elevationValue = elevation[ny * perlinWidth + nx];

                // Mask: only allow land within island radius
                if (dist > islandRadius) {
                    elevationValue = 0; // ocean
                } else if (dist > islandRadius * 0.95) {
                    // Smooth edge
                    const t = (dist - islandRadius * 0.95) / (islandRadius * 0.05);
                    elevationValue = elevationValue * (1 - t);
                }

                let color;
                if (elevationValue < 0.3) color = OCEAN;
                else if (elevationValue < 0.4) color = PLAINS;
                else if (elevationValue < 0.6) color = FOREST;
                else color = MOUNTAINS;

                mapGroup.append("path")
                    .attr("d", "M" + cell.join("L") + "Z")
                    .attr("fill", color)
                    .attr("stroke", "#222")
                    .attr("stroke-width", 0.5);
            }
        }

        if (vision.showSeedPoints) {
            svg.append("g")
                .selectAll("circle.seed")
                .data(seeds)
                .join("circle")
                .attr("class", "seed")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 2)
                .attr("fill", "red")
                .attr("opacity", 0.5);
        }

        if (vision.showVoronoiBefore) {
            svg.append("g")
                .selectAll("path")
                .data(basePoints)
                .join("path")
                .attr("d", (_, i) => voronoiSeeds.renderCell(i))
                .attr("stroke", "#333")
                .attr("fill", "none");
        }

        if (vision.showCentroids) {
            svg.append("g")
                .selectAll("circle.centroid")
                .data(centroids)
                .join("circle")
                .attr("class", "centroid")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 2)
                .attr("fill", "yellow");
        }

        if (vision.showVoronoiAfter) {
            svg.append("g")
                .selectAll("path")
                .data(centroids)
                .join("path")
                .attr("d", (_, i) => voronoiCentroids.renderCell(i))
                .attr("stroke", "#333")
                .attr("fill", "none");
        }

        if (vision.showDelaunay) {
            const showCentroids = vision.showCentroids;
            const showSeeds = vision.showSeedPoints;

            if (showCentroids && showSeeds) {
                const delaunaySeeds = Delaunay.from(seeds.map(s => [s.x, s.y]) as [number, number][]);
                const delaunaySeedsGroup = svg.append("g");
                for (let triangle of delaunaySeeds.trianglePolygons()) {
                    delaunaySeedsGroup.append("path")
                        .attr("d", "M" + triangle.join("L") + "Z")
                        .attr("fill", "none")
                        .attr("stroke", "orange")
                        .attr("stroke-width", 1);
                }
                const delaunayCentroids = Delaunay.from(centroids.map(c => [c.x, c.y]) as [number, number][]);
                const delaunayCentroidsGroup = svg.append("g");
                for (let triangle of delaunayCentroids.trianglePolygons()) {
                    delaunayCentroidsGroup.append("path")
                        .attr("d", "M" + triangle.join("L") + "Z")
                        .attr("fill", "none")
                        .attr("stroke", "cyan")
                        .attr("stroke-width", 1);
                }
            } else {
                const showingCentroids = showCentroids && !showSeeds;
                const delaunay = showingCentroids
                    ? Delaunay.from(centroids.map(c => [c.x, c.y]) as [number, number][])
                    : Delaunay.from(seeds.map(s => [s.x, s.y]) as [number, number][]);

                const delaunayGroup = svg.append("g");
                for (let triangle of delaunay.trianglePolygons()) {
                    delaunayGroup.append("path")
                        .attr("d", "M" + triangle.join("L") + "Z")
                        .attr("fill", "none")
                        .attr("stroke", "orange")
                        .attr("stroke-width", 1);
                }
            }
        }

    }, [seeds, width, height, vision]);

    return <svg ref={ref} width={width} height={height} />
}