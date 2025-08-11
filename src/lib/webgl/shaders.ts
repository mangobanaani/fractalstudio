// GLSL shader sources for fractal rendering
export const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_texCoord;

void main() {
    v_texCoord = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export const MANDELBROT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 complexSquare(vec2 z) {
    return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
}

float mandelbrotIteration(vec2 c) {
    vec2 z = vec2(0.0);
    float iterations = 0.0;
    
    for (int i = 0; i < 1000; i++) {
        if (i >= u_maxIterations) break;
        
        float zMagnitudeSquared = dot(z, z);
        if (zMagnitudeSquared > u_escapeRadius * u_escapeRadius) {
            // Smooth iteration count for better coloring
            float smoothIteration = float(i) + 1.0 - log2(log2(zMagnitudeSquared) * 0.5);
            return smoothIteration;
        }
        
        z = complexSquare(z) + c;
        iterations += 1.0;
    }
    
    return iterations;
}

vec3 getColor(float iteration) {
    if (iteration >= float(u_maxIterations)) {
        return vec3(0.0); // Interior color (black)
    }
    
    // Normalize iteration to [0, 1]
    float normalizedIteration = iteration / float(u_maxIterations);
    
    // Sample color palette
    vec3 color = texture(u_colorPalette, vec2(normalizedIteration, 0.5)).rgb;
    
    // Add subtle animation
    float wave = sin(u_time * 2.0 + normalizedIteration * 10.0) * 0.1 + 0.9;
    return color * wave;
}

void main() {
    // Convert screen coordinates to complex plane
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    
    // Transform to fractal coordinates (higher zoom = more zoomed in)
    vec2 c = (uv - 0.5) * aspect / u_zoom + u_center;
    
    // Calculate fractal iteration
    float iteration = mandelbrotIteration(c);
    
    // Get final color
    vec3 color = getColor(iteration);
    
    fragColor = vec4(color, 1.0);
}`;

export const JULIA_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform vec2 u_juliaConstant;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 complexSquare(vec2 z) {
    return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
}

float juliaIteration(vec2 z) {
    float iterations = 0.0;
    
    // Use a default Julia constant if u_juliaConstant is not set properly
    vec2 juliaC = u_juliaConstant;
    if (length(juliaC) == 0.0) {
        juliaC = vec2(-0.7269, 0.1889); // Default beautiful Julia constant
    }
    
    for (int i = 0; i < 1000; i++) {
        if (i >= u_maxIterations) break;
        
        float zMagnitudeSquared = dot(z, z);
        if (zMagnitudeSquared > u_escapeRadius * u_escapeRadius) {
            float smoothIteration = float(i) + 1.0 - log2(log2(zMagnitudeSquared) * 0.5);
            return smoothIteration;
        }
        
        z = complexSquare(z) + juliaC;
        iterations += 1.0;
    }
    
    return iterations;
}

vec3 getColor(float iteration) {
    if (iteration >= float(u_maxIterations)) {
        return vec3(0.0);
    }
    
    float normalizedIteration = iteration / float(u_maxIterations);
    vec3 color = texture(u_colorPalette, vec2(normalizedIteration, 0.5)).rgb;
    
    // Different animation pattern for Julia sets
    float wave = cos(u_time * 1.5 + normalizedIteration * 8.0) * 0.15 + 0.85;
    return color * wave;
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 z = (uv - 0.5) * aspect / u_zoom + u_center;
    
    float iteration = juliaIteration(z);
    vec3 color = getColor(iteration);
    
    fragColor = vec4(color, 1.0);
}`;

export const BURNING_SHIP_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 complexSquareAbs(vec2 z) {
    // Burning ship uses abs(z) before squaring
    vec2 absZ = abs(z);
    return vec2(absZ.x * absZ.x - absZ.y * absZ.y, 2.0 * absZ.x * absZ.y);
}

float burningShipIteration(vec2 c) {
    vec2 z = vec2(0.0);
    float iterations = 0.0;
    
    for (int i = 0; i < 1000; i++) {
        if (i >= u_maxIterations) break;
        
        float zMagnitudeSquared = dot(z, z);
        if (zMagnitudeSquared > u_escapeRadius * u_escapeRadius) {
            float smoothIteration = float(i) + 1.0 - log2(log2(zMagnitudeSquared) * 0.5);
            return smoothIteration;
        }
        
        z = complexSquareAbs(z) + c;
        iterations += 1.0;
    }
    
    return iterations;
}

vec3 getColor(float iteration) {
    if (iteration >= float(u_maxIterations)) {
        return vec3(0.1, 0.0, 0.05); // Darker interior for burning ship
    }
    
    float normalizedIteration = iteration / float(u_maxIterations);
    vec3 color = texture(u_colorPalette, vec2(normalizedIteration, 0.5)).rgb;
    
    // Fire-like animation
    float flame = sin(u_time * 3.0 + normalizedIteration * 15.0) * 0.2 + 0.8;
    color.r *= flame * 1.2; // Enhance red channel for fire effect
    
    return color;
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    
    // Burning ship is typically viewed with flipped y-axis
    vec2 c = (uv - 0.5) * aspect / u_zoom + u_center;
    c.y = -c.y;
    
    float iteration = burningShipIteration(c);
    vec3 color = getColor(iteration);
    
    fragColor = vec4(color, 1.0);
}`;

export const LYAPUNOV_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

// Lyapunov fractal using logistic map
float lyapunovIteration(vec2 coord) {
    float a = coord.x;
    float b = coord.y;
    
    float x = 0.5; // Initial value
    float lyapunov = 0.0;
    
    // Use a simple AB pattern
    for (int i = 0; i < 1000; i++) {
        if (i >= u_maxIterations) break;
        
        float r = (i % 2 == 0) ? a : b;
        
        if (r <= 0.0 || r >= 4.0 || x <= 0.0 || x >= 1.0) {
            return -10.0; // Divergent
        }
        
        float derivative = r * (1.0 - 2.0 * x);
        lyapunov += log(abs(derivative));
        
        x = r * x * (1.0 - x);
    }
    
    return lyapunov / float(u_maxIterations);
}

vec3 getColor(float lyapunov) {
    // Color based on Lyapunov exponent
    float normalizedLyapunov = (lyapunov + 2.0) / 4.0; // Normalize to [0, 1]
    normalizedLyapunov = clamp(normalizedLyapunov, 0.0, 1.0);
    
    vec3 color = texture(u_colorPalette, vec2(normalizedLyapunov, 0.5)).rgb;
    
    // Subtle oscillation
    float wave = sin(u_time + normalizedLyapunov * 6.28) * 0.1 + 0.9;
    return color * wave;
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 coord = (uv - 0.5) * aspect / u_zoom + u_center;
    
    // Map to parameter space [0, 4] x [0, 4]
    coord = (coord + vec2(2.0)) * 2.0;
    
    float lyapunov = lyapunovIteration(coord);
    vec3 color = getColor(lyapunov);
    
    fragColor = vec4(color, 1.0);
}`;

// Compute shader for enhanced performance (WebGL 2.0)
export const COMPUTE_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform int u_fractalType; // 0: Mandelbrot, 1: Julia, 2: Burning Ship, 3: Lyapunov
uniform vec2 u_juliaConstant;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

// Unified function for all fractal types
float calculateFractal(vec2 coord, int fractalType) {
    if (fractalType == 0) {
        // Mandelbrot
        vec2 z = vec2(0.0);
        for (int i = 0; i < 1000; i++) {
            if (i >= u_maxIterations) break;
            if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
                return float(i) + 1.0 - log2(log2(dot(z, z)) * 0.5);
            }
            z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + coord;
        }
        return float(u_maxIterations);
    } else if (fractalType == 1) {
        // Julia
        vec2 z = coord;
        for (int i = 0; i < 1000; i++) {
            if (i >= u_maxIterations) break;
            if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
                return float(i) + 1.0 - log2(log2(dot(z, z)) * 0.5);
            }
            z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + u_juliaConstant;
        }
        return float(u_maxIterations);
    } else if (fractalType == 2) {
        // Burning Ship
        vec2 z = vec2(0.0);
        coord.y = -coord.y; // Flip y-axis
        for (int i = 0; i < 1000; i++) {
            if (i >= u_maxIterations) break;
            if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
                return float(i) + 1.0 - log2(log2(dot(z, z)) * 0.5);
            }
            vec2 absZ = abs(z);
            z = vec2(absZ.x * absZ.x - absZ.y * absZ.y, 2.0 * absZ.x * absZ.y) + coord;
        }
        return float(u_maxIterations);
    }
    
    return 0.0; // Fallback
}

