import GithubSlugger from "github-slugger";
import sanitizeHtml from "sanitize-html";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";
import { highlight } from "./highlight";

// Minimal nbformat v4 shape.
type Multiline = string | string[];
type Output =
  | { output_type: "stream"; name: string; text: Multiline }
  | { output_type: "execute_result" | "display_data"; data: Record<string, unknown> }
  | { output_type: "error"; ename: string; evalue: string; traceback: string[] };
type Cell =
  | { cell_type: "code"; source: Multiline; execution_count: number | null; outputs: Output[] }
  | { cell_type: "markdown" | "raw"; source: Multiline };
export type Notebook = { cells: Cell[]; metadata?: { kernelspec?: { display_name?: string }; language_info?: { name?: string } } };

export type RenderedOutput =
  | { kind: "plotly"; figure: { data: unknown[]; layout?: Record<string, unknown> } }
  | { kind: "image"; src: string; alt: string }
  | { kind: "html"; html: string }
  | { kind: "text"; text: string; stderr?: boolean }
  | { kind: "error"; name: string; text: string };

export type RenderedCell =
  | { type: "code"; label: string; html: string; outputs: RenderedOutput[] }
  | { type: "markdown"; html: string };

const join = (s: Multiline) => (Array.isArray(s) ? s.join("") : s);
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");

export function kernelName(nb: Notebook) {
  return nb.metadata?.kernelspec?.display_name ?? "Python 3";
}

function language(nb: Notebook) {
  return nb.metadata?.language_info?.name ?? "python";
}

function codeCells(nb: Notebook) {
  return nb.cells.filter((c): c is Extract<Cell, { cell_type: "code" }> => c.cell_type === "code");
}

// `cell` is the number shown as "In [n]"; for unexecuted notebooks it falls back to the n-th code cell.
export function findCodeCell(nb: Notebook, cell: number) {
  const cells = codeCells(nb);
  return cells.find((c) => c.execution_count === cell) ?? cells[cell - 1] ?? null;
}

function renderOutput(o: Output): RenderedOutput | null {
  if (o.output_type === "stream") return { kind: "text", text: stripAnsi(join(o.text)), stderr: o.name === "stderr" };
  if (o.output_type === "error") {
    return { kind: "error", name: `${o.ename}: ${o.evalue}`, text: stripAnsi(o.traceback.join("\n")) };
  }
  const d = o.data;
  const plotly = d["application/vnd.plotly.v1+json"] as RenderedOutput & { data: unknown[] } | undefined;
  if (plotly) return { kind: "plotly", figure: plotly as unknown as { data: unknown[]; layout?: Record<string, unknown> } };
  for (const mime of ["image/png", "image/jpeg"]) {
    if (d[mime]) {
      const alt = typeof d["text/plain"] === "string" || Array.isArray(d["text/plain"]) ? join(d["text/plain"] as Multiline) : "";
      return { kind: "image", src: `data:${mime};base64,${join(d[mime] as Multiline).replace(/\s/g, "")}`, alt: alt.startsWith("<") ? "" : alt };
    }
  }
  if (d["image/svg+xml"]) {
    return { kind: "image", src: `data:image/svg+xml;utf8,${encodeURIComponent(join(d["image/svg+xml"] as Multiline))}`, alt: "" };
  }
  const html = d["text/html"] ? join(d["text/html"] as Multiline) : "";
  if (html.includes("<table")) {
    return {
      kind: "html",
      html: sanitizeHtml(html, {
        allowedTags: ["table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "div", "span", "br", "b", "i", "strong", "em", "code"],
        allowedAttributes: { th: ["colspan", "rowspan"], td: ["colspan", "rowspan"] },
      }),
    };
  }
  if (d["text/plain"]) return { kind: "text", text: stripAnsi(join(d["text/plain"] as Multiline)) };
  return null;
}

async function renderCode(nb: Notebook, c: Extract<Cell, { cell_type: "code" }>, index: number): Promise<RenderedCell> {
  return {
    type: "code",
    label: `In [${c.execution_count ?? index}]`,
    html: await highlight(join(c.source).trimEnd(), language(nb)),
    outputs: c.outputs.map(renderOutput).filter((o): o is RenderedOutput => o !== null),
  };
}

export async function renderCodeCell(nb: Notebook, cell: number) {
  const c = findCodeCell(nb, cell);
  if (!c) throw new Error(`Notebook has no code cell ${cell}`);
  return renderCode(nb, c, cell) as Promise<Extract<RenderedCell, { type: "code" }>>;
}

// h2s become numbered section headings, slugged like the TOC (one slugger per notebook).
function rehypeNotebookSections(state: { n: number; slugger: GithubSlugger }) {
  return () => (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "h2" || !parent || index === undefined) return;
      state.n += 1;
      const text = toText(node);
      node.properties = { ...node.properties, id: state.slugger.slug(text) };
      const head: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["section-head"] },
        children: [
          { type: "element", tagName: "span", properties: { className: ["section-num"], ariaHidden: "true" }, children: [{ type: "text", value: String(state.n).padStart(2, "0") }] },
          node,
        ],
      };
      parent.children[index] = head;
      return "skip";
    });
  };
}

function toText(node: Element): string {
  return node.children.map((c) => (c.type === "text" ? c.value : c.type === "element" ? toText(c) : "")).join("");
}

export async function renderNotebook(nb: Notebook): Promise<RenderedCell[]> {
  const state = { n: 0, slugger: new GithubSlugger() };
  const md = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeNotebookSections(state))
    .use(rehypeKatex)
    .use(rehypeStringify);
  const out: RenderedCell[] = [];
  let codeIndex = 0;
  for (const c of nb.cells) {
    if (c.cell_type === "markdown") out.push({ type: "markdown", html: String(await md.process(join(c.source))) });
    else if (c.cell_type === "code") out.push(await renderCode(nb, c, ++codeIndex));
  }
  return out;
}

// TOC entries for a notebook post, matching renderNotebook's ids and numbers.
export function notebookHeadings(nb: Notebook) {
  const slugger = new GithubSlugger();
  const items: { id: string; num: string; label: string }[] = [];
  for (const c of nb.cells) {
    if (c.cell_type !== "markdown") continue;
    for (const line of join(c.source).split("\n")) {
      const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
      if (m) items.push({ id: slugger.slug(m[1]), num: String(items.length + 1).padStart(2, "0"), label: m[1] });
    }
  }
  return items;
}
