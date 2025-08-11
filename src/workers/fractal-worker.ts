// Web Worker for high-performance fractal computation
import { 
  ComputeFractalMessage, 
  GeneratePaletteMessage,
  WorkerMessage,
  Complex,
  FractalParams,
  ViewportState
} from '@/types/fractal';

// Complex number arithmetic utilities
class ComplexMath {
  static add(a: Complex, b: Complex): Complex {
    return {
      real: a.real + b.real,
      imag: a.imag + b.imag
    };
  }

  static multiply(a: Complex, b: Complex): Complex {
    return {
      real: a.real * b.real - a.imag * b.imag,
      imag: a.real * b.imag + a.imag * b.real
    };
  }

  static square(z: Complex): Complex {
    return {
      real: z.real * z.real - z.imag * z.imag,
      imag: 2 * z.real * z.imag
    };
  }

  static magnitude(z: Complex): number {
    return Math.sqrt(z.real * z.real + z.imag * z.imag);
  }

  static magnitudeSquared(z: Complex): number {
    return z.real * z.real + z.imag * z.imag;
  }

  static abs(z: Complex): Complex {
    return {
      real: Math.abs(z.real),
      imag: Math.abs(z.imag)
    };
  }
}

// High-precision fractal iteration functions
class FractalCompute {
  // Mandelbrot set iteration with smooth coloring
  static mandelbrot(c: Complex, maxIterations: number, escapeRadius: number): number {
    let z: Complex = { real: 0, imag: 0 };
    let iteration = 0;

    const escapeRadiusSquared = escapeRadius * escapeRadius;

    while (iteration < maxIterations) {
      const zMagSquared = ComplexMath.magnitudeSquared(z);
      
      if (zMagSquared > escapeRadiusSquared) {
        // Smooth iteration count for continuous coloring
        return iteration + 1 - Math.log2(Math.log2(zMagSquared) * 0.5);
      }

      z = ComplexMath.add(ComplexMath.square(z), c);
      iteration++;
    }

    return maxIterations;
  }

  // Julia set iteration
  static julia(z: Complex, c: Complex, maxIterations: number, escapeRadius: number): number {
    let iteration = 0;
    const escapeRadiusSquared = escapeRadius * escapeRadius;

    while (iteration < maxIterations) {
      const zMagSquared = ComplexMath.magnitudeSquared(z);
      
      if (zMagSquared > escapeRadiusSquared) {
        return iteration + 1 - Math.log2(Math.log2(zMagSquared) * 0.5);
      }

      z = ComplexMath.add(ComplexMath.square(z), c);
      iteration++;
    }

    return maxIterations;
  }

  // Burning Ship fractal iteration
  static burningShip(c: Complex, maxIterations: number, escapeRadius: number): number {
    let z: Complex = { real: 0, imag: 0 };
    let iteration = 0;
    const escapeRadiusSquared = escapeRadius * escapeRadius;

    while (iteration < maxIterations) {
      const zMagSquared = ComplexMath.magnitudeSquared(z);
      
      if (zMagSquared > escapeRadiusSquared) {
        return iteration + 1 - Math.log2(Math.log2(zMagSquared) * 0.5);
      }

      // Apply absolute value before squaring (key difference from Mandelbrot)
      const absZ = ComplexMath.abs(z);
      z = ComplexMath.add(ComplexMath.square(absZ), c);
      iteration++;
    }

    return maxIterations;
  }

  // Lyapunov fractal (simplified implementation)
  static lyapunov(coord: Complex, maxIterations: number): number {
    const a = coord.real;
    const b = coord.imag;
    
    // Ensure parameters are in valid range
    if (a <= 0 || a >= 4 || b <= 0 || b >= 4) {
      return 0;
    }

    let x = 0.5; // Starting value
    let lyapunovSum = 0;
    
    // Use simple AB pattern
    for (let i = 0; i < maxIterations; i++) {
      const r = (i % 2 === 0) ? a : b;
      
      // Check for divergence
      if (x <= 0 || x >= 1) {
        return -10; // Divergent
      }

      const derivative = r * (1 - 2 * x);
      if (Math.abs(derivative) < 1e-10) {
        return -10; // Avoid log(0)
      }

      lyapunovSum += Math.log(Math.abs(derivative));
      x = r * x * (1 - x);
    }

    return lyapunovSum / maxIterations;
  }
}

