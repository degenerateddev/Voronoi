import { useState, useEffect } from 'react'
import './App.css'
import { generateLloydsRelaxation, generatePoissonDiscPoints, generateRandomPoints } from './utils';
import Canvas from './components/Canvas';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const AMOUNT = 500;
const LIMIT = 20000;
const POISSON_RADIUS = 30;
const LLOYDS_ITER = 5;

type SeedMode = "random" | "poisson" | "lloyds";

function App() {
  const [amount, setAmount] = useState(AMOUNT);

  const [seedMode, setSeedMode] = useState<SeedMode>("random");
  const [seeds, setSeedPoints] = useState(() => generateRandomPoints(AMOUNT, WIDTH, HEIGHT));
  
  const [showSeedPoints, setShowSeedPoints] = useState(false);
  const [showCentroids, setShowCentroids] = useState(true);
  const [showDelaunay, setShowDelaunay] = useState(false);

  const [showVoronoiBefore, setShowVoronoiBefore] = useState(false);
  const [showVoronoiAfter, setShowVoronoiAfter] = useState(true);

  const [showNoisePattern, setShowNoisePattern] = useState(false);

  const [showPerlinElevations, setShowPerlinElevations] = useState(false);

  const [showFullMap, setShowFullMap] = useState(true);

  // Menu state for dropdown animation
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function regenerateSeeds(mode: SeedMode = seedMode) {
    let newSeeds: { x: number, y: number }[] = [];
    if (mode === "random") {
      newSeeds = generateRandomPoints(amount, WIDTH, HEIGHT);
    } else if (mode === "poisson") {
      newSeeds = generatePoissonDiscPoints(amount, WIDTH, HEIGHT, POISSON_RADIUS);
    } else if (mode === "lloyds") {
      const base = generateRandomPoints(amount, WIDTH, HEIGHT);
      newSeeds = generateLloydsRelaxation(base, LLOYDS_ITER, WIDTH, HEIGHT);
    }
    setSeedPoints(newSeeds);
  }

  useEffect(() => {
    regenerateSeeds(seedMode);
    // eslint-disable-next-line
  }, [seedMode]);

  useEffect(() => {
    regenerateSeeds();
    // eslint-disable-next-line
  }, [amount]);

  return (
    <>
      <section>
        <header className="absolute w-full z-10">
          <div className="flex items-center justify-between bg-black/90 backdrop-blur-md p-5">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col justify-center items-center w-8 h-8 cursor-pointer group"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-white mt-1 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-white mt-1 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-mono font-semibold text-center flex-1 mx-4">
              Voronoi Map Generation
            </h1>

            <div className="w-8"></div>
          </div>

          <div className={`overflow-hidden bg-black/90 backdrop-blur-md transition-all duration-500 ease-in-out ${
            isMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="p-5 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold border-b border-white/30 pb-2">Seeds / Centroids</h2>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={showSeedPoints}
                      onChange={() => setShowSeedPoints((prev) => !prev)}
                    />
                    <span className="text-sm">Show Seed Points</span>
                  </div>

                  <div className="ml-3 space-y-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="seedMode"
                        checked={seedMode === "random"}
                        onChange={() => setSeedMode("random")}
                      />
                      <span className="text-sm">Random Seeds</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="seedMode"
                        checked={seedMode === "poisson"}
                        onChange={() => setSeedMode("poisson")}
                      />
                      <span className="text-sm">Poisson-Disc-Sampling</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="seedMode"
                        checked={seedMode === "lloyds"}
                        onChange={() => setSeedMode("lloyds")}
                      />
                      <span className="text-sm">Lloyd's Relaxation</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={showCentroids}
                      onChange={() => setShowCentroids((prev) => !prev)}
                    />
                    <span className="text-sm">Show Centroids</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={showDelaunay}
                      onChange={() => setShowDelaunay((prev) => !prev)}
                    />
                    <span className="text-sm">Show Delaunay Triangulation</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-bold border-b border-white/30 pb-2">Voronoi Diagram</h2>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={showVoronoiBefore}
                      onChange={() => {
                        setShowVoronoiBefore((prev) => {
                          if (!prev) 
                          setShowVoronoiAfter(false);
                          setShowVoronoiBefore(true);
                          return !prev;
                        });
                      }}
                    />
                    <span className="text-sm">Show Voronoi Diagram Before Centroid Calculation</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={showVoronoiAfter}
                      onChange={() => {
                        setShowVoronoiAfter((prev) => {
                          if (!prev)
                          setShowVoronoiBefore(false);
                          setShowVoronoiAfter(true);
                          return !prev;
                        });
                      }}
                    />
                    <span className="text-sm">Show Voronoi Diagram After Centroid Calculation</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-bold border-b border-white/30 pb-2">Seed Amount</h2>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAmount(prev => Math.max(1, prev - 50))}
                        className="cursor-pointer bg-white/10 hover:bg-white/20 text-white w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 font-mono text-lg font-bold"
                      >
                        -
                      </button>
                      <input
                        className="bg-white/10 border border-white/20 outline-none text-white text-base font-mono w-20 h-8 text-center rounded-md focus:border-white/50 focus:bg-white/15 transition-all duration-200"
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setAmount(Math.max(1, Math.min(LIMIT, value)));
                        }}
                        min="1"
                        max={LIMIT}
                      />
                      <button
                        onClick={() => setAmount(prev => Math.min(LIMIT, prev + 50))}
                        className="cursor-pointer bg-white/10 hover:bg-white/20 text-white w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 font-mono text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-bold border-b border-white/30 pb-2">Noise</h2>
                  
                  <div className="flex items-center gap-3">
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
                    <span className="text-sm">Show Voronoi Noise Pattern (Voronoi only)</span>
                  </div>

                  <div className="flex items-center gap-3">
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
                    <span className="text-sm">Show Perlin Noise based Elevations (Perlin only)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-bold border-b border-white/30 pb-2">Final Map</h2>

                  <div className="flex items-center gap-3">
                    <input
                      className="cursor-pointer"
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
                    <span className="text-sm">Show full Map</span>
                  </div>
                </div>
              </div>
            </div>
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

        <button 
          onClick={() => regenerateSeeds()} 
          className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md p-2 rounded-md hover:bg-black transition duration-200 cursor-pointer w-10 h-10 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </section>
    </>
  )
}

export default App
