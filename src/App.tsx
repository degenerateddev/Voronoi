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
        <h1 className="fixed text-5xl font-mono font-semibold p-2 bg-black/50">Voronoi Noise Map Generation</h1>

        <Canvas points={points} width={WIDTH} height={HEIGHT} />

        <button onClick={() => setPoints(generatePoints(AMOUNT, WIDTH, HEIGHT))} className="fixed bottom-5 left-[50%] translate-x-[-50%] bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 cursor-pointer">
          Regenerate Voronoi
        </button>
      </section>
    </>
  )
}

export default App
