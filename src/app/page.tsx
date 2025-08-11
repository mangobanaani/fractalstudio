'use client';

import dynamic from 'next/dynamic';

// Dynamically import FractalStudio with no SSR to avoid WebGL issues
const FractalStudio = dynamic(() => import('@/components/FractalStudio').then(mod => ({ default: mod.FractalStudio })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading Fractal Studio...</p>
        <p className="text-gray-400 text-sm mt-2">Initializing WebGL context</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <FractalStudio />
    </main>
  );
}