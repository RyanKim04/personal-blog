import { createHighlighter, type Highlighter, type ThemeRegistration } from "shiki";
import { blogTheme } from "./mdx/shiki-theme.mjs";

let highlighter: Promise<Highlighter> | null = null;

// Same theme as the MDX code blocks, for code that isn't in MDX (notebook cells).
export async function highlight(code: string, lang: string) {
  highlighter ??= createHighlighter({ themes: [blogTheme as ThemeRegistration], langs: ["python", "r", "julia", "sql", "bash"] });
  const h = await highlighter;
  const known = h.getLoadedLanguages().includes(lang);
  return h.codeToHtml(code, { lang: known ? lang : "text", theme: "blog" });
}
