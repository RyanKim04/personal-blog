import path from "node:path";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkColocatedAssets from "./lib/mdx/remark-colocated-assets.mjs";
import rehypeSectionNumbers from "./lib/mdx/rehype-section-numbers.mjs";
import { blogTheme } from "./lib/mdx/shiki-theme.mjs";

const withMDX = createMDX({
  extension: /\.mdx$/,
  options: {
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm, remarkMath, remarkColocatedAssets],
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
  devIndicators: false,
  webpack(config, { isServer, dir, config: nextConfig }) {
    // The server build writes somewhere under distDir; point its media at distDir/static too.
    const distDir = path.join(dir, nextConfig.distDir);
    config.module.rules.push(
      // Notebooks are parsed at build time and rendered by <NotebookCell> / <Notebook>.
      { test: /\.ipynb$/, type: "json" },
      // Manim renders and other video: emitted to .next/static so both builds share one URL.
      {
        test: /\.(webm|mp4)$/,
        type: "asset/resource",
        generator: {
          filename: "static/media/[name].[hash][ext]",
          publicPath: "/_next/",
          outputPath: isServer ? `${path.relative(config.output.path, distDir)}/` : "",
        },
      },
    );
    return config;
  },
};

export default withMDX(nextConfig);
