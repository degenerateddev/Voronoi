declare module 'perlin-noise' {
  interface PerlinOptions {
    octaveCount?: number;
    amplitude?: number;
    persistence?: number;
  }

  function generatePerlinNoise(
    width: number,
    height: number,
    options?: PerlinOptions
  ): number[];

  export { generatePerlinNoise };
}
