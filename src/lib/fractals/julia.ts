// Julia Set Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class JuliaFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'julia',
    name: 'Julia Set',
    description: 'Julia set: z² + c (where c is constant)',
    formula: (z: Complex, c?: Complex): Complex => {
      // z² + constant (Julia set uses a fixed constant)
      const constant = c || { real: -0.7269, imag: 0.1889 }; // Default beautiful Julia constant
      const newReal = z.real * z.real - z.imag * z.imag + constant.real;
      const newImag = 2 * z.real * z.imag + constant.imag;
      return { real: newReal, imag: newImag };
    },
    defaultParams: {
      fractalType: 'julia',
      escapeRadius: 2,
      maxIterations: 100,
      center: { real: 0.0, imag: 0.0 },
      zoom: 4.0,
      juliaConstant: { real: -0.7269, imag: 0.1889 },
      colorPalette: 'plasma',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'Classic Julia',
        center: { real: 0.0, imag: 0.0 },
        zoom: 4.0,
        description: 'The classic Julia set with c = -0.7269 + 0.1889i',
        params: {
          juliaConstant: { real: -0.7269, imag: 0.1889 }
        }
      },
      {
        name: 'Classic Detail',
        center: { real: -0.5, imag: 0.2 },
        zoom: 15.0,
        description: 'Close-up of classic Julia set spirals',
        params: {
          juliaConstant: { real: -0.7269, imag: 0.1889 }
        }
      },
      {
        name: 'Dragon Julia',
        center: { real: 0.0, imag: 0.0 },
        zoom: 4.0,
        description: 'Dragon-like Julia set with c = -0.8 + 0.156i',
        params: {
          juliaConstant: { real: -0.8, imag: 0.156 }
        }
      },
      {
        name: 'Dragon Detail',
        center: { real: 0.3, imag: 0.1 },
        zoom: 20.0,
        description: 'Dragon wing detail',
        params: {
          juliaConstant: { real: -0.8, imag: 0.156 }
        }
      },
      {
        name: 'Spiral Julia',
        center: { real: 0.0, imag: 0.0 },
        zoom: 4.0,
        description: 'Spiral patterns with c = -0.123 + 0.745i',
        params: {
          juliaConstant: { real: -0.123, imag: 0.745 }
        }
      },
      {
        name: 'Rabbit Julia',
        center: { real: 0.0, imag: 0.0 },
        zoom: 4.0,
        description: 'Rabbit-like Julia set with c = -0.75 + 0.11i',
        params: {
          juliaConstant: { real: -0.75, imag: 0.11 }
        }
      },
      {
        name: 'Dust Julia',
        center: { real: 0.0, imag: 0.0 },
        zoom: 4.0,
        description: 'Disconnected dust with c = -0.1 + 0.651i',
        params: {
          juliaConstant: { real: -0.1, imag: 0.651 }
        }
      },
      {
        name: 'Lightning Julia',
        center: { real: 0.0, imag: 0.0 },
        zoom: 4.0,
        description: 'Lightning-like Julia set with c = -0.4 + 0.6i',
        params: {
          juliaConstant: { real: -0.4, imag: 0.6 }
        }
      }
    ]
  };
}
