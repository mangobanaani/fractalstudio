// Lyapunov Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class LyapunovFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'lyapunov',
    name: 'Lyapunov Fractal',
    description: 'Lyapunov fractal using logistic map with chaos dynamics',
    formula: (z: Complex): Complex => {
      // Lyapunov fractal is based on the logistic map
      // This is more complex and handled in the shader
      return z; // Placeholder - actual computation in shader
    },
    defaultParams: {
      fractalType: 'lyapunov',
      escapeRadius: 4.0,
      maxIterations: 500,
      center: { real: 2.0, imag: 2.0 }, // Center in parameter space [0,4] x [0,4]
      zoom: 1.0,
      colorPalette: 'magma',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'Classic View',
        center: { real: 2.0, imag: 2.0 },
        zoom: 1.0,
        description: 'Full view of Lyapunov parameter space'
      },
      {
        name: 'Chaos Boundary',
        center: { real: 3.0, imag: 3.0 },
        zoom: 2.0,
        description: 'Boundary between order and chaos'
      },
      {
        name: 'Feigenbaum Detail',
        center: { real: 3.544, imag: 3.544 },
        zoom: 10.0,
        description: 'Feigenbaum bifurcation cascade detail'
      },
      {
        name: 'Period 3 Window',
        center: { real: 3.83, imag: 3.83 },
        zoom: 20.0,
        description: 'Period-3 window in chaos'
      }
    ]
  };
}
