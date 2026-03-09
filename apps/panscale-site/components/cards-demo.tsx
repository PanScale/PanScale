"use client";

import { useEffect, useRef, useState } from "react";
import type { ScalerValues } from "@panscale/core";
import { createWebScaler, type WebScaler } from "@panscale/web";

const CARD_DATA = [
  { id: 1, title: "Design System", desc: "Colors, typography, spacing tokens", color: "#6366f1" },
  { id: 2, title: "Component Lib", desc: "Button, Input, Modal, Toast...", color: "#8b5cf6" },
  { id: 3, title: "API Gateway", desc: "Rate limiting, auth, routing", color: "#06b6d4" },
  { id: 4, title: "Auth Service", desc: "JWT, OAuth2, sessions", color: "#10b981" },
  { id: 5, title: "User Service", desc: "CRUD, roles, permissions", color: "#f59e0b" },
  { id: 6, title: "Notification", desc: "Email, push, in-app alerts", color: "#ef4444" },
  { id: 7, title: "Analytics", desc: "Events, funnels, dashboards", color: "#ec4899" },
  { id: 8, title: "Storage", desc: "S3, CDN, image processing", color: "#14b8a6" },
  { id: 9, title: "Search", desc: "Full-text, filters, facets", color: "#f97316" },
  { id: 10, title: "Payments", desc: "Stripe, invoices, subscriptions", color: "#84cc16" },
  { id: 11, title: "CI/CD", desc: "Build, test, deploy pipelines", color: "#a855f7" },
  { id: 12, title: "Monitoring", desc: "Metrics, logs, traces, alerts", color: "#e11d48" },
];

const COLS = 4;
const CARD_W = 260;
const CARD_H = 140;
const GAP = 24;
const PAD = 40;
const CONTENT_WIDTH = PAD * 2 + COLS * CARD_W + (COLS - 1) * GAP;
const ROWS = Math.ceil(CARD_DATA.length / COLS);
const CONTENT_HEIGHT = PAD * 2 + ROWS * CARD_H + (ROWS - 1) * GAP;

export function CardsDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webScalerRef = useRef<WebScaler | null>(null);
  const [values, setValues] = useState<ScalerValues | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const fitZoom = Math.min(rect.width / CONTENT_WIDTH, rect.height / CONTENT_HEIGHT, 1);

    const ws = createWebScaler(el, {
      callback: setValues,
      contentWidth: CONTENT_WIDTH,
      contentHeight: CONTENT_HEIGHT,
      zooming: true,
      bouncing: true,
      minZoom: 0.3,
      maxZoom: 3,
    });
    webScalerRef.current = ws;
    ws.scaler.zoomTo(fitZoom);

    return () => {
      ws.destroy();
      webScalerRef.current = null;
    };
  }, []);

  const zoom = values?.zoom ?? 1;
  const tx = values?.translateX ?? 0;
  const ty = values?.translateY ?? 0;

  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">Card Grid</h2>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Service architecture cards. Pan and zoom to explore.
      </p>

      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => webScalerRef.current?.scaler.zoomBy(0.7, true)} type="button" className="btn-ctrl">−</button>
        <span className="min-w-[4rem] text-center text-sm font-mono">{Math.round(zoom * 100)}%</span>
        <button onClick={() => webScalerRef.current?.scaler.zoomBy(1.3, true)} type="button" className="btn-ctrl">+</button>
        <button
          onClick={() => {
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const fitZoom = Math.min(rect.width / CONTENT_WIDTH, rect.height / CONTENT_HEIGHT, 1);
            webScalerRef.current?.scaler.zoomTo(fitZoom, true);
            webScalerRef.current?.scaler.scrollTo(0, 0, true);
          }}
          type="button"
          className="btn-ctrl"
        >
          Fit All
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900"
        style={{ height: 400, cursor: "grab" }}
      >
        <div
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
            transformOrigin: "0 0",
            willChange: "transform",
            position: "absolute",
          }}
        >
          <div style={{ width: CONTENT_WIDTH, height: CONTENT_HEIGHT, position: "relative" }}>
            {CARD_DATA.map((card, i) => {
              const col = i % COLS;
              const row = Math.floor(i / COLS);
              return (
                <div
                  key={card.id}
                  style={{
                    position: "absolute",
                    left: PAD + col * (CARD_W + GAP),
                    top: PAD + row * (CARD_H + GAP),
                    width: CARD_W,
                    height: CARD_H,
                    background: card.color,
                    borderRadius: 12,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>{card.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
