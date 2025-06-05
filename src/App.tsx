import { useState } from 'react'
import './App.css'
import { generatePoints } from './utils';
import Canvas from './components/Canvas';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const AMOUNT = 500;

function App() {
  const [points, setPoints] = useState(() => generatePoints(AMOUNT, WIDTH, HEIGHT));

  return (
    <>
      <section>
        <div className="flex flex-col gap-5 bg-black/50 p-2">
          <h1 className="fixed text-5xl font-mono font-semibold">Voronoi Noise Map Generation</h1>
          
          <br />

          <div className="flex items-center gap-3">
            <input type="checkbox" />
            Show Points
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" />
            Show Seed Points
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" />
            Show Voronoi Diagram
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" />
            Show Perlin / Simplex Noise Pattern
          </div>

        </div>

        <Canvas points={points} width={WIDTH} height={HEIGHT} />

        <button onClick={() => setPoints(generatePoints(AMOUNT, WIDTH, HEIGHT))} className="fixed bottom-5 left-[50%] translate-x-[-50%] bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 cursor-pointer">
          Regenerate Voronoi
        </button>
      </section>
    </>
  )
}

export default App
