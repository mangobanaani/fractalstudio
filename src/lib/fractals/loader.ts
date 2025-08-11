// Fractal loader - dynamically loads and manages all fractal types
import { FractalType } from '@/types/fractal';
import { BaseFractal } from './base';

// Import all fractal implementations
import { MandelbrotFractal } from './mandelbrot';
import { JuliaFractal } from './julia';
import { BurningShipFractal } from './burning-ship';
import { LyapunovFractal } from './lyapunov';
import { TricornFractal } from './tricorn';
import { CelticFractal } from './celtic';
import { NewtonFractal } from './newton';
import { PhoenixFractal } from './phoenix';
import { LambdaFractal } from './lambda';
import { PerpendicularFractal } from './perpendicular';
import { HeartFractal } from './heart';

// Registry of all available fractals
const fractalRegistry = new Map<FractalType, () => BaseFractal>([
  ['mandelbrot', () => new MandelbrotFractal()],
  ['julia', () => new JuliaFractal()],
  ['burning-ship', () => new BurningShipFractal()],
  ['lyapunov', () => new LyapunovFractal()],
  ['tricorn', () => new TricornFractal()],
  ['celtic', () => new CelticFractal()],
  ['newton', () => new NewtonFractal()],
  ['phoenix', () => new PhoenixFractal()],
  ['lambda', () => new LambdaFractal()],
  ['perpendicular', () => new PerpendicularFractal()],
  ['heart', () => new HeartFractal()],
]);

export class FractalLoader {
  private static instances = new Map<FractalType, BaseFractal>();

  /**
   * Get a fractal instance by type
   */
  static getFractal(type: FractalType): BaseFractal {
    // Use cached instance if available
    if (this.instances.has(type)) {
      return this.instances.get(type)!;
    }

    // Create new instance
    const factory = fractalRegistry.get(type);
    if (!factory) {
      throw new Error(`Unknown fractal type: ${type}`);
    }

    const instance = factory();
    this.instances.set(type, instance);
    return instance;
  }

  /**
   * Get all available fractal types
   */
  static getAvailableTypes(): FractalType[] {
    return Array.from(fractalRegistry.keys());
  }

  /**
   * Get fractal definition by type
   */
  static getDefinition(type: FractalType) {
    return this.getFractal(type).definition;
  }

  /**
   * Get all fractal definitions
   */
  static getAllDefinitions() {
    return this.getAvailableTypes().map(type => this.getDefinition(type));
  }

  /**
   * Clear cached instances (useful for hot reloading)
   */
  static clearCache() {
    this.instances.clear();
  }
}

export default FractalLoader;