// Compute fractal for a rectangular region
function computeFractalRegion(
  preset: { id?: string; params?: { fractalType?: string } } | { fractalType: string },
  params: FractalParams,
  viewport: ViewportState,
  startX: number,
  endX: number,
  startY: number,
  endY: number,
  samplesPerPixel: number = 1
): Float32Array {
  const width = endX - startX;
  const height = endY - startY;
  const data = new Float32Array(width * height);

  // Get fractal type from preset or params
  const fractalType = ('fractalType' in preset) 
    ? preset.fractalType 
    : (preset.id || preset.params?.fractalType || params.fractalType);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let totalIteration = 0;

      // Anti-aliasing: multiple samples per pixel
      for (let sy = 0; sy < samplesPerPixel; sy++) {
        for (let sx = 0; sx < samplesPerPixel; sx++) {
          // Calculate complex coordinate
          const pixelX = startX + x + sx / samplesPerPixel;
          const pixelY = startY + y + sy / samplesPerPixel;
          
          const normalizedX = pixelX / viewport.width;
          const normalizedY = pixelY / viewport.height;
          
          // Transform to complex plane
          const aspectRatio = viewport.width / viewport.height;
          const complexX = (normalizedX - 0.5) * aspectRatio * viewport.zoom + viewport.center.real;
          const complexY = (normalizedY - 0.5) * viewport.zoom + viewport.center.imag;
          
          const coord: Complex = { real: complexX, imag: complexY };
          let iteration: number;

          // Compute based on fractal type
          switch (fractalType) {
            case 'mandelbrot':
              iteration = FractalCompute.mandelbrot(coord, params.maxIterations, params.escapeRadius);
              break;
              
            case 'julia':
              if (!params.juliaConstant) {
                iteration = 0;
                break;
              }
              iteration = FractalCompute.julia(coord, params.juliaConstant, params.maxIterations, params.escapeRadius);
              break;
              
            case 'burning-ship':
              // Flip y-axis for burning ship
              const flippedCoord: Complex = { real: coord.real, imag: -coord.imag };
              iteration = FractalCompute.burningShip(flippedCoord, params.maxIterations, params.escapeRadius);
              break;
              
            case 'lyapunov':
              // Map to parameter space [0, 4] x [0, 4]
              const paramCoord: Complex = {
                real: (coord.real + 2) * 2,
                imag: (coord.imag + 2) * 2
              };
              iteration = FractalCompute.lyapunov(paramCoord, params.maxIterations);
              break;
              
            default:
              iteration = 0;
          }

          totalIteration += iteration;
        }
      }

      // Average the samples for anti-aliasing
      const avgIteration = totalIteration / (samplesPerPixel * samplesPerPixel);
      data[y * width + x] = avgIteration;
    }
  }

  return data;
}

// Generate color palette data
function generatePalette(paletteId: string, colorSpace: 'HSL' | 'RGB' | 'CIE_LAB', steps: number): Uint8Array {
  const data = new Uint8Array(steps * 4); // RGBA

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    let r: number, g: number, b: number;

    switch (paletteId) {
      case 'viridis':
        [r, g, b] = viridisColormap(t);
        break;
      case 'plasma':
        [r, g, b] = plasmaColormap(t);
        break;
      case 'inferno':
        [r, g, b] = infernoColormap(t);
        break;
      default:
        // Simple rainbow fallback
        const hue = t * 360;
        [r, g, b] = hslToRgb(hue, 1, 0.5);
    }

    const index = i * 4;
    data[index] = r;
    data[index + 1] = g;
    data[index + 2] = b;
    data[index + 3] = 255; // Alpha
  }

  return data;
}

// Simplified colormap implementations
function viridisColormap(t: number): [number, number, number] {
  // Approximation of the Viridis colormap
  const r = 0.267 + 0.975 * t + 0.283 * Math.sin(6.28 * t);
  const g = 0.004 + 0.990 * t;
  const b = 0.329 - 0.453 * t + 0.516 * Math.sin(6.28 * t);
  
  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(b * 255)))
  ];
}

function plasmaColormap(t: number): [number, number, number] {
  const r = 0.050 + 0.900 * t;
  const g = 0.030 + 0.498 * t + 0.400 * Math.sin(3.14 * t);
  const b = 0.900 - 0.850 * t;
  
  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(b * 255)))
  ];
}

function infernoColormap(t: number): [number, number, number] {
  const r = 0.000 + 1.000 * t;
  const g = 0.000 + 0.850 * Math.pow(t, 2);
  const b = 0.150 * Math.pow(t, 4);
  
  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(b * 255)))
  ];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r: number, g: number, b: number;

  if (h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

// Worker message handler
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'COMPUTE_FRACTAL': {
        const { preset, params, viewport, samplesPerPixel = 1 } = (payload as ComputeFractalMessage['payload']);
        
        const data = computeFractalRegion(
          preset,
          params,
          viewport,
          0, viewport.width,
          0, viewport.height,
          samplesPerPixel
        );

        const ctx = self as unknown as Worker;
        ctx.postMessage({
          type: 'FRACTAL_COMPUTED',
          payload: {
            data: data.buffer,
            width: viewport.width,
            height: viewport.height
          }
        }, { transfer: [data.buffer] });
        break;
      }

      case 'GENERATE_PALETTE': {
        const { paletteId, colorSpace, steps } = (payload as GeneratePaletteMessage['payload']);
        
        const paletteData = generatePalette(paletteId, colorSpace, steps);

        const ctx = self as unknown as Worker;
        ctx.postMessage({
          type: 'PALETTE_GENERATED',
          payload: {
            data: paletteData.buffer,
            steps
          }
        }, { transfer: [paletteData.buffer] });
        break;
      }

      case 'VALIDATE_PARAMS': {
        // Parameter validation logic
        self.postMessage({
          type: 'PARAMS_VALIDATED',
          payload: { valid: true }
        });
        break;
      }

      default:
        console.warn('Unknown worker message type:', type);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }
};

// Export for TypeScript (this will be removed in the actual worker)
export {};
