import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions}>
      {children}
    </DocsLayout>
  );
}