vec3 getColor(float iteration, int fractalType) {
    if (iteration >= float(u_maxIterations)) {
        return fractalType == 2 ? vec3(0.1, 0.0, 0.05) : vec3(0.0);
    }
    
    float normalizedIteration = iteration / float(u_maxIterations);
    vec3 color = texture(u_colorPalette, vec2(normalizedIteration, 0.5)).rgb;
    
    // Different animation patterns per fractal type
    float wave;
    if (fractalType == 0) {
        wave = sin(u_time * 2.0 + normalizedIteration * 10.0) * 0.1 + 0.9;
    } else if (fractalType == 1) {
        wave = cos(u_time * 1.5 + normalizedIteration * 8.0) * 0.15 + 0.85;
    } else {
        wave = sin(u_time * 3.0 + normalizedIteration * 15.0) * 0.2 + 0.8;
        color.r *= wave * 1.2; // Fire effect for burning ship
        return color;
    }
    
    return color * wave;
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 coord = (uv - 0.5) * aspect / u_zoom + u_center;
    
    float iteration = calculateFractal(coord, u_fractalType);
    vec3 color = getColor(iteration, u_fractalType);
    
    fragColor = vec4(color, 1.0);
}`;

// Anti-aliasing post-process shader
export const AA_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_aaStrength;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    
    // FXAA-style edge detection and smoothing
    vec3 center = texture(u_texture, v_texCoord).rgb;
    vec3 north = texture(u_texture, v_texCoord + vec2(0.0, texelSize.y)).rgb;
    vec3 south = texture(u_texture, v_texCoord - vec2(0.0, texelSize.y)).rgb;
    vec3 east = texture(u_texture, v_texCoord + vec2(texelSize.x, 0.0)).rgb;
    vec3 west = texture(u_texture, v_texCoord - vec2(texelSize.x, 0.0)).rgb;
    
    // Calculate luminance for edge detection
    float lumCenter = dot(center, vec3(0.299, 0.587, 0.114));
    float lumNorth = dot(north, vec3(0.299, 0.587, 0.114));
    float lumSouth = dot(south, vec3(0.299, 0.587, 0.114));
    float lumEast = dot(east, vec3(0.299, 0.587, 0.114));
    float lumWest = dot(west, vec3(0.299, 0.587, 0.114));
    
    float edgeH = abs(lumNorth - lumSouth);
    float edgeV = abs(lumEast - lumWest);
    float edge = max(edgeH, edgeV);
    
    // Apply smoothing based on edge strength
    vec3 smoothed = (center + north + south + east + west) * 0.2;
    vec3 finalColor = mix(center, smoothed, edge * u_aaStrength);
    
    fragColor = vec4(finalColor, 1.0);
}`;

