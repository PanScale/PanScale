"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ScalerValues } from "@scaler/core";
import { createWebScaler, type WebScaler } from "@scaler/web";

// Content dimensions for the GL scene (virtual canvas)
const SCENE_W = 2000;
const SCENE_H = 1500;

// Vertex shader: receives position + color, applies a 4x4 MVP matrix
const VERT_SRC = `
  attribute vec2 a_position;
  attribute vec3 a_color;
  uniform mat4 u_mvp;
  varying vec3 v_color;
  void main() {
    gl_Position = u_mvp * vec4(a_position, 0.0, 1.0);
    v_color = a_color;
  }
`;

// Fragment shader: renders interpolated vertex color
const FRAG_SRC = `
  precision mediump float;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`;

/** Convert a scaler Matrix + viewport into a column-major Float32Array(16) for WebGL. */
function buildMVP(
  translateX: number,
  translateY: number,
  zoom: number,
  viewW: number,
  viewH: number,
): Float32Array {
  // The scaler gives us: translateX/Y (pixel offset) and zoom (scale factor).
  // We need to map scene coordinates → clip space [-1,1].
  //
  // Pipeline:
  //   1. Scale scene coords by zoom
  //   2. Translate by scaler's translateX/Y (pixels)
  //   3. Map pixel coords [0..viewW, 0..viewH] → clip space [-1,1] with Y flipped
  //
  // Combined into a single 2D affine → 4x4 matrix (column-major for GL):
  const sx = (2 * zoom) / viewW;
  const sy = (-2 * zoom) / viewH; // flip Y for GL
  const tx = (2 * translateX) / viewW - 1;
  const ty = 1 - (2 * translateY) / viewH;

  // Column-major 4x4:
  // [ sx  0  0  0 ]
  // [  0 sy  0  0 ]
  // [  0  0  1  0 ]
  // [ tx ty  0  1 ]
  return new Float32Array([
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, 1, 0,
    tx, ty, 0, 1,
  ]);
}

