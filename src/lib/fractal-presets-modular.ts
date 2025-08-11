// Modern fractal presets using the modular fractal system
import { FractalParams, FractalType } from '@/types/fractal';
import FractalLoader from './fractals/loader';

export interface FractalPreset {
  name: string;
  params: FractalParams;
  description?: string;
  id?: string; // Add optional id for compatibility
}

/**
 * Generate presets from all available fractals
 */
export function generateFractalPresets(): FractalPreset[] {
  const presets: FractalPreset[] = [];
  
  // Get all fractal definitions
  const definitions = FractalLoader.getAllDefinitions();
  
  for (const definition of definitions) {
    // Add main preset for each fractal type
    presets.push({
      name: definition.name,
      id: definition.id,
      params: {
        fractalType: definition.id as FractalType,
        escapeRadius: 2,
        maxIterations: 100,
        center: { real: 0.0, imag: 0.0 },
        zoom: 3.0,
        colorPalette: 'viridis',
        precision: 'highp',
        ...definition.defaultParams
      },
      description: definition.description
    });

    // Add interesting location presets
    if (definition.interestingLocations) {
      for (const location of definition.interestingLocations) {
        presets.push({
          name: `${definition.name} - ${location.name}`,
          id: `${definition.id}-${location.name.toLowerCase().replace(/\s+/g, '-')}`,
          params: {
            fractalType: definition.id as FractalType,
            escapeRadius: 2,
            maxIterations: 100,
            center: location.center,
            zoom: location.zoom,
            colorPalette: 'viridis',
            precision: 'highp',
            ...definition.defaultParams,
            ...(location.params || {}) // Location-specific parameters override defaults
          },
          description: location.description || `${location.name} view of ${definition.name}`
        });
      }
    }
  }

  return presets;
}

// Generate and export presets
export const fractalPresets = generateFractalPresets();

/**
 * Get a fractal preset by name
 */
export function getFractalPreset(name: string): FractalPreset | undefined {
  return fractalPresets.find(preset => preset.name === name);
}

/**
 * Get a fractal preset by fractal type
 */
export function getFractalPresetByType(fractalType: FractalType): FractalPreset | undefined {
  return fractalPresets.find(preset => preset.params.fractalType === fractalType);
}

/**
 * Get all available preset IDs/names
 */
export function getFractalPresetIds(): string[] {
  return fractalPresets.map(preset => preset.name);
}

/**
 * Validate fractal parameters
 */
export function validateFractalParams(params: Partial<FractalParams>): FractalParams {
  const defaults: FractalParams = {
    fractalType: 'mandelbrot',
    escapeRadius: 2,
    maxIterations: 100,
    center: { real: 0, imag: 0 },
    zoom: 4.0,
    colorPalette: 'viridis',
    precision: 'highp'
  };

  // Get all available fractal types
  const availableTypes = FractalLoader.getAvailableTypes();

  // Validate and clamp values
  const validated: FractalParams = {
    fractalType: params.fractalType && availableTypes.includes(params.fractalType)
      ? params.fractalType
      : defaults.fractalType,
    escapeRadius: [2, 4, 8].includes(params.escapeRadius as number) 
      ? params.escapeRadius as 2 | 4 | 8 
      : defaults.escapeRadius,
    maxIterations: [50, 100, 500, 1000].includes(params.maxIterations as number)
      ? params.maxIterations as 50 | 100 | 500 | 1000
      : defaults.maxIterations,
    center: params.center && 
      typeof params.center.real === 'number' && 
      typeof params.center.imag === 'number' &&
      !isNaN(params.center.real) && 
      !isNaN(params.center.imag)
      ? params.center 
      : defaults.center,
    zoom: typeof params.zoom === 'number' && 
      params.zoom > 0 && 
      !isNaN(params.zoom)
      ? Math.max(0.1, Math.min(1000000, params.zoom))
      : defaults.zoom,
    colorPalette: params.colorPalette || defaults.colorPalette,
    precision: ['lowp', 'mediump', 'highp'].includes(params.precision as string)
      ? params.precision as 'lowp' | 'mediump' | 'highp'
      : defaults.precision
  };

  // Add optional fields if provided and valid
  if (params.juliaConstant && 
      typeof params.juliaConstant.real === 'number' && 
      typeof params.juliaConstant.imag === 'number' &&
      !isNaN(params.juliaConstant.real) && 
      !isNaN(params.juliaConstant.imag)) {
    validated.juliaConstant = params.juliaConstant;
  }

  return validated;
}

/**
 * Get recommended iteration count based on zoom level
 */
export function getRecommendedIterations(zoom: number): 50 | 100 | 500 | 1000 {
  if (zoom > 1000) return 1000;
  if (zoom > 100) return 500;
  if (zoom > 10) return 100;
  return 50;
}

/**
 * Get recommended precision based on zoom level and device capabilities
 */
export function getRecommendedPrecision(zoom: number, deviceTier: 'high' | 'medium' | 'low'): 'highp' | 'mediump' | 'lowp' {
  if (deviceTier === 'low') return 'lowp';
  if (zoom > 1e6 && deviceTier === 'high') return 'highp';
  if (zoom > 1000) return 'mediump';
  return 'highp';
}
