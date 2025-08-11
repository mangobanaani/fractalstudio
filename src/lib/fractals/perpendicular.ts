// Perpendicular Mandelbrot Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class PerpendicularFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'perpendicular',
    name: 'Perpendicular Mandelbrot',
    description: 'Perpendicular Mandelbrot: z_{n+1} = |Re(z_n)| + i|Im(z_n)| + c',
    formula: (z: Complex, c?: Complex): Complex => {
      // Perpendicular Mandelbrot: z_{n+1} = |Re(z_n)| + i|Im(z_n)| + c
      return {
        real: Math.abs(z.real) + (c?.real || 0),
        imag: Math.abs(z.imag) + (c?.imag || 0)
      };
    },
    defaultParams: {
      fractalType: 'perpendicular',
      escapeRadius: 4,
      maxIterations: 100,
      center: { real: 0.0, imag: 0.0 },
      zoom: 3.0,
      colorPalette: 'viridis',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'Main Body',
        center: { real: 0.0, imag: 0.0 },
        zoom: 3.0,
        description: 'The main perpendicular set'
      },
      {
        name: 'Corner Detail',
        center: { real: -1.5, imag: 1.5 },
        zoom: 20.0,
        description: 'Detailed corner structures'
      }
    ]
  };
}
