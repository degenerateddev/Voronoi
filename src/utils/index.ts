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
  const k = 30; // max tries to place new points
  const cellSize = radius / Math.sqrt(2);
  const gridWidth = Math.ceil(width / cellSize);
  const gridHeight = Math.ceil(height / cellSize);
  
  const grid: number[][] = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(-1)); // -1 = empty grid
  const points: { x: number; y: number }[] = [];
  const activeList: number[] = [];
  
  const getGridCoords = (x: number, y: number) => ({
    gridX: Math.floor(x / cellSize),
    gridY: Math.floor(y / cellSize)
  });
  
  // checks if new point is far enough from existing points
  const isValidPoint = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    
    const { gridX, gridY } = getGridCoords(x, y);
    
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const checkX = gridX + dx;
        const checkY = gridY + dy;
        
        if (checkX >= 0 && checkX < gridWidth && checkY >= 0 && checkY < gridHeight) {
          const pointIndex = grid[checkY][checkX];
          if (pointIndex !== -1) {
            const existingPoint = points[pointIndex];
            const distance = Math.sqrt(
              Math.pow(x - existingPoint.x, 2) + Math.pow(y - existingPoint.y, 2)
            );
            if (distance < radius) return false;
          }
        }
      }
    }
    return true;
  };
  
  const initialX = Math.random() * width;
  const initialY = Math.random() * height;
  points.push({ x: initialX, y: initialY });
  
  const { gridX: initialGridX, gridY: initialGridY } = getGridCoords(initialX, initialY);
  grid[initialGridY][initialGridX] = 0;
  activeList.push(0);
  
  while (activeList.length > 0 && points.length < count) {
    const randomActiveIndex = Math.floor(Math.random() * activeList.length);
    const currentPointIndex = activeList[randomActiveIndex];
    const currentPoint = points[currentPointIndex];
    
    let found = false;
    
    for (let attempt = 0; attempt < k; attempt++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = radius + Math.random() * radius; // between r and 2r
      
      const newX = currentPoint.x + Math.cos(angle) * distance;
      const newY = currentPoint.y + Math.sin(angle) * distance;
      
      if (isValidPoint(newX, newY)) {
        const newPointIndex = points.length;
        points.push({ x: newX, y: newY });
        
        const { gridX, gridY } = getGridCoords(newX, newY);
        grid[gridY][gridX] = newPointIndex;
        activeList.push(newPointIndex);
        
        found = true;
        break;
      }
    }
    
    // no valid point found after k attempts = remove from active list
    if (!found) {
      activeList.splice(randomActiveIndex, 1);
    }
  }
  
  return points;
}

export function generateLloydsRelaxation(points: { x: number, y: number }[], iterations: number, width: number, height: number) {
  if (!points.length || iterations <= 0) return points;
  
    let newPoints = [...points];

    for (let i = 0; i < iterations; i++) {
      if (newPoints.length < 3) break;
      
      try {
        const delaunay = Delaunay.from(newPoints.map(p => [p.x, p.y]));
        const voronoi = delaunay.voronoi([0, 0, width, height]);
        const polygons = Array.from(voronoi.cellPolygons());

        newPoints = polygons.map(polygon => {
          if (!polygon || polygon.length === 0) return { x: 0, y: 0 };
          
          const centroid = d3.polygonCentroid(polygon);
          // clamp centroid to bounds to prevent drifting outside the cell
          return { 
            x: Math.max(0, Math.min(width, centroid[0])), 
            y: Math.max(0, Math.min(height, centroid[1])) 
          };
        }).filter(p => p.x > 0 || p.y > 0);
      } catch (error) {
        console.warn('Lloyd relaxation failed at iteration', i, error);
        break;
      }
  }

  return newPoints;
}