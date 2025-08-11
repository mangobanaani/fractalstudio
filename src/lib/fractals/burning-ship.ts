// Burning Ship Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class BurningShipFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'burning-ship',
    name: 'Burning Ship',
    description: 'Burning Ship fractal: (|Re(z)| + i|Im(z)|)² + c',
    formula: (z: Complex, c?: Complex): Complex => {
      // (|Re(z)| + i|Im(z)|)² + c
      const absReal = Math.abs(z.real);
      const absImag = Math.abs(z.imag);
      
      // (absReal + i*absImag)²
      const squareReal = absReal * absReal - absImag * absImag;
      const squareImag = 2 * absReal * absImag;
      
      return {
        real: squareReal + (c?.real || 0),
        imag: squareImag + (c?.imag || 0)
      };
    },
    defaultParams: {
      fractalType: 'burning-ship',
      escapeRadius: 2,
      maxIterations: 100,
      center: { real: -0.5, imag: -0.6 },
      zoom: 2.5,
      colorPalette: 'inferno',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'The Ship',
        center: { real: -0.5, imag: -0.6 },
        zoom: 2.5,
        description: 'The main burning ship structure'
      },
      {
        name: 'Ship Detail',
        center: { real: -1.775, imag: -0.01 },
        zoom: 200.0,
        description: 'Detailed view of ship structures'
      }
    ]
  };
}
