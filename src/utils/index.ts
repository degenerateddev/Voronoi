export function generatePoints(count: number, width: number, height: number) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height
  }));
}