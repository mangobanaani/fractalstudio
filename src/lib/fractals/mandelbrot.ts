// Mandelbrot Set Fractal
import { Complex } from '@/types/fractal';
import { BaseFractal, FractalDefinition } from './base';

export class MandelbrotFractal extends BaseFractal {
  readonly definition: FractalDefinition = {
    id: 'mandelbrot',
    name: 'Mandelbrot Set',
    description: 'The classic Mandelbrot set: z² + c',
    formula: (z: Complex, c?: Complex): Complex => {
      // z² + c
      const newReal = z.real * z.real - z.imag * z.imag + (c?.real || 0);
      const newImag = 2 * z.real * z.imag + (c?.imag || 0);
      return { real: newReal, imag: newImag };
    },
    defaultParams: {
      fractalType: 'mandelbrot',
      escapeRadius: 2,
      maxIterations: 100,
      center: { real: -0.5, imag: 0.0 },
      zoom: 4.0,
      colorPalette: 'viridis',
      precision: 'highp'
    },
    interestingLocations: [
      {
        name: 'Main Body',
        center: { real: -0.5, imag: 0.0 },
        zoom: 4.0,
        description: 'The main cardioid of the Mandelbrot set'
      },
      {
        name: 'Seahorse Valley',
        center: { real: -0.7453, imag: 0.1127 },
        zoom: 300.0, // Increased zoom for better detail
        description: 'Beautiful spiral patterns resembling seahorses'
      },
      {
        name: 'Seahorse Close-up',
        center: { real: -0.74529, imag: 0.11307 },
        zoom: 1000.0,
        description: 'Extreme close-up of seahorse spirals'
      },
      {
        name: 'Elephant Valley',
        center: { real: 0.2549, imag: 0.0005 },
        zoom: 1000.0,
        description: 'Miniature elephant-like structures'
      },
      {
        name: 'Lightning',
        center: { real: -1.25, imag: 0.0 },
        zoom: 50.0,
        description: 'Sharp, lightning-like fractals'
      },
      {
        name: 'Spiral Galaxy',
        center: { real: -0.7269, imag: 0.1889 },
        zoom: 500.0,
        description: 'Galaxy-like spiral arms'
      },
      {
        name: 'Needle Point',
        center: { real: -0.16, imag: 1.0405 },
        zoom: 100.0,
        description: 'Sharp needle-like protrusions'
      },
      {
        name: 'Mini Mandelbrot',
        center: { real: -1.25066, imag: 0.02012 },
        zoom: 2000.0,
        description: 'Tiny self-similar Mandelbrot copy'
      }
    ]
  };
}
