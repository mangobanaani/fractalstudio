// High-performance WebGL fractal renderer with triple buffering
import { WebGLContextManager } from './webgl/context-manager';
import { shaderSources } from './webgl/shaders';
import { performanceMonitor } from './performance-monitor';
import { createPaletteTexture, getColorPalette } from './color-palettes';
import { getFractalPresetByType, validateFractalParams } from './fractal-presets-modular';
import {
  FractalParams,
  ViewportState,
  FractalError,
  FractalType,
  GestureState
} from '@/types/fractal';

export class FractalRenderer {
  private canvas: HTMLCanvasElement;
  private contextManager: WebGLContextManager;
  private gl: WebGL2RenderingContext;
  private shaderProgram: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private vertexArray: WebGLVertexArrayObject | null = null;
  private paletteTexture: WebGLTexture | null = null;
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  
  private currentParams: FractalParams;
  private viewport: ViewportState;
  private gestureState: GestureState = {
    isPanning: false,
    isZooming: false
  };
  
  private animationId: number | null = null;
  private startTime = performance.now();
  private isInitialized = false;
  private hotReloadEnabled = true;

  constructor(canvas: HTMLCanvasElement, initialParams: Partial<FractalParams> = {}) {
    this.canvas = canvas;
    this.currentParams = validateFractalParams(initialParams);
    
    // Initialize viewport
    this.viewport = {
      center: this.currentParams.center,
      zoom: this.currentParams.zoom,
      width: canvas.width,
      height: canvas.height,
      aspectRatio: canvas.width / canvas.height
    };

    // Initialize WebGL context
    this.contextManager = new WebGLContextManager(
      canvas,
      {
        type: 'triple',
        swapStrategy: 'discard',
        width: canvas.width,
        height: canvas.height
      },
      {
        version: 2,
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance'
      }
    );

    const gl = this.contextManager.getContext();
    if (!gl) {
      throw this.createError('WEBGL_CONTEXT_LOST', 'Failed to initialize WebGL context', false);
    }
    this.gl = gl;

    this.setupContextLossHandlers();
    this.initializeRenderer();
  }

  private setupContextLossHandlers(): void {
    this.contextManager.onContextLoss(() => {
      console.warn('WebGL context lost - stopping animation');
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      this.isInitialized = false;
    });

    this.contextManager.onContextRestore(() => {
      console.log('WebGL context restored - reinitializing');
      this.initializeRenderer();
      this.startRenderLoop();
    });
  }

  private async initializeRenderer(): Promise<void> {
    try {
      // Check texture format capabilities
      const textureCapabilities = this.contextManager.getTextureFormatCapabilities();
      if (textureCapabilities) {
        console.log('WebGL Texture Capabilities:', textureCapabilities);
        
        // Adjust shader precision based on available formats
        if (textureCapabilities.format === 'uint8' && this.currentParams.precision === 'highp') {
          console.warn('High precision not available, falling back to mediump');
          this.currentParams.precision = 'mediump';
        }
      }

      // Create geometry
      this.createGeometry();
      
      // Compile initial shader
      await this.loadShader(this.currentParams.colorPalette);
      
      // Create color palette texture
      await this.updateColorPalette(this.currentParams.colorPalette);
      
      this.isInitialized = true;
      console.log('Fractal renderer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize fractal renderer:', error);
      throw error;
    }
  }

