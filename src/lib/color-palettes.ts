// Advanced color palette system for fractal visualization
import { ColorPalette } from '@/types/fractal';

// Color space conversion utilities
export class ColorUtils {
  // Convert HSL to RGB
  static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h = h % 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));

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

  // Convert RGB to hex
  static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // CIE LAB color space approximation for perceptually uniform gradients
  static labToRgb(l: number, a: number, b: number): [number, number, number] {
    // Simplified LAB to XYZ to RGB conversion
    let y = (l + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;

    const delta = 6 / 29;
    x = 0.95047 * (x > delta ? x * x * x : 3 * delta * delta * (x - 4 / 29));
    y = 1.00000 * (y > delta ? y * y * y : 3 * delta * delta * (y - 4 / 29));
    z = 1.08883 * (z > delta ? z * z * z : 3 * delta * delta * (z - 4 / 29));

    // XYZ to RGB (sRGB)
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let blue = x * 0.0557 + y * -0.2040 + z * 1.0570;

    // Gamma correction
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    blue = blue > 0.0031308 ? 1.055 * Math.pow(blue, 1 / 2.4) - 0.055 : 12.92 * blue;

    return [
      Math.max(0, Math.min(255, Math.round(r * 255))),
      Math.max(0, Math.min(255, Math.round(g * 255))),
      Math.max(0, Math.min(255, Math.round(blue * 255)))
    ];
  }

  // Interpolate between two colors in RGB space
  static interpolateRgb(
    color1: [number, number, number],
    color2: [number, number, number],
    t: number
  ): [number, number, number] {
    return [
      Math.round(color1[0] + (color2[0] - color1[0]) * t),
      Math.round(color1[1] + (color2[1] - color1[1]) * t),
      Math.round(color1[2] + (color2[2] - color1[2]) * t)
    ];
  }
}

// Predefined color palettes inspired by matplotlib and scientific visualization
export const colorPalettes: ColorPalette[] = [
  {
    id: 'viridis',
    name: 'Viridis',
    type: 'linear',
    colors: [
      '#440154', '#482777', '#3f4a8a', '#31678e', '#26838f',
      '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'
    ]
  },
  {
    id: 'plasma',
    name: 'Plasma',
    type: 'linear',
    colors: [
      '#0d0887', '#4c02a1', '#7e03a8', '#a92395', '#cc4778',
      '#e56b5d', '#f89441', '#fdc328', '#f0f921'
    ]
  },
  {
    id: 'inferno',
    name: 'Inferno',
    type: 'linear',
    colors: [
      '#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60',
      '#cf4446', '#ed6925', '#fb9b06', '#f7d03c', '#fcffa4'
    ]
  },
  {
    id: 'magma',
    name: 'Magma',
    type: 'linear',
    colors: [
      '#000004', '#140e36', '#3b0f70', '#641a80', '#8c2981',
      '#b73779', '#de4968', '#f7705c', '#fe9f6d', '#fecf92', '#fcfdbf'
    ]
  },
  {
    id: 'cividis',
    name: 'Cividis',
    type: 'linear',
    colors: [
      '#00204d', '#00336f', '#0f4d8c', '#3968a1', '#5d82b0',
      '#839bb8', '#aab3bd', '#d1ccc0', '#fde725'
    ]
  },
  {
    id: 'twilight',
    name: 'Twilight',
    type: 'cyclic',
    colors: [
      '#e2d9e2', '#9ebbd8', '#6785be', '#4e62a8', '#3e4e8a',
      '#2e3f5f', '#1e2f35', '#1a252f', '#2e3f5f', '#4e62a8',
      '#6785be', '#9ebbd8', '#e2d9e2'
    ]
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'linear',
    colors: [
      '#000033', '#000055', '#000077', '#003399', '#0066cc',
      '#3399ff', '#66ccff', '#99eeff', '#ccffff'
    ]
  },
  {
    id: 'fire',
    name: 'Fire',
    type: 'linear',
    colors: [
      '#000000', '#330000', '#660000', '#990000', '#cc0000',
      '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ffff00'
    ]
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    type: 'cyclic',
    colors: [
      '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00',
      '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff',
      '#ff00ff', '#ff0080'
    ]
  },
  {
    id: 'electric',
    name: 'Electric',
    type: 'linear',
    colors: [
      '#000000', '#1a0033', '#330066', '#4d0099', '#6600cc',
      '#8000ff', '#9933ff', '#b366ff', '#cc99ff', '#e6ccff'
    ]
  }
];

