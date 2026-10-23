import type { RenderedOutput } from "@/lib/notebook";
import { PlotlyChart } from "./PlotlyChart";

export function CellCode({ html }: { html: string }) {
  return <div className="nb-code" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function CellOutputs({ outputs }: { outputs: RenderedOutput[] }) {
  if (outputs.length === 0) return null;
  return (
    <div className="nb-output">
      {outputs.map((o, i) => {
        switch (o.kind) {
          case "plotly":
            return <PlotlyChart key={i} figure={o.figure} />;
          case "image":
            // eslint-disable-next-line @next/next/no-img-element
            return <img key={i} src={o.src} alt={o.alt} className="nb-image" />;
          case "html":
            return <div key={i} className="nb-table" dangerouslySetInnerHTML={{ __html: o.html }} />;
          case "text":
            return <pre key={i} className={o.stderr ? "nb-text nb-stderr" : "nb-text"}>{o.text}</pre>;
          case "error":
            return (
              <details key={i} className="nb-error">
                <summary>{o.name}</summary>
                <pre className="nb-text">{o.text}</pre>
              </details>
            );
        }
      })}
    </div>
  );
}
