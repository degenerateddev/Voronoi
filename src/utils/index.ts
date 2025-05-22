export function generatePoints(count: number, width: number, height: number) {
  return Array.from({ length: count }, () => {
    const x = Math.random() * width;
    const y = Math.random() * height;

    const dx = x - width / 2;
    const dy = y - height / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);

    let terrain : "plains" | "forest" | "mountains" | "ocean";
    if (dist < maxDist * 0.3) terrain = "mountains";
    else if (dist > maxDist * 0.75) terrain = "ocean";
    else if (Math.random() < 0.5) terrain = "forest";
    else terrain = "plains";

    return {
      x,
      y,
      terrain,
    }
  });
}