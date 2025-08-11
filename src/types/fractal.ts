// Core types for high-performance fractal rendering

export interface Complex {
  real: number;
  imag: number;
}

export type FractalType = 
  | 'mandelbrot' 
  | 'julia' 
  | 'burning-ship' 
  | 'lyapunov'
  | 'tricorn'
  | 'celtic'
  | 'perpendicular'
  | 'heart'
  | 'newton'
  | 'phoenix'
  | 'lambda';

export type ShaderPrecision = 'highp' | 'mediump' | 'lowp';

export type BufferType = 'double' | 'triple';

export type SwapStrategy = 'discard' | 'copy';

export interface FractalPreset {
  name: string;
  params: FractalParams;
  description?: string;
  id?: string;
}

export interface FractalParams {
  fractalType: FractalType;
  escapeRadius: 2 | 4 | 8;
  maxIterations: 50 | 100 | 500 | 1000;
  center: Complex;
  zoom: number;
  juliaConstant?: Complex; // Only for Julia sets
  colorPalette: string;
  precision: ShaderPrecision;
}

export interface RenderBufferConfig {
  type: BufferType;
  swapStrategy: SwapStrategy;
  width: number;
  height: number;
}

export interface WebGLContextConfig {
  version: 2;
  antialias: boolean;
  alpha: boolean;
  depth: boolean;
  stencil: boolean;
  preserveDrawingBuffer: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  gpuMemoryUsage: number;
  renderLatency: number;
  lastRenderTime: number;
}

export interface ViewportState {
  center: Complex;
  zoom: number;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  type: 'linear' | 'cyclic';
  stops?: number[];
}

export interface GestureState {
  isPanning: boolean;
  isZooming: boolean;
  lastPanPosition?: { x: number; y: number };
  lastZoomDistance?: number;
  lastZoomCenter?: { x: number; y: number };
}

// Web Worker message types
export interface WorkerMessage {
  type: 'COMPUTE_FRACTAL' | 'GENERATE_PALETTE' | 'VALIDATE_PARAMS';
  payload: unknown;
}

export interface ComputeFractalMessage extends WorkerMessage {
  type: 'COMPUTE_FRACTAL';
  payload: {
    preset: FractalPreset;
    params: FractalParams;
    viewport: ViewportState;
    samplesPerPixel?: number;
  };
}

export interface GeneratePaletteMessage extends WorkerMessage {
  type: 'GENERATE_PALETTE';
  payload: {
    paletteId: string;
    colorSpace: 'HSL' | 'RGB' | 'CIE_LAB';
    steps: number;
  };
}

// Event types for fractal exploration
export interface FractalEvent {
  type: 'ZOOM' | 'PAN' | 'PRESET_CHANGE' | 'PARAM_UPDATE' | 'RENDER_COMPLETE';
  timestamp: number;
}

export interface ZoomEvent extends FractalEvent {
  type: 'ZOOM';
  center: Complex;
  zoomFactor: number;
  zoomLevel: number;
}

export interface PanEvent extends FractalEvent {
  type: 'PAN';
  delta: Complex;
  newCenter: Complex;
}

export interface ParamUpdateEvent extends FractalEvent {
  type: 'PARAM_UPDATE';
  paramName: keyof FractalParams;
  oldValue: unknown;
  newValue: unknown;
}

// Shader compilation and hot-reloading
export interface ShaderSource {
  vertex: string;
  fragment: string;
  uniforms: Record<string, unknown>;
}

export interface ShaderCompilationResult {
  success: boolean;
  program: WebGLProgram | null;
  vertexShader: WebGLShader | null;
  fragmentShader: WebGLShader | null;
  errors: string[];
  precision: ShaderPrecision;
}

// Level of Detail (LOD) configuration
export interface LODConfig {
  enabled: boolean;
  zoomThresholds: number[];
  iterationReductions: number[];
  qualitySettings: Array<{
    maxIterations: number;
    samplesPerPixel: number;
    precision: ShaderPrecision;
  }>;
}

// Animation and keyframing
export interface KeyFrame {
  timestamp: number;
  params: Partial<FractalParams>;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface Animation {
  id: string;
  keyframes: KeyFrame[];
  duration: number;
  loop: boolean;
  autoplay: boolean;
}

// Error handling
export interface FractalError extends Error {
  code: 'WEBGL_CONTEXT_LOST' | 'SHADER_COMPILATION_FAILED' | 'WORKER_ERROR' | 'MATH_OVERFLOW' | 'PRECISION_LOSS';
  context?: Record<string, unknown>;
  recoverable: boolean;
}

// Type guards for runtime validation
export const isFractalType = (value: string): value is FractalType => {
  return ['mandelbrot', 'julia', 'burning-ship', 'lyapunov'].includes(value);
};

export const isShaderPrecision = (value: string): value is ShaderPrecision => {
  return ['highp', 'mediump', 'lowp'].includes(value);
};

export const isValidComplex = (value: unknown): value is Complex => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'real' in value &&
    'imag' in value &&
    typeof (value as Complex).real === 'number' &&
    typeof (value as Complex).imag === 'number' &&
    !isNaN((value as Complex).real) &&
    !isNaN((value as Complex).imag)
  );
};
