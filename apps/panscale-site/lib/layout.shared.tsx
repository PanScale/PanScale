import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { dot } from "@panscale/config";

const githubLink = dot.project.links.github;
const links = [
  { text: "Playground", url: "/playground" },
  ...(githubLink.state === "configured"
    ? [{ text: "GitHub", url: githubLink.url }]
    : [])
];

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
