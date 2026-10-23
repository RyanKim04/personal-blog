import type { StaticImageData } from "next/image";
import type { PostMeta } from "./posts";

const NAME = /^thumbnail\.(png|jpe?g|webp|avif|gif)$/;

// Thumbnails live in the post folder, so they're imported through the bundler
// (hashed URL + dimensions for next/image). Only files named thumbnail.<ext> are
// included, which keeps notes.md and friends out of the webpack context.
export async function loadThumbnails(posts: PostMeta[]) {
  const entries = await Promise.all(
    posts.map(async (p) => {
      const name = p.thumbnail?.replace(/^\.\//, "");
      if (!name || !NAME.test(name)) return null;
      const mod = await import(
        /* webpackInclude: /[\\/]thumbnail\.(png|jpe?g|webp|avif|gif)$/ */ `@/content/posts/${p.slug}/${name}`
      );
      return [p.slug, mod.default as StaticImageData] as const;
    }),
  );
  return Object.fromEntries(entries.filter((e) => e !== null));
}
