# Decisions

Choices the spec left open, and places where the spec and the mockups disagree (the spec wins).

## Stack
- **Content layer: `@next/mdx`.** Each post's `index.mdx` is imported directly by `app/[slug]/page.tsx`, so colocated `.tsx` figures, notebooks and media go through the normal bundler with no extra build step. `lib/posts.ts` reads frontmatter with `gray-matter` for listings. It reads only `index.mdx`, so `notes.md` and `outline.md` never reach the site (a sentinel string in those files is grepped for in `.next` to check this).
- **Webpack, not Turbopack** (`next dev/build --webpack`). Turbopack only accepts MDX plugins as serializable strings; we use a local rehype plugin and a Shiki theme object.
- **No Tailwind.** Plain CSS variables in `app/globals.css`, CSS modules for page components, and global `app/prose.css` for MDX output.
- **npm**, since pnpm isn't installed.

## Spec vs. mockup
- **Webfonts:** the post mockup loads STIX Two Text for math. The spec says no webfonts, so it's dropped. KaTeX ships its own math fonts, which are needed to render math at all. They only affect equations (CLS measured 0).
- **TOC inactive color** uses `--text-2` (the mockup's value). The spec states `--text-3` only for the category bar.
- **Minor chart tones** from the mockup are added as tokens: `--chart-grid #EFEBE4`, `--chart-ref #A8A194`, `--chart-axis #D6D0C4`, `--dot #C9C2B5`.
- **Power-curve area fill** (Phase 2) keeps the mockup's soft gradient: it encodes the data rather than decorating.
- **Home post titles are `h2`** (the mockup uses `h3`) so heading order passes accessibility checks.
- **Links inside paragraphs** get a faint underline so they don't rely on color alone (WCAG 1.4.1).

## Implementation details
- **Section numbers** come from `lib/mdx/rehype-section-numbers.mjs`, which stamps `data-num` on each h2. The TOC is derived from the same `## ` lines with `github-slugger`, which matches `rehype-slug`'s ids.
- **Footnotes after ∎:** the article is a flex column. GFM's footnotes section gets `order: 2` and the end-of-post block `order: 1`, so footnotes render after ∎ without post-processing the MDX output.
- **Numbered equations:** wrap `$$…$$` in `<Eq n={1}>`.
- **WideFigure** only breaks out above 960px. It extends right into the unused gutter, up to 960px wide, because the TOC occupies the left side.
- **Category filter** reads `?category=` after hydration and writes it back with `history.replaceState`, which keeps the home page fully static.
- **Prev card** links to the next-older post. It is hidden on the oldest post.
- **Drafts in dev:** all statuses show with a small status label. Production builds include only `status: published`, so a build with only drafts has an empty home page.
