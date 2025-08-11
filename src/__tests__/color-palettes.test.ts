import { 
  getColorPalette, 
  getColorPaletteIds, 
  generateSmoothGradient,
  ColorUtils,
  createPaletteTexture
} from '@/lib/color-palettes';

describe('Color Palettes', () => {
  describe('getColorPalette', () => {
    it('should return correct palette for valid ID', () => {
      const viridis = getColorPalette('viridis');
      expect(viridis).toBeTruthy();
      expect(viridis?.id).toBe('viridis');
      expect(viridis?.name).toBe('Viridis');
      expect(viridis?.type).toBe('linear');
      expect(viridis?.colors).toHaveLength(9);
    });

    it('should return null for invalid ID', () => {
      const result = getColorPalette('invalid-palette');
      expect(result).toBeNull();
    });

    it('should return all expected palettes', () => {
      const expectedPalettes = [
        'viridis', 'plasma', 'inferno', 'magma', 'cividis',
        'twilight', 'ocean', 'fire', 'rainbow', 'electric'
      ];

      expectedPalettes.forEach(id => {
        const palette = getColorPalette(id);
        expect(palette).toBeTruthy();
        expect(palette?.id).toBe(id);
      });
    });
  });

  describe('getColorPaletteIds', () => {
    it('should return array of all palette IDs', () => {
      const ids = getColorPaletteIds();
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids).toContain('viridis');
      expect(ids).toContain('plasma');
      expect(ids).toContain('inferno');
    });
  });

  describe('generateSmoothGradient', () => {
    it('should generate correct number of gradient steps', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff'];
      const gradient = generateSmoothGradient(colors, 10);
      
      expect(gradient).toHaveLength(10);
      expect(gradient[0]).toBe('#ff0000'); // Should start with first color
    });

    it('should handle single color input', () => {
      const colors = ['#ff0000'];
      const gradient = generateSmoothGradient(colors, 5);
      
      expect(gradient).toEqual(['#ff0000']);
    });

    it('should handle empty color array', () => {
      const colors: string[] = [];
      const gradient = generateSmoothGradient(colors, 5);
      
      expect(gradient).toEqual([]);
    });
  });

  describe('ColorUtils', () => {
    describe('hslToRgb', () => {
      it('should convert red HSL to RGB correctly', () => {
        const [r, g, b] = ColorUtils.hslToRgb(0, 1, 0.5);
        expect(r).toBe(255);
        expect(g).toBe(0);
        expect(b).toBe(0);
      });

      it('should convert green HSL to RGB correctly', () => {
        const [r, g, b] = ColorUtils.hslToRgb(120, 1, 0.5);
        expect(r).toBe(0);
        expect(g).toBe(255);
        expect(b).toBe(0);
      });

      it('should convert blue HSL to RGB correctly', () => {
        const [r, g, b] = ColorUtils.hslToRgb(240, 1, 0.5);
        expect(r).toBe(0);
        expect(g).toBe(0);
        expect(b).toBe(255);
      });

      it('should handle grayscale (saturation = 0)', () => {
        const [r, g, b] = ColorUtils.hslToRgb(0, 0, 0.5);
        expect(r).toBe(128);
        expect(g).toBe(128);
        expect(b).toBe(128);
      });

      it('should clamp values to valid ranges', () => {
        const [r, g, b] = ColorUtils.hslToRgb(360, 2, 2); // Out of range values
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThanOrEqual(255);
        expect(g).toBeGreaterThanOrEqual(0);
        expect(g).toBeLessThanOrEqual(255);
        expect(b).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThanOrEqual(255);
      });
    });

    describe('rgbToHex', () => {
      it('should convert RGB to hex correctly', () => {
        expect(ColorUtils.rgbToHex(255, 0, 0)).toBe('#ff0000');
        expect(ColorUtils.rgbToHex(0, 255, 0)).toBe('#00ff00');
        expect(ColorUtils.rgbToHex(0, 0, 255)).toBe('#0000ff');
        expect(ColorUtils.rgbToHex(255, 255, 255)).toBe('#ffffff');
        expect(ColorUtils.rgbToHex(0, 0, 0)).toBe('#000000');
      });

      it('should handle intermediate values', () => {
        expect(ColorUtils.rgbToHex(128, 128, 128)).toBe('#808080');
        expect(ColorUtils.rgbToHex(255, 128, 64)).toBe('#ff8040');
      });
    });

    describe('interpolateRgb', () => {
      it('should interpolate between two colors', () => {
        const color1: [number, number, number] = [255, 0, 0]; // Red
        const color2: [number, number, number] = [0, 0, 255]; // Blue
        
        const midpoint = ColorUtils.interpolateRgb(color1, color2, 0.5);
        expect(midpoint).toEqual([128, 0, 128]); // Purple
        
        const start = ColorUtils.interpolateRgb(color1, color2, 0);
        expect(start).toEqual([255, 0, 0]); // Should be color1
        
        const end = ColorUtils.interpolateRgb(color1, color2, 1);
        expect(end).toEqual([0, 0, 255]); // Should be color2
      });
    });
  });

  describe('createPaletteTexture', () => {
    let mockGl: WebGL2RenderingContext;

    beforeEach(() => {
      // Create mock WebGL context
      mockGl = new (global as unknown as { MockWebGL2RenderingContext: new () => WebGL2RenderingContext }).MockWebGL2RenderingContext();
    });

    it('should create texture successfully with valid palette', () => {
      const palette = getColorPalette('viridis')!;
      const texture = createPaletteTexture(mockGl, palette);
      
      expect(texture).toBeTruthy();
    });

    it('should handle WebGL texture creation failure gracefully', () => {
      const mockFailingGl = {
        ...mockGl,
        createTexture: () => null
      } as unknown as WebGL2RenderingContext;
      
      const palette = getColorPalette('viridis')!;
      const texture = createPaletteTexture(mockFailingGl, palette);
      
      expect(texture).toBeNull();
    });
  });
});
