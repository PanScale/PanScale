import { notFound } from "next/navigation";
import { DocsBody, DocsPage } from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/mdx-components";
import { source } from "@/lib/source";

type Params = {
  params: Promise<{ slug?: string[] }>;
};

export default async function DocsPageRoute({ params }: Params) {
  const { slug } = await params;
  const page = source.getPage(slug ?? []);
  if (!page) return notFound();

  const MdxContent = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>
        <MdxContent
          components={getMDXComponents({
            a: createRelativeLink(source, page)
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}
