"use client";

import { ImageViewerDemo } from "@/components/image-viewer-demo";
import { GridCanvasDemo } from "@/components/grid-canvas-demo";
import { CardsDemo } from "@/components/cards-demo";
import { SnapPagingDemo } from "@/components/snap-paging-demo";
import { WebGLDemo } from "@/components/webgl-demo";

export default function PlaygroundPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-xl font-semibold">Scaler Playground</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pan, zoom, and scroll demos. Use mouse drag to pan, scroll wheel to zoom, or pinch with two fingers.
        </p>
      </header>
      <div className="mx-auto max-w-6xl space-y-10 p-6">
        <ImageViewerDemo />
        <GridCanvasDemo />
        <CardsDemo />
        <WebGLDemo />
        <SnapPagingDemo />
      </div>
    </main>
  );
}
