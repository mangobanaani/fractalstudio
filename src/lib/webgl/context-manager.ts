// High-performance WebGL context manager with triple buffering
import { 
  WebGLContextConfig, 
  RenderBufferConfig, 
  ShaderCompilationResult, 
  ShaderSource,
  FractalError
} from '@/types/fractal';

export class WebGLContextManager {
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private gl: WebGL2RenderingContext | null = null;
  private buffers: WebGLFramebuffer[] = [];
  private textures: WebGLTexture[] = [];
  private currentBufferIndex = 0;
  private config: RenderBufferConfig;
  private isContextLost = false;
  private contextLossHandlers: (() => void)[] = [];
  private contextRestoreHandlers: (() => void)[] = [];
  private workingFormat: { name: string; format: 'float32' | 'float16' | 'uint8'; precision: 'highp' | 'mediump' | 'lowp' } | null = null;

  constructor(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    bufferConfig: RenderBufferConfig,
    contextConfig: WebGLContextConfig
  ) {
    this.canvas = canvas;
    this.config = bufferConfig;
    
    // Initialize context first to check limits
    this.initializeContext(contextConfig);
    
    // Validate and adjust buffer config based on WebGL limits
    this.validateAndAdjustBufferConfig();
    
    this.setupBuffers();
    this.setupEventHandlers();
  }

