// Heart Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class HeartFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'heart',
    name: 'Heart Fractal',
    description: 'Heart-shaped fractal: z_{n+1} = z_n² * |z_n| + c',
    formula: (z: Complex, c?: Complex): Complex => {
      // Heart fractal: z_{n+1} = z_n² * |z_n| + c
      const magnitude = Math.sqrt(z.real * z.real + z.imag * z.imag);
      const z2Real = z.real * z.real - z.imag * z.imag;
      const z2Imag = 2 * z.real * z.imag;
      
      return {
        real: z2Real * magnitude + (c?.real || 0),
        imag: z2Imag * magnitude + (c?.imag || 0)
      };
    },
    defaultParams: {
      fractalType: 'heart',
      escapeRadius: 4,
      maxIterations: 100,
      center: { real: 0.0, imag: 0.0 },
      zoom: 3.0,
      colorPalette: 'hot',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'Heart Shape',
        center: { real: 0.0, imag: 0.0 },
        zoom: 3.0,
        description: 'The classic heart-shaped fractal'
      },
      {
        name: 'Heart Detail',
        center: { real: 0.0, imag: -0.5 },
        zoom: 10.0,
        description: 'Detailed heart structures'
      }
    ]
  };
}
