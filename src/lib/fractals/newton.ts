// Newton Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class NewtonFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'newton',
    name: 'Newton Fractal',
    description: 'Newton fractal for z³ - 1 = 0',
    formula: (z: Complex): Complex => {
      // Newton fractal for z³ - 1 = 0
      // z_{n+1} = z_n - (z_n³ - 1) / (3z_n²)
      const z3Real = z.real * z.real * z.real - 3 * z.real * z.imag * z.imag;
      const z3Imag = 3 * z.real * z.real * z.imag - z.imag * z.imag * z.imag;
      
      const numeratorReal = z3Real - 1;
      const numeratorImag = z3Imag;
      
      const z2Real = z.real * z.real - z.imag * z.imag;
      const z2Imag = 2 * z.real * z.imag;
      const denominatorReal = 3 * z2Real;
      const denominatorImag = 3 * z2Imag;
      
      // Complex division: (a + bi) / (c + di) = ((ac + bd) + (bc - ad)i) / (c² + d²)
      const denomMagnitude = denominatorReal * denominatorReal + denominatorImag * denominatorImag;
      if (denomMagnitude < 1e-10) return z; // Avoid division by zero
      
      const divisionReal = (numeratorReal * denominatorReal + numeratorImag * denominatorImag) / denomMagnitude;
      const divisionImag = (numeratorImag * denominatorReal - numeratorReal * denominatorImag) / denomMagnitude;
      
      return {
        real: z.real - divisionReal,
        imag: z.imag - divisionImag
      };
    },
    defaultParams: {
      fractalType: 'newton',
      escapeRadius: 2,
      maxIterations: 50,
      center: { real: 0.0, imag: 0.0 },
      zoom: 3.0,
      colorPalette: 'turbo',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'Three Roots',
        center: { real: 0.0, imag: 0.0 },
        zoom: 3.0,
        description: 'The three roots of z³ - 1 = 0'
      },
      {
        name: 'Julia Lines',
        center: { real: 0.0, imag: 0.0 },
        zoom: 10.0,
        description: 'Intricate Julia-like boundaries'
      }
    ]
  };
}
