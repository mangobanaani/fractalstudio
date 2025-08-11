// Celtic Mandelbrot Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class CelticFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'celtic',
    name: 'Celtic Mandelbrot',
    description: 'Celtic Mandelbrot: (|Re(z²)| + i·Im(z²)) + c',
    formula: (z: Complex, c?: Complex): Complex => {
      // Celtic Mandelbrot: (|Re(z²)| + i·Im(z²)) + c
      const z2Real = z.real * z.real - z.imag * z.imag;
      const z2Imag = 2 * z.real * z.imag;
      return {
        real: Math.abs(z2Real) + (c?.real || 0),
        imag: z2Imag + (c?.imag || 0)
      };
    },
    defaultParams: {
      fractalType: 'celtic',
      escapeRadius: 2,
      maxIterations: 100,
      center: { real: 0.0, imag: 0.0 },
      zoom: 4.0,
      colorPalette: 'viridis',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'Celtic Cross',
        center: { real: 0.0, imag: 0.0 },
        zoom: 4.0,
        description: 'The characteristic Celtic cross pattern'
      }
    ]
  };
}