export const TRICORN_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float tricornEscape(vec2 c) {
    vec2 z = vec2(0.0, 0.0);
    
    for (int i = 0; i < u_maxIterations; i++) {
        if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
            return float(i);
        }
        
        // Tricorn: conjugate(z)^2 + c
        vec2 zConj = vec2(z.x, -z.y);
        z = complexMul(zConj, zConj) + c;
    }
    
    return float(u_maxIterations);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 coord = (uv - 0.5) * aspect / u_zoom + u_center;
    
    float escape = tricornEscape(coord);
    float t = escape / float(u_maxIterations);
    
    if (t >= 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        vec3 color = texture(u_colorPalette, vec2(t, 0.5)).rgb;
        fragColor = vec4(color, 1.0);
    }
}`;

export const CELTIC_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float celticEscape(vec2 c) {
    vec2 z = vec2(0.0, 0.0);
    
    for (int i = 0; i < u_maxIterations; i++) {
        if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
            return float(i);
        }
        
        // Celtic: (|Re(z^2)| + i*Im(z^2)) + c
        vec2 z2 = complexMul(z, z);
        z = vec2(abs(z2.x), z2.y) + c;
    }
    
    return float(u_maxIterations);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 coord = (uv - 0.5) * aspect / u_zoom + u_center;
    
    float escape = celticEscape(coord);
    float t = escape / float(u_maxIterations);
    
    if (t >= 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        vec3 color = texture(u_colorPalette, vec2(t, 0.5)).rgb;
        fragColor = vec4(color, 1.0);
    }
}`;

