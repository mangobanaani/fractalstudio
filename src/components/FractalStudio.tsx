'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FractalRenderer } from '@/lib/fractal-renderer';
import { ParameterControls } from './ParameterControls';
import { PresetSelector } from './PresetSelector';
import { getFractalPreset, getFractalPresetIds, fractalPresets } from '@/lib/fractal-presets-modular';
import { colorPalettes } from '@/lib/color-palettes';
import { 
  FractalParams, 
  ViewportState, 
  GestureState
} from '@/types/fractal';

export function FractalStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<FractalRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentParams, setCurrentParams] = useState<FractalParams>({
    fractalType: 'mandelbrot',
    escapeRadius: 2,
    maxIterations: 100,
    center: { real: -0.5, imag: 0.0 },
    zoom: 4.0,
    colorPalette: 'viridis',
    precision: 'highp'
  });
  
  const [viewport, setViewport] = useState<ViewportState>({
    center: { real: -0.5, imag: 0.0 },
    zoom: 4.0,
    width: 800,
    height: 600,
    aspectRatio: 800 / 600
  });
  
  const [gestureState, setGestureState] = useState<GestureState>({
    isPanning: false,
    isZooming: false,
    lastPanPosition: { x: 0, y: 0 },
    lastZoomDistance: 0
  });

  const [showControls, setShowControls] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>('Mandelbrot Set');

  // Initialize WebGL renderer
  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    const initRenderer = async () => {
      try {
        const renderer = new FractalRenderer(canvasRef.current!);
        rendererRef.current = renderer;
        
        // Start the render loop
        renderer.startRenderLoop();
        
        setIsInitialized(true);
        console.log('Fractal renderer initialized successfully');
      } catch (error) {
        console.error('Failed to initialize fractal renderer:', error);
      }
    };

    initRenderer();
  }, [isInitialized]);

  // Handle window resize
  useEffect(() => {
    if (!isInitialized || !rendererRef.current) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      const newWidth = Math.max(1, Math.floor(rect.width * dpr));
      const newHeight = Math.max(1, Math.floor(rect.height * dpr));

      // Only update when dimensions actually change to avoid loops
      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;

        setViewport(prev => ({
          ...prev,
          width: newWidth,
          height: newHeight,
          aspectRatio: newWidth / newHeight
        }));

        rendererRef.current!.resize(newWidth, newHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized]);

  // Update fractal parameters when they change
  useEffect(() => {
    if (!isInitialized || !rendererRef.current) return;
    
    rendererRef.current.updateParams(currentParams);
  }, [currentParams, isInitialized]);

  // Handle parameter changes
  const handleParameterChange = useCallback((newParams: Partial<FractalParams>) => {
    setCurrentParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Handle preset selection
  const handlePresetChange = useCallback((presetName: string) => {
    const preset = getFractalPreset(presetName);
    
    if (preset) {
      setSelectedPreset(presetName);
      
      // Create the new parameters including ALL preset defaults
      const newParams = {
        ...preset.params,
        // Only preserve color palette and precision from current params
        colorPalette: currentParams.colorPalette,
        precision: currentParams.precision
      };
      
      setCurrentParams(newParams);
      // Let the renderer handle viewport updates through updateParams
    } else {
      console.error('Preset not found:', presetName);
    }
  }, [currentParams]);

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!rendererRef.current) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setGestureState(prev => ({
      ...prev,
      isPanning: true,
      lastPanPosition: { x, y }
    }));
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!gestureState.isPanning || !rendererRef.current) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const deltaX = x - gestureState.lastPanPosition!.x;
    const deltaY = y - gestureState.lastPanPosition!.y;
    
    // Convert screen coordinates to complex plane coordinates
    const zoomFactor = viewport.zoom;
    const aspectRatio = viewport.aspectRatio;
    
    const complexDeltaX = (deltaX / rect.width) * zoomFactor * aspectRatio;
    const complexDeltaY = (deltaY / rect.height) * zoomFactor;
    
    const newCenter = {
      real: viewport.center.real - complexDeltaX,
      imag: viewport.center.imag + complexDeltaY
    };
    
    setViewport(prev => ({ ...prev, center: newCenter }));
    setCurrentParams(prev => ({ ...prev, center: newCenter }));
    
    setGestureState(prev => ({
      ...prev,
      lastPanPosition: { x, y }
    }));
  }, [gestureState.isPanning, gestureState.lastPanPosition, viewport]);

  const handleMouseUp = useCallback(() => {
    setGestureState(prev => ({ ...prev, isPanning: false }));
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (!rendererRef.current) return;
    
    event.preventDefault();
    
    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.001, Math.min(1000, viewport.zoom * zoomFactor));
    
    setViewport(prev => ({ ...prev, zoom: newZoom }));
    setCurrentParams(prev => ({ ...prev, zoom: newZoom }));
  }, [viewport.zoom]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    const touches = Array.from(event.touches);
    
    if (touches.length === 1) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const touch = touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      setGestureState(prev => ({
        ...prev,
        isPanning: true,
        lastPanPosition: { x, y }
      }));
    } else if (touches.length === 2) {
      const distance = Math.sqrt(
        Math.pow(touches[1].clientX - touches[0].clientX, 2) +
        Math.pow(touches[1].clientY - touches[0].clientY, 2)
      );
      
      setGestureState(prev => ({
        ...prev,
        isZooming: true,
        lastZoomDistance: distance,
        touches
      }));
    }
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    const touches = Array.from(event.touches);
    
    if (touches.length === 1 && gestureState.isPanning) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const touch = touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const deltaX = x - gestureState.lastPanPosition!.x;
      const deltaY = y - gestureState.lastPanPosition!.y;
      
      const zoomFactor = viewport.zoom;
      const aspectRatio = viewport.aspectRatio;
      
      const complexDeltaX = (deltaX / rect.width) * zoomFactor * aspectRatio;
      const complexDeltaY = (deltaY / rect.height) * zoomFactor;
      
      const newCenter = {
        real: viewport.center.real - complexDeltaX,
        imag: viewport.center.imag + complexDeltaY
      };
      
      setViewport(prev => ({ ...prev, center: newCenter }));
      setCurrentParams(prev => ({ ...prev, center: newCenter }));
      
      setGestureState(prev => ({
        ...prev,
        lastPanPosition: { x, y }
      }));
    } else if (touches.length === 2 && gestureState.isZooming) {
      const distance = Math.sqrt(
        Math.pow(touches[1].clientX - touches[0].clientX, 2) +
        Math.pow(touches[1].clientY - touches[0].clientY, 2)
      );
      
      const zoomFactor = distance / gestureState.lastZoomDistance!;
      const newZoom = Math.max(0.001, Math.min(1000, viewport.zoom / zoomFactor));
      
      setViewport(prev => ({ ...prev, zoom: newZoom }));
      setCurrentParams(prev => ({ ...prev, zoom: newZoom }));
      
      setGestureState(prev => ({
        ...prev,
        lastZoomDistance: distance
      }));
    }
  }, [gestureState, viewport]);

  const handleTouchEnd = useCallback(() => {
    setGestureState(prev => ({
      ...prev,
      isPanning: false,
      isZooming: false
    }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'h':
          setShowControls(prev => !prev);
          break;
        case 'r':
          handlePresetChange(selectedPreset);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          const presetIndex = parseInt(event.key) - 1;
          const presetIds = getFractalPresetIds();
          if (presetIndex < presetIds.length) {
            handlePresetChange(presetIds[presetIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPreset, handlePresetChange]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Canvas for WebGL rendering */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Parameter Controls */}
      {showControls && isInitialized && (
        <div className="absolute top-4 right-4 z-30 w-80 max-w-[calc(100vw-2rem)] lg:max-w-sm">
          <div className="glass-panel p-4 lg:p-6 fade-in max-h-[calc(100vh-8rem)] overflow-y-auto">
            <h2 className="text-white font-semibold mb-3 lg:mb-4 text-xs lg:text-sm uppercase tracking-wide opacity-90">
              Parameters
            </h2>
            <ParameterControls
              params={currentParams}
              onParamsChange={handleParameterChange}
              palettes={colorPalettes}
            />
          </div>
        </div>
      )}

      {/* Preset Selector - Top Bar */}
      {showControls && isInitialized && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-auto max-w-[calc(100vw-2rem)]">
          <div className="glass-panel px-6 py-4 fade-in">
            <div className="flex items-center space-x-4">
              <h2 className="text-white font-semibold text-xs uppercase tracking-wide opacity-90 whitespace-nowrap">
                Presets
              </h2>
              <PresetSelector
                presets={fractalPresets}
                selectedPreset={selectedPreset}
                onPresetChange={handlePresetChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Title and Copyright */}
      {showControls && isInitialized && (
        <div className="absolute top-4 left-4 z-30">
          <div className="glass-panel px-6 py-4 fade-in">
            <h1 className="text-white font-bold text-lg uppercase tracking-wider mb-1">
              Fractal Studio
            </h1>
            <p className="text-white text-xs opacity-60 tracking-wide">
              © mangobanaani
            </p>
          </div>
        </div>
      )}

      {/* Help Overlay */}
      <div className="absolute bottom-4 left-4 z-40">
        <div className="glass-panel p-4 text-white opacity-75 hover:opacity-100 transition-opacity duration-300">
          <p className="font-medium text-sm mb-1">Controls</p>
          <p className="text-xs opacity-80">H - Toggle UI • Mouse - Pan/Zoom • 1-5 - Presets</p>
        </div>
      </div>
    </div>
  );
}
