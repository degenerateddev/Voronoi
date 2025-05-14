import { useState } from 'react'
import './App.css'
import { generatePoints } from './utils';
import Canvas from './components/Canvas';

const WIDTH = 800;
const HEIGHT = 600;

function App() {
  const [points, setPoints] = useState(() => generatePoints(30, WIDTH, HEIGHT));

  return (
    <>
      <section className="flex flex-col items-center gap-10">
        <h1 className="font-mono font-semibold">Voronoi Noise Map Generation</h1>
        
        <button onClick={() => setPoints(generatePoints(30, WIDTH, HEIGHT))}>
          Regenerate Voronoi
        </button>

        <Canvas points={points} width={WIDTH} height={HEIGHT} />
      </section>
    </>
  )
}

export default App
