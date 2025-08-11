'use client';

import React from 'react';
import { FractalPreset } from '@/types/fractal';

interface PresetSelectorProps {
  presets: FractalPreset[];
  selectedPreset: string;
  onPresetChange: (presetId: string) => void;
}

export function PresetSelector({ presets, selectedPreset, onPresetChange }: PresetSelectorProps) {
  return (
    <select
      value={selectedPreset}
      onChange={(e) => onPresetChange(e.target.value)}
      className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 bg-opacity-90 text-white border border-gray-600 hover:bg-gray-700 hover:bg-opacity-90 backdrop-blur-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
      style={{
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
      }}
    >
      {presets.map((preset) => (
        <option 
          key={preset.name} 
          value={preset.name}
          style={{ backgroundColor: 'white', color: 'black' }}
        >
          {preset.name}
        </option>
      ))}
    </select>
  );
}
