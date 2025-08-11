// Lambda Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class LambdaFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'lambda',
    name: 'Lambda Fractal',
    description: 'Lambda fractal: z_{n+1} = λ * z_n * (1 - z_n)',
    formula: (z: Complex, c?: Complex): Complex => {
      // Lambda fractal: z_{n+1} = λ * z_n * (1 - z_n)
      // where λ (lambda) is the parameter c
      const lambda = c || { real: 1, imag: 0 }; // Default lambda
      const oneMinusZ = {
        real: 1 - z.real,
        imag: -z.imag
      };
      
      // z * (1 - z)
      const temp = {
        real: z.real * oneMinusZ.real - z.imag * oneMinusZ.imag,
        imag: z.real * oneMinusZ.imag + z.imag * oneMinusZ.real
      };
      
      // λ * z * (1 - z)
      return {
        real: lambda.real * temp.real - lambda.imag * temp.imag,
        imag: lambda.real * temp.imag + lambda.imag * temp.real
      };
    },
    defaultParams: {
      fractalType: 'lambda',
      escapeRadius: 2,
      maxIterations: 100,
      center: { real: 0.5, imag: 0.0 },
      zoom: 3.0,
      colorPalette: 'inferno',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'Lambda Set',
        center: { real: 0.5, imag: 0.0 },
        zoom: 3.0,
        description: 'The classical lambda set'
      },
      {
        name: 'Bifurcation Point',
        center: { real: 1.0, imag: 0.0 },
        zoom: 10.0,
        description: 'Critical bifurcation region'
      }
    ]
  };
}
