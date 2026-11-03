"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

import { fadeUp } from "./variants";

type RevealItemProps = {
  className?: string;
  children: ReactNode;
};

/** One item of a `RevealGroup`: fades up when its group is revealed. */
export function RevealItem({ className, children }: RevealItemProps) {
  return (
    <motion.div variants={fadeUp} {...(className === undefined ? {} : { className })}>
      {children}
    </motion.div>
  );
}
