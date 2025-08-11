// Phoenix Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class PhoenixFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'phoenix',
    name: 'Phoenix Fractal',
    description: 'Phoenix fractal with coupling parameter',
    formula: (z: Complex, c?: Complex, prev?: Complex): Complex => {
      // Phoenix fractal: z_{n+1} = z_n² + c + p * z_{n-1}
      // Using phoenix parameter p = 0.5667 for classic pattern
      const p = 0.5667;
      const defaultC = c || { real: 0.5667, imag: 0 };
      
      const newReal = z.real * z.real - z.imag * z.imag + defaultC.real;
      const newImag = 2 * z.real * z.imag + defaultC.imag;
      
      if (prev) {
        return {
          real: newReal + p * prev.real,
          imag: newImag + p * prev.imag
        };
      }
      
      return { real: newReal, imag: newImag };
    },
    defaultParams: {
      fractalType: 'phoenix',
      escapeRadius: 4,
      maxIterations: 100,
      center: { real: 0.0, imag: 0.0 },
      zoom: 3.0,
      colorPalette: 'plasma',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'Phoenix Eye',
        center: { real: -0.5, imag: 0.6 },
        zoom: 200.0,
        description: 'Intricate phoenix-like structures'
      },
      {
        name: 'Phoenix Wings',
        center: { real: 0.0, imag: 0.0 },
        zoom: 5.0,
        description: 'Wing-like fractal patterns'
      }
    ]
  };
}