export const NEWTON_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 complexDiv(vec2 a, vec2 b) {
    float denom = b.x * b.x + b.y * b.y;
    return vec2((a.x * b.x + a.y * b.y) / denom, (a.y * b.x - a.x * b.y) / denom);
}

vec2 complexPow(vec2 z, int n) {
    vec2 result = vec2(1.0, 0.0);
    for (int i = 0; i < n; i++) {
        result = complexMul(result, z);
    }
    return result;
}

float newtonIteration(vec2 z0) {
    vec2 z = z0;
    
    for (int i = 0; i < u_maxIterations; i++) {
        // Newton's method for z^3 - 1 = 0
        // f(z) = z^3 - 1
        // f'(z) = 3*z^2
        vec2 f = complexPow(z, 3) - vec2(1.0, 0.0);
        vec2 fp = 3.0 * complexMul(z, z);
        
        if (length(fp) < 0.0001) break;
        
        vec2 delta = complexDiv(f, fp);
        z = z - delta;
        
        if (length(delta) < 0.0001) {
            // Check which root we converged to
            vec2 root1 = vec2(1.0, 0.0);
            vec2 root2 = vec2(-0.5, 0.866025); // (-1 + i*sqrt(3))/2
            vec2 root3 = vec2(-0.5, -0.866025); // (-1 - i*sqrt(3))/2
            
            float dist1 = length(z - root1);
            float dist2 = length(z - root2);
            float dist3 = length(z - root3);
            
            if (dist1 < dist2 && dist1 < dist3) return float(i) / float(u_maxIterations);
            if (dist2 < dist3) return 0.33 + float(i) / float(u_maxIterations) * 0.33;
            return 0.66 + float(i) / float(u_maxIterations) * 0.33;
        }
    }
    
    return 1.0;
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 coord = (uv - 0.5) * aspect / u_zoom + u_center;
    
    float escape = newtonIteration(coord);
    float t = escape;
    
    vec3 color = texture(u_colorPalette, vec2(t, 0.5)).rgb;
    fragColor = vec4(color, 1.0);
}`;

export const PHOENIX_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float phoenixIteration(vec2 c) {
    vec2 z = vec2(0.0, 0.0);
    vec2 zPrev = vec2(0.0, 0.0);
    float p = 0.5667; // Phoenix parameter
    
    for (int i = 0; i < u_maxIterations; i++) {
        if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
            return float(i) + 1.0 - log2(log2(dot(z, z)) * 0.5);
        }
        
        // Phoenix: z_{n+1} = z_n^2 + c + p * z_{n-1}
        vec2 zNext = complexMul(z, z) + c + p * zPrev;
        zPrev = z;
        z = zNext;
    }
    
    return float(u_maxIterations);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 coord = (uv - 0.5) * aspect / u_zoom + u_center;
    
    float escape = phoenixIteration(coord);
    float t = escape / float(u_maxIterations);
    
    if (t >= 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        vec3 color = texture(u_colorPalette, vec2(t, 0.5)).rgb;
        // Phoenix gets a fiery orange glow
        color.r *= 1.2;
        color.g *= 1.1;
        fragColor = vec4(color, 1.0);
    }
}`;