  private validateAndAdjustBufferConfig(): void {
    if (!this.gl) return;
    
    const maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
    const maxFramebufferSize = this.gl.getParameter(this.gl.MAX_RENDERBUFFER_SIZE);
    const maxSize = Math.min(maxTextureSize, maxFramebufferSize);
    
    let adjustedWidth = this.config.width;
    let adjustedHeight = this.config.height;
    
    // Reduce size if it exceeds limits
    if (adjustedWidth > maxSize) {
      const ratio = maxSize / adjustedWidth;
      adjustedWidth = maxSize;
      adjustedHeight = Math.floor(adjustedHeight * ratio);
      console.warn(`Canvas width ${this.config.width} exceeds WebGL limit ${maxSize}, reducing to ${adjustedWidth}x${adjustedHeight}`);
    }
    
    if (adjustedHeight > maxSize) {
      const ratio = maxSize / adjustedHeight;
      adjustedHeight = maxSize;
      adjustedWidth = Math.floor(adjustedWidth * ratio);
      console.warn(`Canvas height ${this.config.height} exceeds WebGL limit ${maxSize}, reducing to ${adjustedWidth}x${adjustedHeight}`);
    }
    
    // Also check for reasonable minimums
    adjustedWidth = Math.max(1, adjustedWidth);
    adjustedHeight = Math.max(1, adjustedHeight);
    
    if (adjustedWidth !== this.config.width || adjustedHeight !== this.config.height) {
      console.log(`Adjusted buffer size from ${this.config.width}x${this.config.height} to ${adjustedWidth}x${adjustedHeight}`);
      this.config.width = adjustedWidth;
      this.config.height = adjustedHeight;
      
      // Update canvas size to match
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.width = adjustedWidth;
        this.canvas.height = adjustedHeight;
      }
    }
  }

  private initializeContext(config: WebGLContextConfig): void {
    const contextAttributes: WebGLContextAttributes = {
      alpha: config.alpha,
      antialias: config.antialias,
      depth: config.depth,
      stencil: config.stencil,
      preserveDrawingBuffer: config.preserveDrawingBuffer,
      powerPreference: config.powerPreference,
    };

    this.gl = this.canvas.getContext('webgl2', contextAttributes) as WebGL2RenderingContext;
    
    if (!this.gl) {
      throw this.createError(
        'WEBGL_CONTEXT_LOST',
        'Failed to get WebGL 2.0 context. This browser may not support WebGL 2.0.',
        false
      );
    }

    // Enable extensions for better performance
    this.enableExtensions();
    
    // Set up initial GL state
    this.setupInitialState();
  }

  private enableExtensions(): void {
    if (!this.gl) return;

    const extensions = [
      'EXT_color_buffer_float',
      'OES_texture_float_linear',
      'EXT_float_blend',
      'WEBGL_lose_context', // For testing context loss
    ];

    extensions.forEach(ext => {
      const extension = this.gl!.getExtension(ext);
      if (!extension) {
        console.warn(`WebGL extension ${ext} not available`);
      }
    });
  }

  private setupInitialState(): void {
    if (!this.gl) return;

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
  }

  private setupBuffers(): void {
    if (!this.gl) return;

    // Simplified approach: For now, let's disable triple buffering and render directly to canvas
    // This avoids all framebuffer complexity while we debug the issue
    console.log('Setting up direct canvas rendering (no framebuffers)');
    
    // Clear any existing buffers
    this.cleanupBuffers();
    
    // For direct rendering, we don't need framebuffers
    // Just log the WebGL capabilities for debugging
    const maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
    const maxFramebufferSize = this.gl.getParameter(this.gl.MAX_RENDERBUFFER_SIZE);
    const hasFloatTextures = !!this.gl.getExtension('EXT_color_buffer_float');
    const hasHalfFloatTextures = !!this.gl.getExtension('EXT_color_buffer_half_float');
    
    console.log('WebGL Capabilities:', {
      maxTextureSize,
      maxFramebufferSize,
      hasFloatTextures,
      hasHalfFloatTextures,
      canvasSize: `${this.config.width}x${this.config.height}`
    });
    
    // Set working format for capability reporting (conservative)
    this.workingFormat = {
      name: 'Direct Canvas',
      format: 'uint8',
      precision: 'mediump'
    };
    
    console.log('Direct canvas rendering setup complete');
  }

  private setupEventHandlers(): void {
    if (!this.canvas || this.canvas instanceof OffscreenCanvas) return;

    this.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.isContextLost = true;
      this.contextLossHandlers.forEach(handler => handler());
    });

    this.canvas.addEventListener('webglcontextrestored', () => {
      this.isContextLost = false;
      this.initializeContext({
        version: 2,
        antialias: true,
        alpha: false,
        depth: true,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance'
      });
      this.setupBuffers();
      this.contextRestoreHandlers.forEach(handler => handler());
    });
  }

  public compileShader(source: ShaderSource): ShaderCompilationResult {
    if (!this.gl) {
      return {
        success: false,
        program: null,
        vertexShader: null,
        fragmentShader: null,
        errors: ['WebGL context not available'],
        precision: 'lowp'
      };
    }

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, source.vertex);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, source.fragment);

    if (!vertexShader || !fragmentShader) {
      return {
        success: false,
        program: null,
        vertexShader,
        fragmentShader,
        errors: ['Failed to compile shaders'],
        precision: 'lowp'
      };
    }

    const program = this.gl.createProgram();
    if (!program) {
      return {
        success: false,
        program: null,
        vertexShader,
        fragmentShader,
        errors: ['Failed to create shader program'],
        precision: 'lowp'
      };
    }

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program) || 'Unknown linking error';
      this.gl.deleteProgram(program);
      return {
        success: false,
        program: null,
        vertexShader,
        fragmentShader,
        errors: [error],
        precision: 'lowp'
      };
    }

    // Detect precision
    const precision = this.detectShaderPrecision(program);

    return {
      success: true,
      program,
      vertexShader,
      fragmentShader,
      errors: [],
      precision
    };
  }

  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      console.error('Shader compilation error:', error);
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private detectShaderPrecision(_program: WebGLProgram): 'highp' | 'mediump' | 'lowp' {
    if (!this.gl) return 'lowp';

    // Check fragment shader precision
    const precision = this.gl.getShaderPrecisionFormat(this.gl.FRAGMENT_SHADER, this.gl.HIGH_FLOAT);
    
    if (precision && precision.precision > 0) {
      return 'highp';
    }

    const mediumPrecision = this.gl.getShaderPrecisionFormat(this.gl.FRAGMENT_SHADER, this.gl.MEDIUM_FLOAT);
    if (mediumPrecision && mediumPrecision.precision > 0) {
      return 'mediump';
    }

    return 'lowp';
  }

  public swapBuffers(): void {
    // For direct canvas rendering, no buffer swapping needed
    if (this.buffers.length === 0) {
      return;
    }
    
    if (this.config.type === 'triple') {
      this.currentBufferIndex = (this.currentBufferIndex + 1) % 3;
    } else {
      this.currentBufferIndex = (this.currentBufferIndex + 1) % 2;
    }
  }

  public getCurrentFramebuffer(): WebGLFramebuffer | null {
    // For direct canvas rendering, return null to use default framebuffer
    if (this.buffers.length === 0) {
      return null;
    }
    return this.buffers[this.currentBufferIndex];
  }

  public getCurrentTexture(): WebGLTexture | null {
    if (this.textures.length === 0) {
      return null;
    }
    return this.textures[this.currentBufferIndex];
  }

  public getReadFramebuffer(): WebGLFramebuffer | null {
    if (this.buffers.length === 0) {
      return null;
    }
    const readIndex = this.config.type === 'triple' 
      ? (this.currentBufferIndex + 2) % 3 
      : (this.currentBufferIndex + 1) % 2;
    return this.buffers[readIndex];
  }

  public resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    
    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    
    this.setupBuffers();
  }

  public onContextLoss(handler: () => void): void {
    this.contextLossHandlers.push(handler);
  }

  public onContextRestore(handler: () => void): void {
    this.contextRestoreHandlers.push(handler);
  }

  public isContextLostFlag(): boolean {
    return this.isContextLost;
  }

  public getContext(): WebGL2RenderingContext | null {
    return this.gl;
  }

  private cleanupBuffers(): void {
    if (!this.gl) return;

    this.buffers.forEach(buffer => {
      if (buffer) this.gl!.deleteFramebuffer(buffer);
    });

    this.textures.forEach(texture => {
      if (texture) this.gl!.deleteTexture(texture);
    });

    this.buffers = [];
    this.textures = [];
  }

  public getTextureFormatCapabilities() {
    if (!this.gl) return null;
    
    const hasFloatTextures = !!this.gl.getExtension('EXT_color_buffer_float');
    const hasHalfFloatTextures = !!this.gl.getExtension('EXT_color_buffer_half_float');
    
    // Use the actual working format determined during setup
    const format = this.workingFormat?.format || 'uint8';
    const precision = this.workingFormat?.precision || 'lowp';
    
    return {
      format,
      precision,
      hasFloatTextures,
      hasHalfFloatTextures,
      workingFormatName: this.workingFormat?.name || 'Unknown',
      maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
      maxFramebufferSize: this.gl.getParameter(this.gl.MAX_RENDERBUFFER_SIZE)
    };
  }

  public destroy(): void {
    this.cleanupBuffers();
    this.contextLossHandlers = [];
    this.contextRestoreHandlers = [];
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

// Utility function to create WebGL context with optimal settings
export function createOptimalWebGLContext(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): WebGLContextManager {
  const bufferConfig: RenderBufferConfig = {
    type: 'triple',
    swapStrategy: 'discard',
    width,
    height
  };

  const contextConfig: WebGLContextConfig = {
    version: 2,
    antialias: false, // We'll do our own AA in shaders for better performance
    alpha: false, // Not needed for fractal rendering
    depth: true,
    stencil: false,
    preserveDrawingBuffer: false, // Better performance
    powerPreference: 'high-performance'
  };

  return new WebGLContextManager(canvas, bufferConfig, contextConfig);
}
