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

## Phase 2: rich content
- **Colocated assets:** `lib/mdx/remark-colocated-assets.mjs` rewrites `src="./…"` and `poster="./…"` on MDX components into bundler imports and adds `srcName` (the file name, used in notebook headers). Webpack rules in `next.config.mjs` load `.ipynb` as JSON and emit `.webm`/`.mp4` to `.next/static/media`, from both the server and client builds.
- **Notebooks** are rendered by `lib/notebook.ts` at build time and never executed. Output priority per cell: Plotly JSON → png/jpeg/svg → HTML containing a `<table>` (sanitized with `sanitize-html`) → `text/plain`. Streams render as `<pre>` and errors as a collapsed `<details>`. Code uses the same Shiki theme as MDX (`lib/highlight.ts`).
- **`<NotebookCell cell={n}>`:** `n` is the number shown as "In [n]" (its execution count). It falls back to the n-th code cell for unexecuted notebooks. Children replace the stored outputs, which is how the sample post shows its code with the interactive `PowerCurve` underneath, as in the mockup.
- **Plotly:** the notebook's own template is dropped and replaced with token colors (no blue). `plotly.js-basic-dist-min` loads only when a chart nears the viewport, and the chart's height is reserved so loading causes no layout shift. A notebook only produces Plotly JSON when its renderer includes `plotly_mimetype` (the JupyterLab default; set `pio.renderers.default = "plotly_mimetype"` when executing headless).
- **Notebook posts** are an `index.mdx` containing only `<Notebook src="./x.ipynb" />`. The TOC and section numbers come from the notebook's markdown `## ` headings, so don't add MDX h2s around it.
- **Thumbnails** must be named `thumbnail.<png|jpg|jpeg|webp|avif|gif>` in the post folder. They load through a webpack context limited to those names (so `notes.md` is never pulled in) and render with `next/image`.
- **Video** starts playback from JS after checking `prefers-reduced-motion`, rather than using the `autoplay` attribute, so reduced-motion readers never see it play before hydration. The poster's size sets the aspect ratio. Manim isn't installed here, so the fixture clip in `notebook-demo/media/` is a matplotlib render. For real Manim scenes, use `config.background_color = "#F7F6F2"`, `--text` (#1F1D1A) for strokes and `--accent` (#2F6B4F) for highlights.
- **Fixture post `content/posts/notebook-demo/`** (draft) exercises every notebook output type and the Video component. Delete it whenever you like.
