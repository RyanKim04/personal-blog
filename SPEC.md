# Ryan Kim's blog — build spec

Personal blog and light portfolio. Medium-style reading, with LaTeX, flexible formatting, interactive figures and rendered Jupyter notebooks. Written by hand, with AI used only for brainstorming and review.

**For Claude Code:** read this whole file and everything in `design/` before writing code. Build in the phases in section 10 and stop for review after each one. When this spec and the mockups disagree, this spec wins. When something isn't covered, pick the simplest option and note it in `DECISIONS.md`.

---

## 1. Principles

1. **Simple.** Every element has to earn its place. No decorative gradients, no icon-title-blurb card grids, no emoji, no left-border callouts, no stats or badges nobody asked for. If a section feels empty, fix it with spacing, not with content.
2. **Reading first.** The post column is the product. Chrome stays quiet.
3. **Warm, not corporate.** Medium's structure, a bit of Naver-blog warmth (blog name + cover band, categories, a personal sidebar), Stripe-level care in spacing and type.
4. **No AI slop.** The writer drafts every sentence. Tools point out problems; they never rewrite prose (section 8).

## 2. Stack

- Next.js (latest stable, App Router) + TypeScript, deployed on Vercel.
- Content as MDX files in the repo (section 3). The content layer must support colocated assets and imports of colocated React components from MDX (e.g. Velite, content-collections or mdx-bundler). Pick one and record why in `DECISIONS.md`.
- Styling: CSS variables for the tokens in section 4. Tailwind is fine if it maps to these tokens; no component library.
- Math: `remark-math` + `rehype-katex`.
- Code: Shiki (e.g. `rehype-pretty-code`) with a custom theme from the token colors.
- Footnotes: GFM footnotes.
- Notebooks: `.ipynb` parsed at build time (section 6).
- Mascot: `three` in a client component, loaded lazily (section 7).
- Math animations: Manim (Python), rendered to `webm`/`mp4` and embedded as video (section 6).
- Comments: giscus.
- Per-post OG images generated with `next/og` (title + blog name on the cover-band grid).
- RSS at `/rss.xml` (no visible link needed).
- Later, not v1: TinaCMS on top of the same MDX files for a web editor. Keep content as plain files so it can be added without migration.

## 3. Content model

One folder per post:

```
content/posts/<slug>/
  index.mdx         # the post (published)
  notes.md          # brainstorm notes (never published)
  outline.md        # outline (never published)
  thumbnail.jpg     # optional, any image format
  *.ipynb           # optional notebooks
  *.tsx             # optional interactive figures for this post
  media/            # optional images, Manim videos
```

Frontmatter:

```yaml
title: Your A/B test needs more users than you think
subtitle: A one-line rule for sample size, and why halving the effect quadruples the cost.
date: 2026-10-23
category: Statistics            # one of the categories in content/site.ts
status: published               # idea | brainstorm | outline | draft | review | published
thumbnail: ./thumbnail.jpg      # optional
```

- Only `status: published` posts appear in production builds. In dev, all posts show with a small status label.
- `notes.md` and `outline.md` must never be routed or bundled into the site.
- `content/site.ts` holds: blog name, categories (ordered), and the profile (name, bio, links, experience, education, avatar path).

Placeholders to fill before launch: blog name, bio, links, roles/companies/years, degree/school/year, avatar, giscus repo, domain.

## 4. Design tokens

### Color

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F6F2` | page |
| `--text` | `#1F1D1A` | headings, body |
| `--text-2` | `#5C5850` | subtitles, excerpts, secondary |
| `--text-3` | `#6B665C` | meta, labels, counts |
| `--accent` | `#2F6B4F` | links, active states, chart lines, section numbers |
| `--accent-hover` | `#22503A` | link hover |
| `--accent-tint` | accent at 7% | callout background |
| `--line` | `#E6E1D8` | hairlines |
| `--line-2` | `#E4DFD5` | list separators |
| `--grid` | `#E8E3D9` | cover-band grid lines |
| `--panel` | `#F8F6F1` | code panels |
| `--card` | `#FFFFFF` | figure / notebook cards |
| `--placeholder` | `#ECE8DF` | empty thumbnail, avatar placeholder `#E6E1D8` |

Code syntax: keyword `#2F6B4F`, function `#8B5A2B`, number `#B4441F`, text `#1F1D1A`.
No blue anywhere. All text pairs must pass WCAG AA (they do as listed).

### Type (system fonts only, no webfonts)

- **Serif** `"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif` — headings, body, post titles, excerpts, sidebar name and bio.
- **Sans** `-apple-system, system-ui, "Segoe UI", sans-serif` — UI: category bar, labels, TOC, buttons, figure controls.
- **Mono** `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` — dates, tags, counts, section numbers, code.

