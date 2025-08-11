// Tricorn (Mandelbar) Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class TricornFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'tricorn',
    name: 'Tricorn (Mandelbar)',
    description: 'Tricorn fractal: z̄² + c (conjugate of z squared)',
    formula: (z: Complex, c?: Complex): Complex => {
      // Tricorn/Mandelbar: z̄² + c (conjugate of z squared)
      const conjugateZ = { real: z.real, imag: -z.imag };
      const newReal = conjugateZ.real * conjugateZ.real - conjugateZ.imag * conjugateZ.imag + (c?.real || 0);
      const newImag = 2 * conjugateZ.real * conjugateZ.imag + (c?.imag || 0);
      return { real: newReal, imag: newImag };
    },
    defaultParams: {
      fractalType: 'tricorn',
      escapeRadius: 2,
      maxIterations: 100,
      center: { real: -0.5, imag: 0.0 },
      zoom: 4.0,
      colorPalette: 'magma',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'Main Structure',
        center: { real: -0.5, imag: 0.0 },
        zoom: 4.0,
        description: 'The main tricorn body'
      },
      {
        name: 'Tricorn Detail',
        center: { real: -0.3, imag: 0.5 },
        zoom: 20.0,
        description: 'Detailed tricorn patterns'
      }
    ]
  };
}
