"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HeroDemo } from "@/components/hero-demo";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const packages = [
  {
    name: "@panscale/core",
    desc: "Runtime-agnostic engine — momentum, bounce, snap, constraints.",
    href: "/docs/core",
    npm: "https://www.npmjs.com/package/@panscale/core",
  },
  {
    name: "@panscale/web",
    desc: "DOM adapter — mouse, touch, wheel, pointer, gesture events.",
    href: "/docs/web",
    npm: "https://www.npmjs.com/package/@panscale/web",
  },
  {
    name: "@panscale/react",
    desc: "React hooks and components for pan/zoom views.",
    href: "/docs/react",
    npm: "https://www.npmjs.com/package/@panscale/react",
  },
  {
    name: "@panscale/react-native",
    desc: "React Native adapter with Animated transforms.",
    href: "/docs/react-native",
    npm: "https://www.npmjs.com/package/@panscale/react-native",
  },
];

const features = [
  "Physics-based momentum & bounce",
  "Snap scrolling & pagination",
  "Pinch-to-zoom with proper gesture handling",
  "Works with images, canvas, WebGL, any element",
  "TypeScript-first, tree-shakeable",
  "Zero dependencies (core)",
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-fd-border bg-fd-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="text-lg font-bold tracking-tight">Panscale</span>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
              Docs
            </Link>
            <Link href="/playground" className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
              Playground
            </Link>
            <a
              href="https://github.com/PanScale/PanScale"
              className="text-sm text-fd-muted-foreground hover:text-fd-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero — demo first */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp}>
            <HeroDemo />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-5 text-center">
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
              Pan, zoom, and scroll{" "}
              <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                for any JS runtime
              </span>
            </h1>
            <p className="max-w-xl text-lg text-fd-muted-foreground">
              Physics-based momentum and bounce. Web, React, React Native — one core engine, thin adapters.
            </p>
            <pre className="rounded-xl bg-fd-muted px-5 py-2.5 text-sm font-mono">
              npm install @panscale/core @panscale/web
            </pre>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="rounded-full bg-fd-primary px-6 py-2.5 text-sm font-semibold text-fd-primary-foreground"
              >
                Get Started
              </Link>
              <Link
                href="/playground"
                className="rounded-full border border-fd-border px-6 py-2.5 text-sm font-semibold hover:bg-fd-muted"
              >
                More Demos
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-fd-border bg-fd-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((f) => (
              <motion.div
                key={f}
                variants={fadeUp}
                className="flex items-start gap-3 rounded-xl border border-fd-border bg-fd-card p-4"
              >
                <span className="mt-0.5 text-fd-primary">&#10003;</span>
                <span className="text-sm">{f}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-8 text-center text-2xl font-bold tracking-tight md:text-3xl"
          >
            Packages
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-4 sm:grid-cols-2"
          >
            {packages.map((pkg) => (
              <motion.div
                key={pkg.name}
                variants={fadeUp}
                className="rounded-2xl border border-fd-border bg-fd-card p-5"
              >
                <code className="text-sm font-semibold">{pkg.name}</code>
                <p className="mt-2 text-sm text-fd-muted-foreground">{pkg.desc}</p>
                <div className="mt-3 flex gap-4">
                  <Link href={pkg.href} className="text-sm font-semibold text-fd-primary">
                    Docs →
                  </Link>
                  <a href={pkg.npm} className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
                    npm
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick start */}
      <section className="border-t border-fd-border bg-fd-muted/30 py-16">
        <div className="mx-auto max-w-2xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="mb-6 text-center text-2xl font-bold tracking-tight md:text-3xl"
            >
              Quick start
            </motion.h2>
            <motion.pre
              variants={fadeUp}
              className="overflow-x-auto rounded-xl bg-fd-background border border-fd-border p-5 text-sm leading-relaxed"
            >
{`import { createWebScaler } from "@panscale/web";

const scaler = createWebScaler(element, {
  contentWidth: 1600,
  contentHeight: 900,
  zooming: true,
  bouncing: true,
  callback: (values) => {
    content.style.transform =
      \`matrix(\${values.zoom},0,0,\${values.zoom},\${values.translateX},\${values.translateY})\`;
  },
});`}
            </motion.pre>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-fd-border py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-fd-muted-foreground">
          <span>MIT Licensed</span>
          <div className="flex gap-4">
            <a href="/llms.txt">llms.txt</a>
            <a href="https://github.com/PanScale/PanScale">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
