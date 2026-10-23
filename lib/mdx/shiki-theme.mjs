// Code theme built from the design tokens (SPEC §4).
const keyword = "#2F6B4F";
const fn = "#8B5A2B";
const number = "#B4441F";
const text = "#1F1D1A";
const muted = "#6B665C";

export const blogTheme = {
  name: "blog",
  type: "light",
  colors: { "editor.background": "#F8F6F1", "editor.foreground": text },
  tokenColors: [
    { settings: { foreground: text } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: muted, fontStyle: "italic" } },
    { scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.operator.logical", "keyword.operator.new", "constant.language", "variable.language"], settings: { foreground: keyword } },
    { scope: ["entity.name.function", "support.function", "meta.function-call.generic", "entity.name.class", "entity.name.type", "support.class"], settings: { foreground: fn } },
    { scope: ["constant.numeric", "string", "constant.character"], settings: { foreground: number } },
  ],
};