| Element | Spec |
|---|---|
| Blog name (home h1) | serif 400, `clamp(40px, 5.5vw, 56px)`, lh 1.05, ls −0.045em |
| Post title | serif 400, `clamp(40px, 5.5vw, 57px)`, lh 1.05, ls −0.05em |
| Post subtitle | serif 22px, lh 1.45, `--text-2` |
| Section h2 | serif 400 36px, lh 1.15, ls −0.035em, preceded by mono 13px number ("01") in accent |
| Body | serif 19px, lh 1.8, column max 700px |
| List title | serif 400 25px, lh 1.25, ls −0.02em |
| List excerpt | serif 17px, lh 1.6, `--text-2` |
| Meta | mono 12px, uppercase, ls 0.06em, `--text-3`; category in accent |
| Section labels ("EXPERIENCE") | 12px uppercase, ls 0.08–0.14em, `--text-3` |

### Shape and layout

- Radius: 10 (thumbnail), 14 (callout, cards), 16 (figure). Hairlines are 1px.
- Container: max 1120px with 24px side gutters.
- Home: main column max 700px + sidebar max 300px, gap 80px; sidebar stacks below on narrow screens.
- Post: TOC column 220px + article 700px, gap 72px.
- Hit targets ≥ 44px. Respect `prefers-reduced-motion` everywhere.

## 5. Pages

### Home `/`

1. **Cover band** (full width): a 24px graph-paper grid in `--grid`, fading to transparent toward the bottom (CSS mask). Left: blog name as h1. Right: the 3D mascot canvas (224×224) standing on the bottom edge of the band. No nav, no tagline.
2. **Category bar** at the top of the main column: plain text buttons, each label followed by a small mono count. Active = accent text + 1.5px accent underline sitting on the bar's bottom hairline; inactive = `--text-3`. Filters the list client-side and syncs to `?category=`.
3. **Post list**: rows separated by hairlines. Each row: meta line (CATEGORY in accent · Month Year), title (link), one-line excerpt (subtitle). Optional thumbnail on the right: aspect 10:7, width `clamp(80px, 24%, 160px)`, radius 10. No read time, no badges, no author.
4. **Sidebar**: avatar (96px circle), name "Ryan Kim" (serif 24), 1–2 line bio (serif 16), links (GitHub, LinkedIn, Email), EXPERIENCE (role, company, years; right-aligned mono years), EDUCATION (degree, school, year).
5. No footer.

### Post `/<slug>`

1. **Cover band** (same grid fade) containing: blog name top-left (serif 21, links home), then the post header aligned to the article column: "← All writing" (mono 13), meta (CATEGORY in accent · Month Year), title, subtitle, author line ("Ryan Kim · GitHub · LinkedIn").
2. **Table of contents**: left column, `position: sticky; top: 32px`. Label "TABLE OF CONTENTS", then each h2 as "01  Label" (mono number). Active section (scroll-spy) = accent text with a 1.5px accent underline. Below 960px it sits above the article and is not sticky.
3. **Article**: serif body, components from section 6.
4. **End of post**: ∎ in accent, then "Thanks for reading. Spot a mistake? Tell me." ("Tell me" → mailto), footnotes, two cards (← Previous post, All posts →), giscus comments.
5. No footer.

## 6. MDX components ("flexible formatting")

- **Callout** — accent-tint box, radius 14, padding 20/24, mono uppercase label in accent ("WORKED EXAMPLE"). No border.
- **Math** — `$inline$` and `$$display$$` via KaTeX. Display equations can take a number shown right-aligned as "(1)".
- **PullQuote** — 40×3px accent bar above serif 32px text.
- **Figure / WideFigure** — with optional caption; WideFigure may break out to 960px.
- **Footnotes** — numbered, refs in mono accent, collected after the ∎.
- **NotebookCell** `<NotebookCell src="./power.ipynb" cell={3} />` and full notebook posts — card (white, 1px `--line`, radius 16): header strip "power.ipynb · In [3]" / "Python 3" (mono 12), code on `--panel` (mono 13.5/1.7, Shiki), output below. Output types: Plotly JSON → interactive Plotly chart; `image/png` → `<img>`; `text/plain` and streams → `<pre>`; HTML tables → sanitized and styled; errors → collapsed. Notebooks are rendered at build time, not executed in the browser.
- **Interactive figures** — React + SVG components colocated with the post, styled only with tokens. Controls use native inputs (`<input type="range">` with `accent-color`). The sample post's power-curve figure (slider for effect size, curve, dashed 80% line, marker at the n that reaches 80%) is the reference implementation; see `design/post.dc.html`.
- **Video** `<Video src="./media/scene.webm" />` — for Manim animations: `autoplay muted loop playsInline`, poster frame; under reduced motion show the poster with a play button. Manim scenes live in the post folder; render them with the blog palette (light `--bg` background, `--text` strokes, accent highlight).

Seed content: port the sample post "Your A/B test needs more users than you think" from `design/post.dc.html` as `content/posts/ab-test-sample-size/` with `status: draft`, so every component has a test case. The three other posts in the home mockup are placeholders: create them as short drafts only for layout testing.

## 7. Mascot — frog in a suit

Port `design/mascot.js` (the approved model and animation; built from three.js primitives).

