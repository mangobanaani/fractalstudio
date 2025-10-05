import '@testing-library/jest-dom'

// Mock WebGL context for testing
class MockWebGL2RenderingContext {
  canvas = { width: 800, height: 600 }

  createShader() { return {} }
  createProgram() { return {} }
  createBuffer() { return {} }
  createTexture() { return {} }
  createFramebuffer() { return {} }
  createVertexArray() { return {} }

  shaderSource() {}
  compileShader() {}
  getShaderParameter() { return true }
  getShaderInfoLog() { return '' }
  attachShader() {}
  linkProgram() {}
  getProgramParameter() { return true }
  getProgramInfoLog() { return '' }
  useProgram() {}

  getUniformLocation() { return {} }
  uniform1f() {}
  uniform1i() {}
  uniform2f() {}

  bindBuffer() {}
  bufferData() {}
  vertexAttribPointer() {}
  enableVertexAttribArray() {}

  bindVertexArray() {}
  bindTexture() {}
  texImage2D() {}
  texParameteri() {}

  bindFramebuffer() {}
  framebufferTexture2D() {}
  checkFramebufferStatus() { return 36053 } // FRAMEBUFFER_COMPLETE

  viewport() {}
  clear() {}
  drawArrays() {}
  blitFramebuffer() {}

  deleteShader() {}
  deleteProgram() {}
  deleteBuffer() {}
  deleteTexture() {}
  deleteFramebuffer() {}
  deleteVertexArray() {}

  getParameter() { return 'Mock WebGL Renderer' }
  getExtension() { return null }
  getShaderPrecisionFormat() { return { precision: 23 } }

  // Constants
  VERTEX_SHADER = 35633
  FRAGMENT_SHADER = 35632
  COMPILE_STATUS = 35713
  LINK_STATUS = 35714
  ARRAY_BUFFER = 34962
  STATIC_DRAW = 35044
  FLOAT = 5126
  TEXTURE_2D = 3553
  RGBA = 6408
  RGBA32F = 34836
  UNSIGNED_BYTE = 5121
  LINEAR = 9729
  CLAMP_TO_EDGE = 33071
  TEXTURE_MIN_FILTER = 10241
  TEXTURE_MAG_FILTER = 10240
  TEXTURE_WRAP_S = 10242
  TEXTURE_WRAP_T = 10243
  FRAMEBUFFER = 36160
  COLOR_ATTACHMENT0 = 36064
  FRAMEBUFFER_COMPLETE = 36053
  COLOR_BUFFER_BIT = 16384
  TRIANGLE_STRIP = 5
  READ_FRAMEBUFFER = 36008
  DRAW_FRAMEBUFFER = 36009
  RENDERER = 7937
  VENDOR = 7936
  HIGH_FLOAT = 36338
  MEDIUM_FLOAT = 36337
}

// Make MockWebGL2RenderingContext available globally for tests
global.MockWebGL2RenderingContext = MockWebGL2RenderingContext

// Mock HTMLCanvasElement.getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function(contextType, options) {
  if (contextType === 'webgl2' || contextType === 'webgl') {
    return new MockWebGL2RenderingContext()
  }
  return originalGetContext.call(this, contextType, options)
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock PerformanceObserver
global.PerformanceObserver = class PerformanceObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  disconnect() {}
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16)
}

global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

// Mock performance.now
global.performance = {
  ...global.performance,
  now: () => Date.now()
}
