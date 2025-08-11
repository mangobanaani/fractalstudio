'use client';

import React from 'react';
import { FractalParams, ColorPalette } from '@/types/fractal';

interface ParameterControlsProps {
  params: FractalParams;
  onParamsChange: (newParams: Partial<FractalParams>) => void;
  palettes: ColorPalette[];
}

export function ParameterControls({ params, onParamsChange, palettes = [] }: ParameterControlsProps) {
  const handleSliderChange = (key: keyof FractalParams, value: unknown) => {
    onParamsChange({ [key]: value });
  };

  const formatComplexNumber = (num: number) => {
    return num.toFixed(6);
  };

  return (
    <div className="space-y-6">
      {/* Zoom and Center */}
      <div className="space-y-3">
        <label className="block text-white text-sm font-medium">
          Zoom Level
        </label>
          <input
            type="range"
            min={-10}
            max={10}
            step={0.1}
            value={Math.log10(params.zoom)}
            onChange={(e) => handleSliderChange('zoom', Math.pow(10, parseFloat(e.target.value)))}
            className="w-full h-2 bg-white bg-opacity-20 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-400">
            {params.zoom.toExponential(2)}
          </div>
        </div>

        {/* Center Real */}
        <div className="space-y-3">
          <label className="block text-white text-sm font-medium">
            Center (Real)
          </label>
          <input
            type="number"
            step={0.000001}
            value={formatComplexNumber(params.center.real)}
            onChange={(e) => handleSliderChange('center', {
              ...params.center,
              real: parseFloat(e.target.value) || 0
            })}
            className="w-full px-3 py-2 bg-gray-900 bg-opacity-80 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            style={{
              color: 'white',
              backgroundColor: 'rgba(31, 41, 55, 0.8)'
            }}
          />
        </div>

        {/* Center Imaginary */}
        <div className="space-y-3">
          <label className="block text-white text-sm font-medium">
            Center (Imaginary)
          </label>
          <input
            type="number"
            step={0.000001}
            value={formatComplexNumber(params.center.imag)}
            onChange={(e) => handleSliderChange('center', {
              ...params.center,
              imag: parseFloat(e.target.value) || 0
            })}
            className="w-full px-3 py-2 bg-gray-900 bg-opacity-80 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            style={{
              color: 'white',
              backgroundColor: 'rgba(31, 41, 55, 0.8)'
            }}
          />
        </div>

        {/* Max Iterations */}
        <div className="space-y-3">
          <label className="block text-white text-sm font-medium">
            Max Iterations
          </label>
          <select
            value={params.maxIterations}
            onChange={(e) => handleSliderChange('maxIterations', parseInt(e.target.value) as 50 | 100 | 500 | 1000)}
            className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white text-sm"
          >
            <option style={{ backgroundColor: 'white', color: 'black' }} value={50}>50</option>
            <option style={{ backgroundColor: 'white', color: 'black' }} value={100}>100</option>
            <option style={{ backgroundColor: 'white', color: 'black' }} value={500}>500</option>
            <option style={{ backgroundColor: 'white', color: 'black' }} value={1000}>1000</option>
          </select>
        </div>

        {/* Escape Radius */}
        <div className="space-y-3">
          <label className="block text-white text-sm font-medium">
            Escape Radius
          </label>
          <select
            value={params.escapeRadius}
            onChange={(e) => handleSliderChange('escapeRadius', parseInt(e.target.value) as 2 | 4 | 8)}
            className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white text-sm"
          >
            <option style={{ backgroundColor: 'white', color: 'black' }} value={2}>2</option>
            <option style={{ backgroundColor: 'white', color: 'black' }} value={4}>4</option>
            <option style={{ backgroundColor: 'white', color: 'black' }} value={8}>8</option>
          </select>
        </div>

        {/* Julia Constant (if applicable) */}
        {params.juliaConstant && (
          <>
            <div className="space-y-3">
              <label className="block text-white text-sm font-medium">
                Julia Constant (Real)
              </label>
              <input
                type="number"
                step={0.001}
                value={formatComplexNumber(params.juliaConstant.real)}
                onChange={(e) => handleSliderChange('juliaConstant', {
                  ...params.juliaConstant!,
                  real: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-white text-sm font-medium">
                Julia Constant (Imaginary)
              </label>
              <input
                type="number"
                step={0.001}
                value={formatComplexNumber(params.juliaConstant.imag)}
                onChange={(e) => handleSliderChange('juliaConstant', {
                  ...params.juliaConstant!,
                  imag: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white text-sm"
              />
            </div>
          </>
        )}

        {/* Color Palette */}
        <div className="space-y-3">
          <label className="block text-white text-sm font-medium">
            Color Palette
          </label>
          <select
            value={params.colorPalette}
            onChange={(e) => handleSliderChange('colorPalette', e.target.value)}
            className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white text-sm"
          >
            {(palettes ?? []).map((palette) => (
              <option style={{ backgroundColor: 'white', color: 'black' }} key={palette.id} value={palette.id}>
                {palette.name}
              </option>
            ))}
          </select>
          
          {/* Palette Preview */}
          <div className="h-4 rounded flex overflow-hidden">
            {(palettes ?? []).find(p => p.id === params.colorPalette)?.colors.map((color, index) => (
              <div
                key={index}
                style={{ backgroundColor: color }}
                className="flex-1"
              />
            ))}
          </div>
        </div>

        {/* Precision */}
        <div className="space-y-3">
          <label className="block text-white text-sm font-medium">
            Shader Precision
          </label>
          <select
            value={params.precision}
            onChange={(e) => handleSliderChange('precision', e.target.value as 'highp' | 'mediump' | 'lowp')}
            className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white text-sm"
          >
            <option style={{ backgroundColor: 'white', color: 'black' }} value="highp">High Precision</option>
            <option style={{ backgroundColor: 'white', color: 'black' }} value="mediump">Medium Precision</option>
            <option style={{ backgroundColor: 'white', color: 'black' }} value="lowp">Low Precision</option>
          </select>
          <div className="text-xs text-gray-400">
            Higher precision = better quality, lower performance
          </div>
        </div>
      </div>
  );
}
