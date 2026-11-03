import { HomeShell } from "@byoklab/site";

import { CardsDemo } from "../../components/cards-demo";
import { GridCanvasDemo } from "../../components/grid-canvas-demo";
import { ImageViewerDemo } from "../../components/image-viewer-demo";
import { SnapPagingDemo } from "../../components/snap-paging-demo";
import { WebGLDemo } from "../../components/webgl-demo";
import { site } from "../_site/runtime";

export const metadata = {
  title: "Playground",
  description: "Pan, zoom, and scroll demos for Panscale: image viewer, infinite canvas, cards, WebGL and snap paging."
};

/** `/playground`: the five interactive demos, in the generated home layout (header and footer). */
export default function PlaygroundPage() {
  return (
    <HomeShell site={site}>
      <div className="py-6">
        <h1 className="text-2xl font-bold tracking-tight text-fd-foreground">Panscale Playground</h1>
        <p className="mt-1 text-sm text-fd-muted-foreground">
          Pan, zoom, and scroll demos. Use mouse drag to pan, scroll wheel to zoom, or pinch with two fingers.
        </p>
      </div>
      <div className="space-y-10 pb-6">
        <ImageViewerDemo />
        <GridCanvasDemo />
        <CardsDemo />
        <WebGLDemo />
        <SnapPagingDemo />
      </div>
    </HomeShell>
  );
}
