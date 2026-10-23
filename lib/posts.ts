import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

export type Status = "idea" | "brainstorm" | "outline" | "draft" | "review" | "published";

export type PostMeta = {
  slug: string;
  title: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  category: string;
  status: Status;
  thumbnail?: string;
};

export type TocItem = { id: string; num: string; label: string };

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const isProd = process.env.NODE_ENV === "production";

// Only index.mdx is ever read; notes.md and outline.md stay out of the site.
function readSource(slug: string) {
  return fs.readFileSync(path.join(POSTS_DIR, slug, "index.mdx"), "utf8");
}

function toDateString(v: unknown) {
  return v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? "");
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(POSTS_DIR, d.name, "index.mdx")))
    .map((d) => {
      const { data } = matter(readSource(d.name));
      return {
        slug: d.name,
        title: String(data.title ?? d.name),
        subtitle: String(data.subtitle ?? ""),
        date: toDateString(data.date),
        category: String(data.category ?? ""),
        status: (data.status ?? "idea") as Status,
        thumbnail: data.thumbnail ? String(data.thumbnail) : undefined,
      };
    })
    .filter((p) => !isProd || p.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  const posts = getAllPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return null;
  return { meta: posts[i], newer: posts[i - 1] ?? null, older: posts[i + 1] ?? null };
}

// TOC from the `## ` headings, slugged the same way rehype-slug does it.
export function getToc(slug: string): TocItem[] {
  const { content } = matter(readSource(slug));
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of content.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const label = m[1];
    items.push({ id: slugger.slug(label), num: String(items.length + 1).padStart(2, "0"), label });
  }
  return items;
}
