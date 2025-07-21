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

    const { elevation, perlinWidth, coastlineNoise, detailNoise } = useMemo(() => {
        const perlinWidth = Math.ceil(width / 4);
        const perlinHeight = Math.ceil(height / 4);
        
        // Main elevation noise
        const elevation = perlin.generatePerlinNoise(
            perlinWidth,
            perlinHeight, 
            { octaveCount: 4, amplitude: 0.5, persistence: 0.5 }
        );
        
        // Coastline variation noise (for irregular island shape)
        const coastlineNoise = perlin.generatePerlinNoise(
            32, 32, 
            { octaveCount: 3, amplitude: 0.3, persistence: 0.6 }
        );
        
        // Detail variation noise (for terrain texture)
        const detailNoise = perlin.generatePerlinNoise(
            Math.ceil(width / 2), 
            Math.ceil(height / 2), 
            { octaveCount: 6, amplitude: 0.2, persistence: 0.4 }
        );
        
        return { elevation, perlinWidth, coastlineNoise, detailNoise };
    }, [width, height, seeds]);

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

        if (vision.showPerlinElevations) {
            const noiseGroup = svg.append("g");
            const cellSize = 4; // Adjust for resolution/performance
            for (let y = 0; y < height; y += cellSize) {
                for (let x = 0; x < width; x += cellSize) {
                    const nx = Math.floor(x / cellSize);
                    const ny = Math.floor(y / cellSize);
                    const elevationValue = elevation[ny * perlinWidth + nx]; // 0..1

                    // Convert elevation value to grayscale (0-255)
                    const gray = Math.floor(elevationValue * 255);

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

        if (vision.showFullMap) {
            const mapGroup = svg.append("g");
            const centerX = width / 2;
            const centerY = height / 2;
            const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
            const baseIslandRadius = 0.5; // Base island size (0..1)

            for (let i = 0; i < seeds.length; i++) {
                const cell = voronoiCentroids.cellPolygon(i);
                if (!cell) continue;

                // Compute centroid of the cell
                const centroid = d3.polygonCentroid(cell);
                const dx = centroid[0] - centerX;
                const dy = centroid[1] - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

                // Create dramatic island shape variations using multiple noise layers
                const angle = Math.atan2(dy, dx);
                
                // Sample different noise layers for shape variation
                const shapeX = (Math.cos(angle) * 0.5 + 1) * 0.5;
                const shapeY = (Math.sin(angle) * 0.5 + 1) * 0.5;
                const shapeIndex = Math.floor(shapeY * 31) * 32 + Math.floor(shapeX * 31);
                const shapeVariation = coastlineNoise[shapeIndex] || 0;
                
                // Create major shape modifications based on angle
                let radiusMultiplier = 1.0;
                
                // Elongation effect: stretch island in certain directions
                const elongationAngle = shapeVariation * Math.PI * 2; // Use noise to determine elongation direction
                const currentAngleAlignment = Math.cos(angle - elongationAngle);
                const elongationFactor = 0.3 + shapeVariation * 0.7; // 0.3 to 1.0
                radiusMultiplier *= (1 + currentAngleAlignment * elongationFactor);
                
                // Atoll effect: create inner hole based on distance and noise
                const atollStrength = (shapeVariation - 0.3) * 2; // -0.6 to 1.4, but we'll clamp it
                if (atollStrength > 0 && dist < 0.3) {
                    // Create inner water area for atoll-like shapes
                    const innerHoleRadius = 0.15 * Math.min(1, atollStrength);
                    if (dist < innerHoleRadius) {
                        radiusMultiplier = 0; // Force water in center
                    } else if (dist < innerHoleRadius * 1.5) {
                        // Smooth transition for atoll edge
                        const t = (dist - innerHoleRadius) / (innerHoleRadius * 0.5);
                        radiusMultiplier *= t;
                    }
                }
                
                // Asymmetric bulging: different noise for different quadrants
                const quadrantNoise = Math.sin(angle * 3 + shapeVariation * 10) * 0.3; // Creates 3-lobed shapes
                radiusMultiplier *= (1 + quadrantNoise);
                
                // Fine coastline detail (original jagged coastline effect)
                const coastDetailX = (Math.cos(angle) * 0.2 + 1) * 0.5;
                const coastDetailY = (Math.sin(angle) * 0.2 + 1) * 0.5;
                const coastDetailIndex = Math.floor(coastDetailY * 31) * 32 + Math.floor(coastDetailX * 31);
                const coastlineDetail = coastlineNoise[coastDetailIndex] || 0;
                const coastDetailVariation = (coastlineDetail - 0.5) * 0.1; // Small scale variation
                
                // Combine all shape modifications
                const irregularRadius = baseIslandRadius * radiusMultiplier + coastDetailVariation;

                // Base elevation from pre-generated Perlin noise
                const nx = Math.floor(centroid[0] / 4);
                const ny = Math.floor(centroid[1] / 4);
                let baseElevation = elevation[ny * perlinWidth + nx];

                // Mask: only allow land within irregular island radius
                if (dist > irregularRadius) {
                    baseElevation = 0; // ocean
                } else if (dist > irregularRadius * 0.9) {
                    // Smooth edge transition
                    const t = (dist - irregularRadius * 0.9) / (irregularRadius * 0.1);
                    baseElevation = baseElevation * (1 - t);
                }

                // Determine base terrain type
                let terrainType: 'ocean' | 'plains' | 'forest' | 'mountains';
                if (baseElevation < 0.3) terrainType = 'ocean';
                else if (baseElevation < 0.5) terrainType = 'plains';
                else if (baseElevation < 0.7) terrainType = 'forest';
                else terrainType = 'mountains';

                // Get detailed elevation variation from pre-generated detail noise
                const detailX = Math.floor(centroid[0] / 2);
                const detailY = Math.floor(centroid[1] / 2);
                const detailIndex = detailY * Math.ceil(width / 2) + detailX;
                const detailVariation = detailNoise[detailIndex] || 0;

                // Calculate final color based on terrain type + detail variation
                let color;
                if (terrainType === 'ocean') {
                    // Ocean: lighter blue for shallow, deeper blue for deep areas
                    // Keep it distinctly blue and not too dark
                    const depthVariation = 0.4 + detailVariation * 0.4; // 0.4 to 0.8 (prevents too dark)
                    const red = Math.floor(79 * depthVariation);   // Keep red component lower
                    const green = Math.floor(66 * (depthVariation + 0.3)); // Slightly more green
                    const blue = Math.floor(181 * (depthVariation + 0.2)); // Keep blue prominent
                    color = `rgb(${red}, ${green}, ${blue})`;
                } else if (terrainType === 'plains') {
                    // Plains: vary green intensity
                    const greenVariation = 0.8 + detailVariation * 0.4; // 0.8 to 1.2 multiplier
                    const green = Math.min(255, Math.floor(238 * greenVariation)); // Base from #90EE90
                    color = `rgb(144, ${green}, 144)`;
                } else if (terrainType === 'forest') {
                    // Forest: vary darkness of green
                    const forestVariation = 0.7 + detailVariation * 0.6; // 0.7 to 1.3 multiplier
                    const green = Math.min(255, Math.floor(139 * forestVariation)); // Base from #228B22
                    color = `rgb(34, ${green}, 34)`;
                } else { // mountains
                    // Mountains: vary gray intensity (lighter = snow peaks, darker = rocky areas)
                    const grayVariation = 0.6 + detailVariation * 0.8; // 0.6 to 1.4 multiplier
                    const gray = Math.min(255, Math.floor(128 * grayVariation)); // Base from #808080
                    color = `rgb(${gray}, ${gray}, ${gray})`;
                }

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