export const LAMBDA_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float lambdaIteration(vec2 lambda) {
    vec2 z = vec2(0.5, 0.0); // Starting point
    
    for (int i = 0; i < u_maxIterations; i++) {
        if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
            return float(i) + 1.0 - log2(log2(dot(z, z)) * 0.5);
        }
        
        // Lambda: z_{n+1} = lambda * z_n * (1 - z_n)
        vec2 oneMinusZ = vec2(1.0 - z.x, -z.y);
        z = complexMul(lambda, complexMul(z, oneMinusZ));
    }
    
    return float(u_maxIterations);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 coord = (uv - 0.5) * aspect / u_zoom + u_center;
    
    float escape = lambdaIteration(coord);
    float t = escape / float(u_maxIterations);
    
    if (t >= 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        vec3 color = texture(u_colorPalette, vec2(t, 0.5)).rgb;
        fragColor = vec4(color, 1.0);
    }
}`;

export const PERPENDICULAR_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float perpendicularIteration(vec2 c) {
    vec2 z = vec2(0.0, 0.0);
    
    for (int i = 0; i < u_maxIterations; i++) {
        if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
            return float(i) + 1.0 - log2(log2(dot(z, z)) * 0.5);
        }
        
        // Perpendicular: z_{n+1} = (Re(z_n^2) - Im(z_n^2)) + c
        vec2 z2 = complexMul(z, z);
        z = vec2(z2.x, -z2.y) + c;
    }
    
    return float(u_maxIterations);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 coord = (uv - 0.5) * aspect / u_zoom + u_center;
    
    float escape = perpendicularIteration(coord);
    float t = escape / float(u_maxIterations);
    
    if (t >= 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        vec3 color = texture(u_colorPalette, vec2(t, 0.5)).rgb;
        fragColor = vec4(color, 1.0);
    }
}`;

export const HEART_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform sampler2D u_colorPalette;
uniform float u_time;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float heartIteration(vec2 c) {
    vec2 z = vec2(0.0, 0.0);
    
    for (int i = 0; i < u_maxIterations; i++) {
        if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
            return float(i) + 1.0 - log2(log2(dot(z, z)) * 0.5);
        }
        
        // Heart-shaped fractal: use modified Mandelbrot with heart transformation
        // Apply heart curve transformation: x' = x, y' = sqrt(|x|) - y
        vec2 zTransformed = vec2(z.x, sqrt(abs(z.x)) - z.y);
        z = complexMul(zTransformed, zTransformed) + c;
    }
    
    return float(u_maxIterations);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 coord = (uv - 0.5) * aspect / u_zoom + u_center;
    
    float escape = heartIteration(coord);
    float t = escape / float(u_maxIterations);
    
    if (t >= 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        vec3 color = texture(u_colorPalette, vec2(t, 0.5)).rgb;
        // Heart gets a romantic red tint
        color.r *= 1.3;
        color.g *= 0.9;
        fragColor = vec4(color, 1.0);
    }
}`;

export const shaderSources = {
  vertex: VERTEX_SHADER,
  mandelbrot: MANDELBROT_FRAGMENT_SHADER,
  julia: JULIA_FRAGMENT_SHADER,
  burningShip: BURNING_SHIP_FRAGMENT_SHADER,
  lyapunov: LYAPUNOV_FRAGMENT_SHADER,
  tricorn: TRICORN_FRAGMENT_SHADER,
  celtic: CELTIC_FRAGMENT_SHADER,
  newton: NEWTON_FRAGMENT_SHADER,
  phoenix: PHOENIX_FRAGMENT_SHADER,
  lambda: LAMBDA_FRAGMENT_SHADER,
  perpendicular: PERPENDICULAR_FRAGMENT_SHADER,
  heart: HEART_FRAGMENT_SHADER,
  compute: COMPUTE_FRAGMENT_SHADER,
  antialiasing: AA_FRAGMENT_SHADER,
};