- **Look:** green frog (`0x6fb85e`) in a charcoal suit (`0x2e2d2b`, darker `0x1c1b1a`), flat unlit shirt panel and collar (`0xf3efe6`), accent tie and pocket square (`0x2f6b4f`), black shoes, brown leather briefcase with brass clasps in the right hand, thick black rectangular glasses sitting low on the snout so the eyes and pupils show above the browline, 30% tinted lenses.
- **Lo-fi rendering:** `MeshLambertMaterial` with `flatShading`, antialias off, canvas at 112×112 internal pixels shown at 224×224 CSS with `image-rendering: pixelated`, updates stepped at ~12 fps. Camera FOV 30 at (0, 1.75, 6.5) looking at (0, 1.45, 0); ambient 0.55 + directional 0.85 from (−2.5, 4, 3.5).
- **Behavior:** walks in place, body turned about 34° to the viewer's left (0.9 s cycle, briefcase arm swings less). The head turns toward the cursor while it moves over the cover band. Hover or click: turns to face the viewer, hops (0.8 s) and waves with the left hand.
- **Performance:** load `three` only on the client, after first paint. Pause the loop when the canvas is offscreen (IntersectionObserver) or the tab is hidden. Under reduced motion render one static frame.
- **Accessibility:** wrap the canvas in a `<button aria-label="Say hello to the frog in the suit">`.
- **Later:** the procedural model can be replaced by a Blender-made GLB with the same look and the same animation contract.

## 8. Writing workflow

Implement as Claude Code slash commands in `.claude/commands/` plus a small Node/Python CLI where needed.

| Step | Command | What Claude does | What Claude never does |
|---|---|---|---|
| Idea | `/new "<title>"` | creates the post folder with frontmatter `status: idea`, empty `notes.md` and `outline.md` | — |
| Brainstorm | `/brainstorm <slug>` | interview mode: asks questions ("concrete example?", "what should the reader do differently?"), raises counterarguments, finds sources (links + facts only); appends the writer's answers to `notes.md` | write sentences of prose for the post |
| Outline | `/outline <slug>` | the writer writes one key claim per section; Claude only flags gaps and ordering problems | write the outline |
| Draft | — | nothing; the writer writes `index.mdx` | touch the draft |
| Review | `/slop-check <slug>` | (a) runs Vale; (b) line-level review with a reason per flag; (c) checks that every outline point made it into the post; (d) renders the post (Playwright screenshot) and checks it against the design anti-slop list | rewrite or "improve" sentences |
| Learn | `/slop-learn "<pattern>"`, `/slop-allow "<pattern>"` | adds a rule or an exception to the Vale style | — |
| Publish | `/publish <slug>` | runs `/slop-check`, sets `status: published` if clean (or with an explicit override), commits | — |

**Vale style `styles/AntiSlop/`** (starting set; it grows through `/slop-learn`): stock AI phrases ("delve", "tapestry", "in today's fast-paced world", "let's dive in", "it's worth noting"), the "not just X, it's Y" pattern, em-dash density per paragraph, bold overuse, lists that are always exactly three items, generic openers and closers, hedging stacks.

**Claude review checks** what rules can't: sentences that carry no information, unsupported generalizations, uniform sentence rhythm across a paragraph, conclusions that only repeat the intro.

**Design anti-slop list** for (d): decorative gradients, icon + title + blurb card triplets, emoji, everything centered, left-border callouts, badge clutter, stock illustrations.

Optional: a GitHub Action that runs Vale on pull requests that touch `content/`.

## 9. Not in v1

Web editor (TinaCMS later), search, newsletter, view counts, likes, About page, top navigation, footer, dark mode.

## 10. Phases and acceptance

1. **Scaffold + design** — tokens, home and post layouts, sample post in MDX with KaTeX, Shiki, footnotes, Callout, PullQuote, TOC with scroll-spy. *Accept:* matches `design/` at 1280px and 375px widths; Lighthouse accessibility ≥ 95; no layout shift from fonts.
2. **Rich content** — NotebookCell / notebook posts, interactive power-curve figure, Video component, thumbnails. *Accept:* a real `.ipynb` with a Plotly chart and a matplotlib image renders correctly.
3. **Mascot** — port `design/mascot.js`. *Accept:* walks, looks at cursor, hops and waves; paused offscreen; static under reduced motion; no effect on LCP.
4. **Workflow** — slash commands, Vale style, `/slop-check` with screenshot review. *Accept:* running it on the sample post produces line-level flags and edits nothing.
5. **Launch** — giscus, OG images, RSS, Vercel deploy, custom domain.

## Design references (`design/`)

- `home.dc.html`, `post.dc.html` — the approved mockups. They use inline styles; read them for exact values and copy. Ignore the mockup-tool parts: `<x-dc>`, `<helmet>`, `{{…}}` placeholders, `<sc-for>` / `<sc-if>`, `data-props` and the `Component` class (except the power-curve math and the frog code).
- `mascot.js` — the frog model and animation as a standalone ES module.
