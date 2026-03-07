import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { dot } from "@scaler/config";

const githubLink = dot.project.links.github;
const links =
  githubLink.state === "configured"
    ? [{ text: "GitHub", url: githubLink.url }]
    : [];

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: dot.project.title,
    url: "/"
  },
  links,
  searchToggle: {
    enabled: true
  }
};
