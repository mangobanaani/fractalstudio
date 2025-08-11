// Performance monitoring and optimization system
import { PerformanceMetrics, LODConfig } from '@/types/fractal';

export class PerformanceMonitor {
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private frameStartTime = 0;
  private renderTimes: number[] = [];
  private readonly maxSamples = 60; // Keep last 60 samples
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    gpuMemoryUsage: 0,
    renderLatency: 0,
    lastRenderTime: 0
  };

  private lodConfig: LODConfig = {
    enabled: true,
    zoomThresholds: [1, 10, 100, 1000],
    iterationReductions: [1, 0.8, 0.6, 0.4],
    qualitySettings: [
      { maxIterations: 1000, samplesPerPixel: 4, precision: 'highp' },
      { maxIterations: 500, samplesPerPixel: 2, precision: 'highp' },
      { maxIterations: 100, samplesPerPixel: 1, precision: 'mediump' },
      { maxIterations: 50, samplesPerPixel: 1, precision: 'lowp' }
    ]
  };

  constructor() {
    this.setupPerformanceObserver();
  }

  // Start measuring frame performance
  startFrame(): void {
    this.frameStartTime = performance.now();
  }

  // End frame measurement and update metrics
  endFrame(): void {
    const frameTime = performance.now() - this.frameStartTime;
    this.renderTimes.push(frameTime);

    // Keep only recent samples
    if (this.renderTimes.length > this.maxSamples) {
      this.renderTimes.shift();
    }

    this.frameCount++;
    const now = performance.now();

    // Update FPS every second
    if (now - this.lastFpsUpdate >= 1000) {
      this.metrics.fps = (this.frameCount * 1000) / (now - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    // Update average frame time
    this.metrics.frameTime = this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
    this.metrics.lastRenderTime = frameTime;
    this.metrics.renderLatency = frameTime;
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Check if performance is acceptable (60FPS target)
  isPerformanceAcceptable(): boolean {
    return this.metrics.fps >= 58 && this.metrics.frameTime <= 17; // ~60FPS with tolerance
  }

  // Get recommended LOD level based on current performance
  getRecommendedLOD(zoom: number): number {
    const { zoomThresholds } = this.lodConfig;
    
    // Base LOD on zoom level
    let lodLevel = 0;
    for (let i = 0; i < zoomThresholds.length; i++) {
      if (zoom > zoomThresholds[i]) {
        lodLevel = i + 1;
      }
    }

    // Adjust based on performance
    if (!this.isPerformanceAcceptable() && lodLevel < this.lodConfig.qualitySettings.length - 1) {
      lodLevel++;
    } else if (this.metrics.fps > 65 && lodLevel > 0) {
      lodLevel--; // Can increase quality
    }

    return Math.min(lodLevel, this.lodConfig.qualitySettings.length - 1);
  }

  // Get quality settings for a given LOD level
  getQualitySettings(lodLevel: number) {
    return this.lodConfig.qualitySettings[Math.min(lodLevel, this.lodConfig.qualitySettings.length - 1)];
  }

  // Estimate GPU memory usage
  estimateGPUMemory(width: number, height: number, bufferCount: number = 3): number {
    // Estimate memory usage in MB
    const bytesPerPixel = 16; // RGBA32F = 16 bytes per pixel
    const textureMemory = (width * height * bytesPerPixel * bufferCount) / (1024 * 1024);
    
    // Add overhead for shaders, uniforms, etc.
    const overhead = 10; // MB
    
    return textureMemory + overhead;
  }

  // Monitor GPU memory if available
  updateGPUMemoryUsage(gl: WebGL2RenderingContext, width: number, height: number): void {
    // WebGL doesn't provide direct memory queries, so we estimate
    this.metrics.gpuMemoryUsage = this.estimateGPUMemory(width, height);

    // Check for WebGL memory info extension (if available)
    const memoryInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (memoryInfo) {
      // This extension provides renderer info but not memory usage
      // We'll keep our estimation approach
    }
  }

  // Configure LOD settings
  configureLOD(config: Partial<LODConfig>): void {
    this.lodConfig = { ...this.lodConfig, ...config };
  }

  // Performance profiler for specific operations
  profile<T>(operation: () => T, name: string): T {
    const start = performance.now();
    const result = operation();
    const duration = performance.now() - start;
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }

  // Async performance profiler
  async profileAsync<T>(operation: () => Promise<T>, name: string): Promise<T> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }

  private setupPerformanceObserver(): void {
    // Use Performance Observer API if available
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              console.log(`[Performance] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch {
        console.warn('Performance Observer not supported or failed to initialize');
      }
    }
  }

  // Debounced parameter update to prevent render stalls
  createDebouncedUpdater<T>(
    updateFn: (value: T) => void,
    delay: number = 50
  ): (value: T) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (value: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        updateFn(value);
        timeoutId = null;
      }, delay);
    };
  }

  // Adaptive quality based on performance
  getAdaptiveQuality(baseIterations: number): {
    maxIterations: number;
    samplesPerPixel: number;
    precision: 'highp' | 'mediump' | 'lowp';
  } {
    const performanceRatio = Math.min(1, this.metrics.fps / 60);
    
    let quality: typeof this.lodConfig.qualitySettings[0];
    
    if (performanceRatio >= 0.95) {
      // Excellent performance - max quality
      quality = this.lodConfig.qualitySettings[0];
    } else if (performanceRatio >= 0.8) {
      // Good performance - high quality
      quality = this.lodConfig.qualitySettings[1];
    } else if (performanceRatio >= 0.6) {
      // Acceptable performance - medium quality
      quality = this.lodConfig.qualitySettings[2];
    } else {
      // Poor performance - low quality
      quality = this.lodConfig.qualitySettings[3];
    }

    return {
      maxIterations: Math.min(baseIterations, quality.maxIterations),
      samplesPerPixel: quality.samplesPerPixel,
      precision: quality.precision
    };
  }

  // Performance analytics for optimization
  getPerformanceReport(): {
    averageFPS: number;
    averageFrameTime: number;
    maxFrameTime: number;
    minFrameTime: number;
    performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
  } {
    const avgFrameTime = this.metrics.frameTime;
    const maxFrameTime = Math.max(...this.renderTimes);
    const minFrameTime = Math.min(...this.renderTimes);
    
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    const recommendations: string[] = [];
    
    if (this.metrics.fps >= 58) {
      grade = 'A';
    } else if (this.metrics.fps >= 45) {
      grade = 'B';
      recommendations.push('Consider reducing anti-aliasing samples');
    } else if (this.metrics.fps >= 30) {
      grade = 'C';
      recommendations.push('Reduce maximum iterations');
      recommendations.push('Enable LOD system');
    } else if (this.metrics.fps >= 20) {
      grade = 'D';
      recommendations.push('Use lower precision shaders');
      recommendations.push('Reduce render resolution');
    } else {
      grade = 'F';
      recommendations.push('Switch to mediump precision');
      recommendations.push('Significantly reduce iteration count');
      recommendations.push('Consider using Web Worker for computation');
    }
    
    if (maxFrameTime > 50) {
      recommendations.push('Frame time spikes detected - check for blocking operations');
    }
    
    if (this.metrics.gpuMemoryUsage > 500) {
      recommendations.push('High GPU memory usage - consider reducing buffer count');
    }

    return {
      averageFPS: this.metrics.fps,
      averageFrameTime: avgFrameTime,
      maxFrameTime,
      minFrameTime,
      performanceGrade: grade,
      recommendations
    };
  }

  // Reset performance counters
  reset(): void {
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.renderTimes = [];
    this.metrics = {
      fps: 0,
      frameTime: 0,
      gpuMemoryUsage: 0,
      renderLatency: 0,
      lastRenderTime: 0
    };
  }
}

// Device capability detection
export class DeviceCapabilityDetector {
  static detectGPUTier(): 'high' | 'medium' | 'low' {
    // This is a simplified detection - in a real app you'd want more sophisticated detection
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return 'low';

    const renderer = gl.getParameter(gl.RENDERER);
    
    // High-end GPUs
    if (renderer.includes('RTX') || 
        renderer.includes('GTX 1060') || 
        renderer.includes('RX 580') ||
        renderer.includes('Apple M') ||
        renderer.includes('Adreno 6')) {
      return 'high';
    }
    
    // Medium GPUs
    if (renderer.includes('GTX') || 
        renderer.includes('RX') ||
        renderer.includes('Adreno') ||
        renderer.includes('Mali-G')) {
      return 'medium';
    }
    
    return 'low';
  }

  static getMemoryInfo(): { jsHeapSizeLimit?: number; totalJSHeapSize?: number; usedJSHeapSize?: number } {
    // TypeScript-friendly way to access memory info
    const perf = performance as unknown as {
      memory?: {
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
        usedJSHeapSize: number;
      };
    };

    return perf.memory || {};
  }

  static getMaxTextureSize(gl: WebGL2RenderingContext): number {
    return gl.getParameter(gl.MAX_TEXTURE_SIZE);
  }

  static supportsHighPrecision(gl: WebGL2RenderingContext): boolean {
    const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    return precision ? precision.precision > 0 : false;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();
