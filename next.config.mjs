import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSectionNumbers from "./lib/mdx/rehype-section-numbers.mjs";
import { blogTheme } from "./lib/mdx/shiki-theme.mjs";

const withMDX = createMDX({
  extension: /\.mdx$/,
  options: {
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      rehypeSectionNumbers,
      rehypeKatex,
      [rehypePrettyCode, { theme: blogTheme, keepBackground: false }],
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // .md is deliberately excluded so notes.md / outline.md can never become pages.
  pageExtensions: ["ts", "tsx", "mdx"],
};

export default withMDX(nextConfig);
