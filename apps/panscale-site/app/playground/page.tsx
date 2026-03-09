"use client";

import Link from "next/link";
import { ImageViewerDemo } from "@/components/image-viewer-demo";
import { GridCanvasDemo } from "@/components/grid-canvas-demo";
import { CardsDemo } from "@/components/cards-demo";
import { SnapPagingDemo } from "@/components/snap-paging-demo";
import { WebGLDemo } from "@/components/webgl-demo";

export default function PlaygroundPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="sticky top-0 z-50 border-b border-fd-border bg-fd-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight">Panscale</Link>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
              Docs
            </Link>
            <span className="text-sm font-semibold">Playground</span>
            <a
              href="https://github.com/PanScale/PanScale"
              className="text-sm text-fd-muted-foreground hover:text-fd-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-6xl px-6 pt-6 pb-2">
        <p className="text-sm text-fd-muted-foreground">
          Pan, zoom, and scroll demos. Use mouse drag to pan, scroll wheel to zoom, or pinch with two fingers.
        </p>
      </div>
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
