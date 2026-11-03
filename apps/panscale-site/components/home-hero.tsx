"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { HeroDemo } from "./hero-demo";
import { fadeUp, stagger } from "./reveal/variants";

/** The landing hero: the interactive pan/zoom demo first, then the pitch, the install line and the two calls to action. */
export function HomeHero() {
  return (
    <section className="not-prose pt-4 pb-6">
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        <motion.div variants={fadeUp}>
          <HeroDemo />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-5 text-center">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl">
            Pan, zoom, and scroll{" "}
            <span className="bg-linear-to-r from-fd-primary to-fd-info bg-clip-text text-transparent">for any JS runtime</span>
          </h1>
          <p className="max-w-xl text-lg text-fd-muted-foreground">
            Physics-based momentum and bounce. Web, React, React Native — one core engine, thin adapters.
          </p>
          <pre className="rounded-xl bg-fd-muted px-5 py-2.5 font-mono text-sm text-fd-foreground">npm install @panscale/core @panscale/web</pre>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="rounded-full bg-fd-primary px-6 py-2.5 text-sm font-semibold text-fd-primary-foreground"
            >
              Get Started
            </Link>
            <Link
              href="/playground"
              className="rounded-full border border-fd-border px-6 py-2.5 text-sm font-semibold text-fd-foreground hover:bg-fd-muted"
            >
              More Demos
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
