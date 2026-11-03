"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

import { stagger } from "./variants";

type RevealGroupProps = {
  className?: string;
  children: ReactNode;
};

/** Staggers its `RevealItem` children once, when scrolled into view. */
export function RevealGroup({ className, children }: RevealGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      {...(className === undefined ? {} : { className })}
    >
      {children}
    </motion.div>
  );
}
