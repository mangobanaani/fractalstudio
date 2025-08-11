import { validateFractalParams, getFractalPreset, getRecommendedIterations } from '@/lib/fractal-presets-modular';

describe('Fractal Presets', () => {
  describe('validateFractalParams', () => {
    it('should return valid default parameters for empty input', () => {
      const result = validateFractalParams({});
      
      expect(result.escapeRadius).toBe(2);
      expect(result.maxIterations).toBe(100);
      expect(result.center).toEqual({ real: 0, imag: 0 });
      expect(result.zoom).toBe(4.0);
      expect(result.colorPalette).toBe('viridis');
      expect(result.precision).toBe('highp');
    });

    it('should validate and clamp escape radius', () => {
      const validResult = validateFractalParams({ escapeRadius: 4 });
      expect(validResult.escapeRadius).toBe(4);

      const invalidResult = validateFractalParams({ escapeRadius: 3 as unknown as 2 | 4 | 8 });
      expect(invalidResult.escapeRadius).toBe(2); // Should fallback to default
    });

    it('should validate max iterations', () => {
      const validResult = validateFractalParams({ maxIterations: 500 });
      expect(validResult.maxIterations).toBe(500);

      const invalidResult = validateFractalParams({ maxIterations: 200 as unknown as 50 | 100 | 500 | 1000 });
      expect(invalidResult.maxIterations).toBe(100); // Should fallback to default
    });

    it('should validate complex center coordinates', () => {
      const validResult = validateFractalParams({ 
        center: { real: -0.5, imag: 0.75 } 
      });
      expect(validResult.center).toEqual({ real: -0.5, imag: 0.75 });

      const invalidResult = validateFractalParams({ 
        center: { real: NaN, imag: 0.5 } 
      });
      expect(invalidResult.center).toEqual({ real: 0, imag: 0 }); // Should fallback
    });

    it('should validate zoom level', () => {
      const validResult = validateFractalParams({ zoom: 10.5 });
      expect(validResult.zoom).toBe(10.5);

      const invalidZoomResult = validateFractalParams({ zoom: -1 });
      expect(invalidZoomResult.zoom).toBe(4.0); // Should fallback to default

      const nanZoomResult = validateFractalParams({ zoom: NaN });
      expect(nanZoomResult.zoom).toBe(4.0); // Should fallback to default
    });

    it('should preserve valid Julia constants', () => {
      const result = validateFractalParams({ 
        juliaConstant: { real: -0.7269, imag: 0.1889 } 
      });
      expect(result.juliaConstant).toEqual({ real: -0.7269, imag: 0.1889 });
    });

    it('should handle invalid Julia constants', () => {
      const result = validateFractalParams({ 
        juliaConstant: { real: NaN, imag: 0.5 } 
      });
      expect(result.juliaConstant).toBeUndefined();
    });
  });

  describe('getFractalPreset', () => {
    it('should return correct preset for valid name', () => {
      const mandelbrotPreset = getFractalPreset('Mandelbrot Set');
      expect(mandelbrotPreset).toBeTruthy();
      expect(mandelbrotPreset?.id).toBe('mandelbrot');
      expect(mandelbrotPreset?.name).toBe('Mandelbrot Set');

      const juliaPreset = getFractalPreset('Julia Set');
      expect(juliaPreset).toBeTruthy();
      expect(juliaPreset?.id).toBe('julia');
      expect(juliaPreset?.name).toBe('Julia Set');
    });

    it('should return null for invalid ID', () => {
      const result = getFractalPreset('invalid-preset');
      expect(result).toBeUndefined();
    });

    it('should have proper default parameters for each preset', () => {
      const mandelbrot = getFractalPreset('Mandelbrot Set');
      expect(mandelbrot?.params.center).toEqual({ real: -0.5, imag: 0.0 });
      expect(mandelbrot?.params.zoom).toBe(4.0);

      const julia = getFractalPreset('Julia Set');
      expect(julia?.params.juliaConstant).toBeDefined();
      expect(julia?.params.juliaConstant?.real).toBeCloseTo(-0.7269);
    });
  });

  describe('getRecommendedIterations', () => {
    it('should return appropriate iterations for different zoom levels', () => {
      expect(getRecommendedIterations(1)).toBe(50);
      expect(getRecommendedIterations(50)).toBe(100);
      expect(getRecommendedIterations(500)).toBe(500);
      expect(getRecommendedIterations(5000)).toBe(1000);
    });

    it('should handle edge cases', () => {
      expect(getRecommendedIterations(0)).toBe(50);
      expect(getRecommendedIterations(Infinity)).toBe(1000);
    });
  });
});
