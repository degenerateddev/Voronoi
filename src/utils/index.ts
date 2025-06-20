import * as d3 from "d3";
import { Delaunay } from "d3";

export function generateRandomPoints(count: number, width: number, height: number) {
  return Array.from({ length: count }, () => {
    const x = Math.random() * width;
    const y = Math.random() * height;

    return {
      x,
      y,
    }
  });
}

export function generatePoissonDiscPoints(count: number, width: number, height: number, radius: number) {
  const points = [];
  const grid = new Map();
  const cellSize = radius / Math.sqrt(2);

  function getCellKey(x: number, y: number) {
    return `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;
  }

  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;

    const cellKey = getCellKey(x, y);
    if (!grid.has(cellKey)) {
      points.push({ x, y });
      grid.set(cellKey, { x, y });
    }
  }

  return points;
}

export function generateLloydsRelaxation(points: { x: number, y: number }[], iterations: number) {
  let newPoints = [...points];

  for (let i = 0; i < iterations; i++) {
    const delaunay = Delaunay.from(newPoints.map(p => [p.x, p.y]));
    // Use the correct Voronoi constructor: pass [xmin, ymin, xmax, ymax] as bounds
    const voronoi = delaunay.voronoi([0, 0, window.innerWidth, window.innerHeight]);
    // polygons() returns an iterable, so convert to array
    const polygons = Array.from(voronoi.cellPolygons());

    // Update each point to the centroid of its cell
    newPoints = polygons.map(polygon => {
      const centroid = d3.polygonCentroid(polygon);
      return { x: centroid[0], y: centroid[1] };
    });
  }

  return newPoints;
}