// Generate smooth gradient between colors
export function generateSmoothGradient(
  colors: string[],
  steps: number = 256
): string[] {
  if (colors.length < 2) return colors;

  const gradient: string[] = [];
  const segmentSize = steps / (colors.length - 1);

  for (let i = 0; i < steps; i++) {
    const segmentIndex = Math.floor(i / segmentSize);
    const segmentT = (i % segmentSize) / segmentSize;

    const color1Index = Math.min(segmentIndex, colors.length - 2);
    const color2Index = color1Index + 1;

    const color1 = hexToRgb(colors[color1Index]);
    const color2 = hexToRgb(colors[color2Index]);

    if (color1 && color2) {
      const interpolated = ColorUtils.interpolateRgb(color1, color2, segmentT);
      gradient.push(ColorUtils.rgbToHex(...interpolated));
    }
  }

  return gradient;
}

// Convert hex color to RGB tuple
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

// Create WebGL texture from color palette
export function createPaletteTexture(
  gl: WebGL2RenderingContext,
  palette: ColorPalette,
  resolution: number = 256
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;

  // Generate smooth gradient
  const gradientColors = generateSmoothGradient(palette.colors, resolution);
  
  // Convert to RGBA data
  const data = new Uint8Array(resolution * 4);
  
  for (let i = 0; i < resolution; i++) {
    const rgb = hexToRgb(gradientColors[i]);
    if (rgb) {
      const index = i * 4;
      data[index] = rgb[0];     // R
      data[index + 1] = rgb[1]; // G
      data[index + 2] = rgb[2]; // B
      data[index + 3] = 255;    // A
    }
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    resolution,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    data
  );

  // Set texture parameters for smooth interpolation
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

// Get palette by ID
export function getColorPalette(id: string): ColorPalette | null {
  return colorPalettes.find(palette => palette.id === id) || null;
}

// Get all available palette IDs
export function getColorPaletteIds(): string[] {
  return colorPalettes.map(palette => palette.id);
}

// Generate procedural palette based on HSL parameters
export function generateProceduralPalette(
  hueStart: number,
  hueEnd: number,
  saturation: number,
  lightnessStart: number,
  lightnessEnd: number,
  steps: number = 256
): string[] {
  const colors: string[] = [];

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    
    const hue = hueStart + (hueEnd - hueStart) * t;
    const lightness = lightnessStart + (lightnessEnd - lightnessStart) * t;
    
    const [r, g, b] = ColorUtils.hslToRgb(hue, saturation, lightness);
    colors.push(ColorUtils.rgbToHex(r, g, b));
  }

  return colors;
}

// Create custom palette from user input
export function createCustomPalette(
  name: string,
  colors: string[],
  type: 'linear' | 'cyclic' = 'linear'
): ColorPalette {
  return {
    id: `custom-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name,
    type,
    colors: colors.filter(color => /^#[0-9a-fA-F]{6}$/.test(color))
  };
}

// Analyze palette for contrast and accessibility
export function analyzePalette(palette: ColorPalette): {
  averageContrast: number;
  colorBlindSafe: boolean;
  dynamicRange: number;
} {
  const colors = palette.colors.map(hex => hexToRgb(hex)).filter(Boolean) as [number, number, number][];
  
  // Calculate average contrast between adjacent colors
  let totalContrast = 0;
  for (let i = 0; i < colors.length - 1; i++) {
    const contrast = calculateLuminanceContrast(colors[i], colors[i + 1]);
    totalContrast += contrast;
  }
  const averageContrast = totalContrast / (colors.length - 1);

  // Simple color blind safety check (avoid problematic red-green combinations)
  const colorBlindSafe = !colors.some((color, i) => {
    if (i === colors.length - 1) return false;
    const next = colors[i + 1];
    return Math.abs(color[0] - color[1]) < 30 && Math.abs(next[0] - next[1]) < 30;
  });

  // Calculate dynamic range (difference between lightest and darkest)
  const luminances = colors.map(calculateLuminance);
  const dynamicRange = Math.max(...luminances) - Math.min(...luminances);

  return {
    averageContrast,
    colorBlindSafe,
    dynamicRange
  };
}

// Calculate relative luminance of a color
function calculateLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
function calculateLuminanceContrast(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const lum1 = calculateLuminance(color1);
  const lum2 = calculateLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}
