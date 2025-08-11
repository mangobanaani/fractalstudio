'use client';

import React from 'react';
import { PerformanceMetrics, ViewportState } from '@/types/fractal';

interface PerformanceDisplayProps {
  metrics: PerformanceMetrics;
  viewport: ViewportState;
}

export function PerformanceDisplay({ metrics, viewport }: PerformanceDisplayProps) {
  const getPerformanceGrade = (fps: number): { grade: string; color: string } => {
    if (fps >= 58) return { grade: 'A', color: 'text-green-400' };
    if (fps >= 45) return { grade: 'B', color: 'text-yellow-400' };
    if (fps >= 30) return { grade: 'C', color: 'text-orange-400' };
    if (fps >= 20) return { grade: 'D', color: 'text-red-400' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const { grade, color } = getPerformanceGrade(metrics.fps);

  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  };

  return (
    <div className="glass-panel p-4 h-full overflow-y-auto">
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
        Performance Monitor
      </h3>
      
      <div className="space-y-4">
        {/* Performance Grade */}
        <div className="text-center p-3 bg-black bg-opacity-20 rounded-lg">
          <div className={`text-3xl font-bold ${color}`}>
            {grade}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Performance Grade
          </div>
        </div>

        {/* FPS */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white text-sm">FPS</span>
            <span className={`text-sm font-mono ${color}`}>
              {formatNumber(metrics.fps, 1)}
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                metrics.fps >= 58 ? 'bg-green-400' :
                metrics.fps >= 45 ? 'bg-yellow-400' :
                metrics.fps >= 30 ? 'bg-orange-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(100, (metrics.fps / 60) * 100)}%` }}
            />
          </div>
        </div>

        {/* Frame Time */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white text-sm">Frame Time</span>
            <span className="text-gray-300 text-sm font-mono">
              {formatNumber(metrics.frameTime, 1)}ms
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                metrics.frameTime <= 16.7 ? 'bg-green-400' :
                metrics.frameTime <= 22 ? 'bg-yellow-400' :
                metrics.frameTime <= 33 ? 'bg-orange-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(100, (metrics.frameTime / 33.3) * 100)}%` }}
            />
          </div>
        </div>

        {/* GPU Memory */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white text-sm">GPU Memory</span>
            <span className="text-gray-300 text-sm font-mono">
              {formatNumber(metrics.gpuMemoryUsage, 0)}MB
            </span>
          </div>
        </div>

        {/* Render Latency */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white text-sm">Render Latency</span>
            <span className="text-gray-300 text-sm font-mono">
              {formatNumber(metrics.renderLatency, 1)}ms
            </span>
          </div>
        </div>

        {/* Viewport Info */}
        <div className="border-t border-white border-opacity-10 pt-4 mt-4">
          <h4 className="text-white font-medium mb-3 text-xs uppercase tracking-wide">
            Viewport Info
          </h4>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Resolution</span>
              <span className="text-gray-300 font-mono">
                {viewport.width} × {viewport.height}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Aspect Ratio</span>
              <span className="text-gray-300 font-mono">
                {formatNumber(viewport.aspectRatio, 3)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Zoom Level</span>
              <span className="text-gray-300 font-mono">
                {viewport.zoom.toExponential(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Center</span>
              <span className="text-gray-300 font-mono text-right">
                {formatNumber(viewport.center.real, 6)}<br/>
                {formatNumber(viewport.center.imag, 6)}i
              </span>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="border-t border-white border-opacity-10 pt-4 mt-4">
          <h4 className="text-white font-medium mb-3 text-xs uppercase tracking-wide">
            Optimization Tips
          </h4>
          
          <div className="space-y-2 text-xs text-gray-400">
            {metrics.fps < 45 && (
              <div className="p-2 bg-yellow-500 bg-opacity-20 rounded text-yellow-200">
                • Reduce max iterations<br/>
                • Lower shader precision<br/>
                • Enable adaptive quality
              </div>
            )}
            
            {metrics.fps < 30 && (
              <div className="p-2 bg-red-500 bg-opacity-20 rounded text-red-200">
                • Use Web Workers<br/>
                • Reduce render resolution<br/>
                • Switch to simple shaders
              </div>
            )}
            
            {metrics.frameTime > 25 && (
              <div className="p-2 bg-orange-500 bg-opacity-20 rounded text-orange-200">
                Frame spikes detected:<br/>
                • Check for blocking operations<br/>
                • Enable debounced updates
              </div>
            )}
            
            {metrics.fps >= 58 && (
              <div className="p-2 bg-green-500 bg-opacity-20 rounded text-green-200">
                Excellent performance!<br/>
                You can increase quality settings.
              </div>
            )}
          </div>
        </div>

        {/* WebGL Info */}
        <div className="border-t border-white border-opacity-10 pt-4 mt-4">
          <h4 className="text-white font-medium mb-3 text-xs uppercase tracking-wide">
            WebGL Status
          </h4>
          
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">WebGL 2.0 Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Triple Buffering</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300">High-Performance Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
