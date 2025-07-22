# Voronoi Noise Map Generation

A sophisticated interactive map generator that combines Voronoi diagrams with Perlin noise to create realistic procedural island maps. Built with React, TypeScript, and D3.js.

![Voronoi Map Generator](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![D3.js](https://img.shields.io/badge/D3.js-7-orange) ![Vite](https://img.shields.io/badge/Vite-5-purple)

## 🌟 Features

### 🗺️ **Procedural Island Generation**
- **Dynamic Island Shapes**: Creates varied island formations including elongated islands, atolls, asymmetric shapes, and multi-lobed landmasses
- **Realistic Coastlines**: Uses multiple layers of Perlin noise to generate natural, irregular coastlines with bays and peninsulas
- **Terrain Classification**: Automatic terrain type assignment (Ocean, Plains, Forest, Mountains) based on elevation
- **Detail Rendering**: Fine-grained terrain variation within each terrain type for realistic appearance

### 📊 **Voronoi Diagram Visualization**
- **Seed Point Generation**: Multiple algorithms for point distribution
  - Random distribution
  - Poisson-disc sampling (even distribution)
  - Lloyd's relaxation (optimized spacing)
- **Centroid Calculation**: Shows the evolution from initial seeds to optimized centroids
- **Delaunay Triangulation**: Visual representation of the dual graph
- **Before/After Comparison**: Compare Voronoi diagrams before and after centroid optimization

### 🎛️ **Interactive Controls**
- **Real-time Visualization**: Toggle between different visualization modes
- **Adjustable Parameters**: Control seed point count (1-20,000 points)
- **Instant Regeneration**: Generate new maps with a single click
- **Responsive Design**: Adapts to different screen sizes and orientations

### 🎨 **Visualization Modes**

| Mode | Description |
|------|-------------|
| **Seed Points** | Shows the initial random points as red dots |
| **Centroids** | Displays the calculated centroid points as yellow dots |
| **Voronoi Before** | Voronoi diagram based on original seed points |
| **Voronoi After** | Voronoi diagram based on centroid points |
| **Delaunay Triangulation** | Shows the triangular mesh connecting points |
| **Voronoi Noise Pattern** | Grayscale distance-based noise visualization |
| **Perlin Elevations** | Raw Perlin noise displayed as grayscale elevation map |
| **Full Map** | Complete procedural island with realistic terrain |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/degenerateddev/Voronoi.git
   cd Voronoi
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

### Building for Production

```bash
npm run build
# or
yarn build
```

## 🎮 Usage

### Basic Controls
1. **Open the menu** by clicking the hamburger button (☰) in the top-left corner
2. **Select visualization options** from the expandable menu
3. **Adjust seed count** using the +/- buttons or direct input
4. **Choose seed distribution** method (Random, Poisson-disc, Lloyd's)
5. **Generate new maps** using the "Regenerate Voronoi" button

### Advanced Features

#### **Island Shape Variations**
The map generator creates diverse island shapes through:
- **Elongation Effects**: Islands stretched in random directions
- **Atoll Formation**: Ring-shaped islands with central water bodies
- **Asymmetric Bulging**: Organic, non-symmetric coastlines
- **Multi-scale Detail**: Combined large-scale shapes with fine coastline detail

#### **Terrain System**
- **Ocean**: Dynamic blue tones showing depth variation
- **Plains**: Light green areas with rolling hill effects
- **Forest**: Dark green regions with canopy density variation
- **Mountains**: Gray terrain with snow peaks and rocky areas

## 🛠️ Technical Implementation

### Core Technologies
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with full IntelliSense
- **D3.js**: Advanced data visualization and SVG manipulation
- **Vite**: Fast development server and optimized builds
- **Tailwind CSS**: Utility-first styling framework

### Key Algorithms

#### **Voronoi Diagram Generation**
```typescript
// Create Delaunay triangulation and extract Voronoi diagram
const delaunay = Delaunay.from(points);
const voronoi = delaunay.voronoi([0, 0, width, height]);
```

#### **Perlin Noise Integration**
```typescript
// Multi-layered noise for terrain generation
const elevation = perlin.generatePerlinNoise(width/4, height/4, {
  octaveCount: 4,
  amplitude: 0.5,
  persistence: 0.5
});
```

#### **Island Shape Generation**
```typescript
// Dynamic radius calculation for irregular coastlines
const irregularRadius = baseRadius * elongationMultiplier + detailVariation;
```

### Performance Optimizations
- **Memoized Calculations**: Perlin noise cached using `useMemo`
- **Efficient Rendering**: SVG-based graphics with optimized DOM updates
- **Responsive Grid**: Adaptive cell size for performance/quality balance

## 📁 Project Structure

```
src/
├── components/
│   └── Canvas.tsx          # Main visualization component
├── utils/
│   └── index.ts           # Point generation algorithms
├── types/
│   └── perlin-noise.d.ts  # TypeScript definitions
├── App.tsx                # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## 🎯 Features in Detail

### Seed Generation Algorithms

1. **Random Distribution**
   - Pure random point placement
   - Fast generation, uneven distribution
   - Good for chaotic, natural-looking patterns

2. **Poisson-disc Sampling**
   - Maintains minimum distance between points
   - Creates even, organic distribution
   - Ideal for realistic settlement patterns

3. **Lloyd's Relaxation**
   - Iteratively optimizes point positions
   - Maximizes spacing efficiency
   - Results in hexagonal-like patterns

### Noise Layers

1. **Main Elevation**: Primary terrain height map
2. **Coastline Variation**: Determines island shape irregularity
3. **Detail Texture**: Fine-grained terrain variation within types

## 🔧 Configuration

### Adjustable Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| Seed Count | 500 | 1-20,000 | Number of Voronoi seed points |
| Island Radius | 0.5 | 0.1-1.0 | Base island size relative to canvas |
| Cell Size | 4px | 1-16px | Rendering resolution vs performance |
| Noise Octaves | 4-6 | 1-8 | Perlin noise complexity |

### Color Schemes

Terrain colors can be customized by modifying the color calculation logic:

```typescript
// Ocean depth variation
const depthVariation = 0.4 + detailVariation * 0.4;
const blue = Math.floor(181 * (depthVariation + 0.2));
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D3.js Team** for the powerful visualization library
- **Perlin Noise Algorithm** for procedural generation techniques
- **Voronoi Diagrams** mathematical foundation
- **Open Source Community** for inspiration and tools

## 📊 Performance Notes

- **Recommended seed count**: 500-2000 for optimal performance
- **Large datasets**: 10,000+ points may cause slower rendering
- **Mobile devices**: Consider reducing seed count for better performance
- **Memory usage**: Scales linearly with seed point count

## 🔮 Future Enhancements

- [ ] 3D terrain visualization
- [ ] River and road generation
- [ ] Biome system expansion
- [ ] Export capabilities (PNG, SVG)
- [ ] Animation and transitions
- [ ] Custom color palette editor
- [ ] Seed pattern saving/loading

---

**Made with ❤️ and mathematics** - Exploring the beauty of procedural generation and computational geometry.
