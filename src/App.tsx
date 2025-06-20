import { useState, useEffect } from 'react'
import './App.css'
import { generateLloydsRelaxation, generatePoissonDiscPoints, generateRandomPoints } from './utils';
import Canvas from './components/Canvas';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const AMOUNT = 500;
const POISSON_RADIUS = 20;
const LLOYDS_ITER = 2;

type SeedMode = "random" | "poisson" | "lloyds";

function App() {
  const [seedMode, setSeedMode] = useState<SeedMode>("random");
  const [seeds, setSeedPoints] = useState(() => generateRandomPoints(AMOUNT, WIDTH, HEIGHT));
  
  const [showSeedPoints, setShowSeedPoints] = useState(false);
  const [showCentroids, setShowCentroids] = useState(true);
  const [showDelaunay, setShowDelaunay] = useState(false);

  const [showVoronoiBefore, setShowVoronoiBefore] = useState(false);
  const [showVoronoiAfter, setShowVoronoiAfter] = useState(true);

  const [showNoisePattern, setShowNoisePattern] = useState(false);

  const [showPerlinElevations, setShowPerlinElevations] = useState(false);

  const [showFullMap, setShowFullMap] = useState(false);

  function regenerateSeeds(mode: SeedMode = seedMode) {
    let newSeeds: { x: number, y: number }[] = [];
    if (mode === "random") {
      newSeeds = generateRandomPoints(AMOUNT, WIDTH, HEIGHT);
    } else if (mode === "poisson") {
      newSeeds = generatePoissonDiscPoints(AMOUNT, WIDTH, HEIGHT, POISSON_RADIUS);
    } else if (mode === "lloyds") {
      const base = generateRandomPoints(AMOUNT, WIDTH, HEIGHT);
      newSeeds = generateLloydsRelaxation(base, LLOYDS_ITER);
    }
    setSeedPoints(newSeeds);
  }

  useEffect(() => {
    regenerateSeeds(seedMode);
    // eslint-disable-next-line
  }, [seedMode]);

  return (
    <>
      <section>
        <header className="absolute w-full flex flex-col gap-5 bg-black/50 p-5">
          <h1 className="fixed text-5xl font-mono font-semibold">Voronoi Noise Map Generation</h1>
          
          <br />

          <div className="flex py-5">
            <ul className="flex-grow flex-col space-y-2">
              <h2 className="text-xl bold">Seeds / Centroids</h2>

              <br />

              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showSeedPoints}
                  onChange={() => setShowSeedPoints((prev) => !prev)}
                />
                Show Seed Points
              </li>

              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showCentroids}
                  onChange={() => setShowCentroids((prev) => !prev)}
                />
                Show Centroids
              </li>

              <ul className="flex flex-col ml-3">
                <li className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="seedMode"
                    checked={seedMode === "random"}
                    onChange={() => setSeedMode("random")}
                  />
                  Random Seeds
                </li>
                <li className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="seedMode"
                    checked={seedMode === "poisson"}
                    onChange={() => setSeedMode("poisson")}
                  />
                  Poisson-Disc-Sampling
                </li>
                <li className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="seedMode"
                    checked={seedMode === "lloyds"}
                    onChange={() => setSeedMode("lloyds")}
                  />
                  Lloyd's Relaxation
                </li>
              </ul>

              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showDelaunay}
                  onChange={() => setShowDelaunay((prev) => !prev)}
                />
                Show Delaunay Triangulation
              </li>

            </ul>
            <ul className="flex-grow flex-col space-y-2">
              <h2 className="text-xl bold">Voronoi Diagram</h2>
              
              <br />

              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showVoronoiBefore}
                  onChange={() => {
                    setShowVoronoiBefore((prev) => {
                      if (!prev) setShowVoronoiAfter(false);
                      return !prev;
                    });
                  }}
                />
                Show Voronoi Diagram Before Centroid Calculation
              </li>

              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showVoronoiAfter}
                  onChange={() => {
                    setShowVoronoiAfter((prev) => {
                      if (!prev) setShowVoronoiBefore(false);
                      return !prev;
                    });
                  }}
                />
                Show Voronoi Diagram After Centroid Calculation
              </li>

            </ul>
            <ul className="flex-grow flex-col space-y-2">
              <h2 className="text-xl bold">Noise</h2>
              
              <br />

              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showNoisePattern}
                  onChange={() => setShowNoisePattern((prev) => {
                    if (!prev) {
                      setShowPerlinElevations(false);
                      setShowFullMap(false);
                    }
                    return !prev;
                  })}
                />
                Show Voronoi Noise Pattern (Voronoi only)
              </li>

              <li className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showPerlinElevations}
                  onChange={() => setShowPerlinElevations((prev) => {
                    if (!prev) {
                      setShowNoisePattern(false);
                      setShowFullMap(false);
                    }
                    return !prev;
                  })}
                />
                Show Perlin Noise based Elevations (Perlin only)
              </li>
            </ul>

            <ul className="flex-grow flex-col space-y-2">
              <h2 className="text-xl bold">Final Map</h2>

              <br />

              <li className="flex items-center gap-3">
                <input
                  className="cursor-pointer flex flex-col"
                  type="checkbox"
                  checked={showFullMap}
                  onChange={() => setShowFullMap((prev) => {
                    if (!prev) {
                      setShowNoisePattern(false);
                      setShowPerlinElevations(false);
                    }
                    return !prev;
                  })}
                />
                Show full Map
              </li>
            </ul>
          </div>
          
        </header>

        <Canvas 
          seeds={seeds}
          width={WIDTH}
          height={HEIGHT}
          vision={
            {
              showSeedPoints,
              showDelaunay,
              showVoronoiBefore,
              showCentroids,
              showVoronoiAfter,
              showNoisePattern,
              showPerlinElevations,
              showFullMap
            }
          }
        />

        <button onClick={() => setSeedPoints(generateRandomPoints(AMOUNT, WIDTH, HEIGHT))} className="fixed bottom-5 left-[50%] translate-x-[-50%] bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 cursor-pointer">
          Regenerate Voronoi
        </button>
      </section>
    </>
  )
}

export default App