/** Build geometry: a grid of colored triangles + grid lines. */
function buildGeometry() {
  const positions: number[] = [];
  const colors: number[] = [];

  const COLS = 10;
  const ROWS = 8;
  const cellW = SCENE_W / COLS;
  const cellH = SCENE_H / ROWS;

  // Palette
  const palette = [
    [0.235, 0.510, 0.957], // blue
    [0.063, 0.725, 0.506], // green
    [0.961, 0.620, 0.043], // amber
    [0.545, 0.361, 0.965], // purple
    [0.937, 0.267, 0.267], // red
    [0.082, 0.686, 0.808], // teal
    [0.957, 0.318, 0.588], // pink
    [0.298, 0.686, 0.314], // green2
  ];

  // For each cell draw two triangles (a quad) with a color from palette
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x0 = c * cellW + 2;
      const y0 = r * cellH + 2;
      const x1 = (c + 1) * cellW - 2;
      const y1 = (r + 1) * cellH - 2;
      const col = palette[(r * COLS + c) % palette.length]!;

      // Slightly vary shade per triangle half
      const col2 = col.map((v) => Math.min(1, v * 1.15));

      // Triangle 1
      positions.push(x0, y0, x1, y0, x0, y1);
      colors.push(...col, ...col, ...col);

      // Triangle 2
      positions.push(x1, y0, x1, y1, x0, y1);
      colors.push(...col2, ...col2, ...col2);
    }
  }

  // Grid lines (thin quads)
  const lineW = 1;
  const lineColor = [0.3, 0.3, 0.35];

  // Vertical lines
  for (let c = 0; c <= COLS; c++) {
    const x = c * cellW;
    positions.push(x - lineW, 0, x + lineW, 0, x - lineW, SCENE_H);
    colors.push(...lineColor, ...lineColor, ...lineColor);
    positions.push(x + lineW, 0, x + lineW, SCENE_H, x - lineW, SCENE_H);
    colors.push(...lineColor, ...lineColor, ...lineColor);
  }

  // Horizontal lines
  for (let r = 0; r <= ROWS; r++) {
    const y = r * cellH;
    positions.push(0, y - lineW, SCENE_W, y - lineW, 0, y + lineW);
    colors.push(...lineColor, ...lineColor, ...lineColor);
    positions.push(SCENE_W, y - lineW, SCENE_W, y + lineW, 0, y + lineW);
    colors.push(...lineColor, ...lineColor, ...lineColor);
  }

  // Diagonal accent lines inside each cell
  const diagColor = [1, 1, 1];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x0 = c * cellW + 2;
      const y0 = r * cellH + 2;
      const x1 = (c + 1) * cellW - 2;
      const y1 = (r + 1) * cellH - 2;
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      // Small diamond in center
      const s = Math.min(cellW, cellH) * 0.08;
      positions.push(mx, my - s, mx + s, my, mx, my + s);
      colors.push(...diagColor, ...diagColor, ...diagColor);
      positions.push(mx, my - s, mx, my + s, mx - s, my);
      colors.push(...diagColor, ...diagColor, ...diagColor);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    vertexCount: positions.length / 2,
  };
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`Shader compile error: ${info}`);
  }
  return s;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(p)}`);
  }
  return p;
}

export function WebGLDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const webScalerRef = useRef<WebScaler | null>(null);
  const glRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    mvpLoc: WebGLUniformLocation;
    vertexCount: number;
  } | null>(null);
  const [values, setValues] = useState<ScalerValues | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Init WebGL once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return;

    const program = createProgram(gl);
    gl.useProgram(program);

    const { positions, colors, vertexCount } = buildGeometry();

    // Position buffer
    const posBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Color buffer
    const colBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    const colLoc = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colLoc);
    gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 0, 0);

    const mvpLoc = gl.getUniformLocation(program, "u_mvp")!;

    glRef.current = { gl, program, mvpLoc, vertexCount };

    return () => {
      gl.deleteProgram(program);
      gl.deleteBuffer(posBuf);
      gl.deleteBuffer(colBuf);
      glRef.current = null;
    };
  }, []);

  // Redraw whenever values change
  useEffect(() => {
    const g = glRef.current;
    if (!g || !values || containerSize.w === 0) return;

    const { gl, mvpLoc, vertexCount } = g;
    const dpr = window.devicePixelRatio || 1;
    const cw = containerSize.w;
    const ch = containerSize.h;

    // Resize canvas backing store
    const canvas = canvasRef.current!;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.09, 0.09, 0.12, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const mvp = buildMVP(values.translateX, values.translateY, values.zoom, cw, ch);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }, [values, containerSize]);

  // Init scaler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setContainerSize({ w: rect.width, h: rect.height });

    const fitZoom = Math.min(rect.width / SCENE_W, rect.height / SCENE_H);

    const ws = createWebScaler(el, {
      callback: setValues,
      contentWidth: SCENE_W,
      contentHeight: SCENE_H,
      zooming: true,
      bouncing: true,
      minZoom: fitZoom * 0.3,
      maxZoom: 5,
      locking: false,
    });
    webScalerRef.current = ws;

    ws.scaler.zoomTo(fitZoom);
    // Center
    const scaledW = SCENE_W * fitZoom;
    const scaledH = SCENE_H * fitZoom;
    ws.scaler.scrollTo(
      scaledW > rect.width ? (scaledW - rect.width) / 2 : -(rect.width - scaledW) / 2,
      scaledH > rect.height ? (scaledH - rect.height) / 2 : -(rect.height - scaledH) / 2,
    );

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      ws.destroy();
      webScalerRef.current = null;
    };
  }, []);

  const zoomIn = useCallback(() => webScalerRef.current?.scaler.zoomBy(1.3, true), []);
  const zoomOut = useCallback(() => webScalerRef.current?.scaler.zoomBy(0.7, true), []);
  const resetZoom = useCallback(() => {
    const ws = webScalerRef.current;
    if (!ws) return;
    const cw = containerSize.w;
    const ch = containerSize.h;
    const fit = Math.min(cw / SCENE_W, ch / SCENE_H);
    ws.scaler.zoomTo(fit, true);
  }, [containerSize]);

  const zoom = values?.zoom ?? 1;

  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">WebGL Scene</h2>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Scaler drives a WebGL viewport. The transformation matrix is converted to a GL MVP matrix
        each frame. Pan/zoom with mouse or touch &mdash; all rendering happens on the GPU.
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={zoomOut} type="button" className="btn-ctrl">&minus;</button>
        <span className="min-w-[4rem] text-center text-sm font-mono">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={zoomIn} type="button" className="btn-ctrl">+</button>
        <button onClick={resetZoom} type="button" className="btn-ctrl">Fit</button>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700"
        style={{ height: 500, cursor: "grab" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {values && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-900">
          <span className="mr-4">Scene: {SCENE_W}&times;{SCENE_H}</span>
          <span className="mr-4">Zoom: {(zoom * 100).toFixed(0)}%</span>
          <span className="mr-4">Translate: ({values.translateX.toFixed(1)}, {values.translateY.toFixed(1)})</span>
          <span className="mr-4">
            Matrix: [{values.matrix.a.toFixed(3)}, {values.matrix.b.toFixed(3)}, {values.matrix.c.toFixed(3)}, {values.matrix.d.toFixed(3)}, {values.matrix.e.toFixed(1)}, {values.matrix.f.toFixed(1)}]
          </span>
        </div>
      )}
    </section>
  );
}