  private createGeometry(): void {
    // Create full-screen quad vertices
    const vertices = new Float32Array([
      -1, -1,  // Bottom left
       1, -1,  // Bottom right
      -1,  1,  // Top left
       1,  1   // Top right
    ]);

    // Create and bind vertex buffer
    this.vertexBuffer = this.gl.createBuffer();
    if (!this.vertexBuffer) {
      throw this.createError('WEBGL_CONTEXT_LOST', 'Failed to create vertex buffer', true);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    // Create vertex array object
    this.vertexArray = this.gl.createVertexArray();
    if (!this.vertexArray) {
      throw this.createError('WEBGL_CONTEXT_LOST', 'Failed to create vertex array', true);
    }

    this.gl.bindVertexArray(this.vertexArray);
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
    
    // Unbind
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async loadShader(_paletteId: string): Promise<void> {
    const preset = getFractalPresetByType(this.currentParams.fractalType);
    if (!preset) {
      throw this.createError('SHADER_COMPILATION_FAILED', `Unknown fractal preset: ${this.currentParams.fractalType}`, true);
    }

    const fragmentShader = this.getFragmentShaderForPreset(this.currentParams.fractalType);
    
    const result = this.contextManager.compileShader({
      vertex: shaderSources.vertex,
      fragment: fragmentShader,
      uniforms: {}
    });

    if (!result.success || !result.program) {
      throw this.createError(
        'SHADER_COMPILATION_FAILED',
        `Shader compilation failed: ${result.errors.join(', ')}`,
        true,
        { errors: result.errors }
      );
    }

    // Clean up old program
    if (this.shaderProgram) {
      this.gl.deleteProgram(this.shaderProgram);
    }

    this.shaderProgram = result.program;
    this.gl.useProgram(this.shaderProgram);

    // Get uniform locations
    this.cacheUniformLocations();
    
    console.log(`Shader compiled successfully with ${result.precision} precision`);
  }

  private getFragmentShaderForPreset(fractalType: FractalType): string {
    switch (fractalType) {
      case 'mandelbrot':
        return shaderSources.mandelbrot;
      case 'julia':
        return shaderSources.julia;
      case 'burning-ship':
        return shaderSources.burningShip;
      case 'lyapunov':
        return shaderSources.lyapunov;
      case 'tricorn':
        return shaderSources.tricorn;
      case 'celtic':
        return shaderSources.celtic;
      case 'newton':
        return shaderSources.newton;
      case 'phoenix':
        return shaderSources.phoenix;
      case 'lambda':
        return shaderSources.lambda;
      case 'perpendicular':
        return shaderSources.perpendicular;
      case 'heart':
        return shaderSources.heart;
        
      default:
        console.warn(`No shader for fractal type: ${fractalType}, using mandelbrot`);
        return shaderSources.mandelbrot;
    }
  }

  private cacheUniformLocations(): void {
    if (!this.shaderProgram) return;

    const uniformNames = [
      'u_resolution',
      'u_center',
      'u_zoom',
      'u_maxIterations',
      'u_escapeRadius',
      'u_juliaConstant',
      'u_colorPalette',
      'u_time'
    ];

    this.uniformLocations = {};
    for (const name of uniformNames) {
      this.uniformLocations[name] = this.gl.getUniformLocation(this.shaderProgram, name);
    }
  }

  private async updateColorPalette(paletteId: string): Promise<void> {
    const palette = getColorPalette(paletteId);
    if (!palette) {
      console.warn(`Unknown palette: ${paletteId}, using default`);
      return;
    }

    // Clean up old texture
    if (this.paletteTexture) {
      this.gl.deleteTexture(this.paletteTexture);
    }

    this.paletteTexture = createPaletteTexture(this.gl, palette, 256);
    if (!this.paletteTexture) {
      throw this.createError('WEBGL_CONTEXT_LOST', 'Failed to create palette texture', true);
    }
  }

  private updateUniforms(): void {
    if (!this.shaderProgram) return;

    const time = (performance.now() - this.startTime) / 1000;

    // Update shader uniforms
    this.setUniform2f('u_resolution', this.viewport.width, this.viewport.height);
    this.setUniform2f('u_center', this.viewport.center.real, this.viewport.center.imag);
    this.setUniform1f('u_zoom', this.viewport.zoom);
    this.setUniform1i('u_maxIterations', this.currentParams.maxIterations);
    this.setUniform1f('u_escapeRadius', this.currentParams.escapeRadius);
    this.setUniform1f('u_time', time);

    // Julia constant (always set a value for Julia fractals)
    if (this.currentParams.fractalType === 'julia') {
      const juliaConstant = this.currentParams.juliaConstant || { real: -0.7269, imag: 0.1889 };
      this.setUniform2f('u_juliaConstant', juliaConstant.real, juliaConstant.imag);
    } else if (this.currentParams.juliaConstant) {
      this.setUniform2f('u_juliaConstant', 
        this.currentParams.juliaConstant.real, 
        this.currentParams.juliaConstant.imag
      );
    } else {
      // Set a default Julia constant for non-Julia fractals that might use it
      this.setUniform2f('u_juliaConstant', 0.0, 0.0);
    }

    // Bind palette texture
    if (this.paletteTexture) {
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.paletteTexture);
      this.setUniform1i('u_colorPalette', 0);
    }
  }

  private setUniform1f(name: string, value: number): void {
    const location = this.uniformLocations[name];
    if (location !== null && location !== undefined) {
      this.gl.uniform1f(location, value);
    }
  }

  private setUniform1i(name: string, value: number): void {
    const location = this.uniformLocations[name];
    if (location !== null && location !== undefined) {
      this.gl.uniform1i(location, value);
    }
  }

  private setUniform2f(name: string, x: number, y: number): void {
    const location = this.uniformLocations[name];
    if (location !== null && location !== undefined) {
      this.gl.uniform2f(location, x, y);
    }
  }

  public render(): void {
    if (!this.isInitialized || !this.shaderProgram || !this.vertexArray) {
      return;
    }

    performanceMonitor.startFrame();

    try {
      // Get current framebuffer
      const framebuffer = this.contextManager.getCurrentFramebuffer();
      
      // Bind framebuffer for offscreen rendering
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
      this.gl.viewport(0, 0, this.viewport.width, this.viewport.height);

      // Clear
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      // Use shader program
      this.gl.useProgram(this.shaderProgram);

      // Update uniforms
      this.updateUniforms();

      // Draw full-screen quad
      this.gl.bindVertexArray(this.vertexArray);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

      // Present to screen (copy from framebuffer to canvas)
      this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null);
      this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, framebuffer);
      
      this.gl.blitFramebuffer(
        0, 0, this.viewport.width, this.viewport.height,
        0, 0, this.canvas.width, this.canvas.height,
        this.gl.COLOR_BUFFER_BIT,
        this.gl.LINEAR
      );

      // Swap buffers for next frame
      this.contextManager.swapBuffers();

      // Update performance metrics
      performanceMonitor.updateGPUMemoryUsage(this.gl, this.viewport.width, this.viewport.height);

    } catch (error) {
      console.error('Render error:', error);
    } finally {
      // Clean up
      this.gl.bindVertexArray(null);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      
      performanceMonitor.endFrame();
    }
  }

  public startRenderLoop(): void {
    if (this.animationId) return;

    const renderFrame = () => {
      this.render();
      this.animationId = requestAnimationFrame(renderFrame);
    };

    this.animationId = requestAnimationFrame(renderFrame);
  }

  public stopRenderLoop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public updateParams(newParams: Partial<FractalParams>): void {
    const oldParams = { ...this.currentParams };
    this.currentParams = validateFractalParams({ ...this.currentParams, ...newParams });

    // Update viewport if center or zoom changed
    if (newParams.center) {
      this.viewport.center = this.currentParams.center;
    }
    if (newParams.zoom) {
      this.viewport.zoom = this.currentParams.zoom;
    }

    // Reload shader if fractal type changed
    if (newParams.fractalType && newParams.fractalType !== oldParams.fractalType) {
      console.log('Fractal type changed from', oldParams.fractalType, 'to', newParams.fractalType);
      this.loadShader(this.currentParams.colorPalette).catch(console.error);
    }

    // Reload shader if color palette changed
    if (newParams.colorPalette && newParams.colorPalette !== oldParams.colorPalette) {
      this.loadShader(this.currentParams.colorPalette).catch(console.error);
      this.updateColorPalette(this.currentParams.colorPalette).catch(console.error);
    }

    // Force immediate render when important parameters change
    if (newParams.center || newParams.zoom || newParams.fractalType || newParams.maxIterations) {
      // Stop the render loop temporarily to avoid conflicts
      const wasRunning = this.animationId !== null;
      if (wasRunning) {
        this.stopRenderLoop();
      }
      
      // Render immediately
      this.render();
      
      // Restart render loop if it was running
      if (wasRunning) {
        this.startRenderLoop();
      }
    }
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    
    this.viewport.width = width;
    this.viewport.height = height;
    this.viewport.aspectRatio = width / height;

    this.contextManager.resize(width, height);
    this.gl.viewport(0, 0, width, height);
  }

  public zoom(factor: number, centerX?: number, centerY?: number): void {
    if (centerX !== undefined && centerY !== undefined) {
      // Zoom towards a specific point
      const normalizedX = centerX / this.viewport.width;
      const normalizedY = centerY / this.viewport.height;
      
      // Convert to complex coordinates
      const aspectRatio = this.viewport.aspectRatio;
      const complexX = (normalizedX - 0.5) * aspectRatio * this.viewport.zoom + this.viewport.center.real;
      const complexY = (normalizedY - 0.5) * this.viewport.zoom + this.viewport.center.imag;
      
      // Update zoom and center
      this.viewport.zoom /= factor;
      
      // Adjust center to zoom towards the point
      const newComplexX = (normalizedX - 0.5) * aspectRatio * this.viewport.zoom + this.viewport.center.real;
      const newComplexY = (normalizedY - 0.5) * this.viewport.zoom + this.viewport.center.imag;
      
      this.viewport.center = {
        real: this.viewport.center.real + (complexX - newComplexX),
        imag: this.viewport.center.imag + (complexY - newComplexY)
      };
    } else {
      // Simple zoom
      this.viewport.zoom /= factor;
    }

    this.currentParams.zoom = this.viewport.zoom;
    this.currentParams.center = this.viewport.center;
  }

  public pan(deltaX: number, deltaY: number): void {
    const aspectRatio = this.viewport.aspectRatio;
    const scale = this.viewport.zoom / Math.min(this.viewport.width, this.viewport.height);
    
    this.viewport.center = {
      real: this.viewport.center.real - deltaX * scale * aspectRatio,
      imag: this.viewport.center.imag + deltaY * scale // Flip Y for screen coordinates
    };

    this.currentParams.center = this.viewport.center;
  }

  public getParams(): FractalParams {
    return { ...this.currentParams };
  }

  public getViewport(): ViewportState {
    return { ...this.viewport };
  }

  public destroy(): void {
    this.stopRenderLoop();
    
    // Clean up WebGL resources
    if (this.vertexBuffer) this.gl.deleteBuffer(this.vertexBuffer);
    if (this.vertexArray) this.gl.deleteVertexArray(this.vertexArray);
    if (this.paletteTexture) this.gl.deleteTexture(this.paletteTexture);
    if (this.shaderProgram) this.gl.deleteProgram(this.shaderProgram);
    
    this.contextManager.destroy();
  }

  private createError(
    code: FractalError['code'],
    message: string,
    recoverable: boolean,
    context?: Record<string, unknown>
  ): FractalError {
    const error = new Error(message) as FractalError;
    error.code = code;
    error.recoverable = recoverable;
    error.context = context;
    return error;
  }
}
