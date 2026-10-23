import { visit } from "unist-util-visit";

// Number each h2 ("01", "02", …) so the heading component and the TOC agree.
// Skips the sr-only "Footnotes" heading that remark-gfm adds.
export default function rehypeSectionNumbers() {
  return (tree) => {
    let n = 0;
    visit(tree, "element", (node) => {
      if (node.tagName !== "h2") return;
      const cls = node.properties?.className;
      if (Array.isArray(cls) && cls.includes("sr-only")) return;
      n += 1;
      node.properties.dataNum = String(n).padStart(2, "0");
    });
  };
}
