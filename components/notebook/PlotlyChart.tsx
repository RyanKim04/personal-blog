"use client";

import { useEffect, useRef } from "react";

type Figure = { data: unknown[]; layout?: Record<string, unknown> };

const sans = '-apple-system, system-ui, "Segoe UI", sans-serif';
const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// Blog styling replaces the notebook's Plotly template (which would bring blue in).
const axis = { gridcolor: "#EFEBE4", linecolor: "#D6D0C4", zerolinecolor: "#D6D0C4", tickfont: { family: mono, size: 11, color: "#6B665C" } };
const template = {
  layout: {
    font: { family: sans, color: "#1F1D1A", size: 13 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    colorway: ["#2F6B4F", "#8B5A2B", "#B4441F", "#6B665C", "#1F1D1A"],
    xaxis: axis,
    yaxis: axis,
    hoverlabel: { font: { family: mono }, bgcolor: "#FFFFFF", bordercolor: "#E6E1D8" },
    legend: { font: { color: "#5C5850" } },
  },
};

const DEFAULT_HEIGHT = 400;

// Plotly is ~1 MB, so it loads only when the chart scrolls near the viewport.
export function PlotlyChart({ figure }: { figure: Figure }) {
  const ref = useRef<HTMLDivElement>(null);
  const height = typeof figure.layout?.height === "number" ? figure.layout.height : DEFAULT_HEIGHT;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let plotly: { purge: (el: HTMLElement) => void } | null = null;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const Plotly = (await import("plotly.js-basic-dist-min")).default;
        if (cancelled) return;
        plotly = Plotly;
        const { template: _ignored, ...layout } = figure.layout ?? {};
        await Plotly.newPlot(
          el,
          figure.data,
          { margin: { l: 48, r: 16, t: layout.title ? 48 : 16, b: 40 }, ...layout, template, height, autosize: true },
          { displayModeBar: false, responsive: true },
        );
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      plotly?.purge(el);
    };
  }, [figure, height]);

  return <div ref={ref} className="nb-plotly" style={{ height }} />;
}
