/** The landing page's entrance motion: items fade up, a group staggers its items. */
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const stagger = {
  visible: {
    transition: { staggerChildren: 0.08 }
  }
};
