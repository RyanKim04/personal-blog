import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/Callout";
import { Eq } from "@/components/mdx/Eq";
import { Figure, WideFigure } from "@/components/mdx/Figure";
import { PullQuote } from "@/components/mdx/PullQuote";
import { Video } from "@/components/mdx/Video";
import { Notebook } from "@/components/notebook/Notebook";
import { NotebookCell } from "@/components/notebook/NotebookCell";

type H2Props = React.ComponentProps<"h2"> & { "data-num"?: string };

// h2s get their number from lib/mdx/rehype-section-numbers.mjs.
function SectionHeading({ "data-num": num, ...props }: H2Props) {
  if (!num) return <h2 {...props} />;
  return (
    <div className="section-head">
      <span className="section-num" aria-hidden="true">{num}</span>
      <h2 {...props} />
    </div>
  );
}

const components: MDXComponents = {
  h2: SectionHeading,
  Callout,
  Eq,
  Figure,
  WideFigure,
  PullQuote,
  Video,
  Notebook,
  NotebookCell,
};

export function useMDXComponents(inherited: MDXComponents = {}): MDXComponents {
  return { ...inherited, ...components };
}
