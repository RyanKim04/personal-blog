import { kernelName, renderNotebook, type Notebook as NotebookData } from "@/lib/notebook";
import { CellCode, CellOutputs } from "./parts";

// A whole notebook as a post: markdown cells become prose, code cells become cards.
export async function Notebook({ src, srcName = "notebook.ipynb" }: { src: NotebookData; srcName?: string }) {
  const cells = await renderNotebook(src);
  return (
    <>
      {cells.map((c, i) =>
        c.type === "markdown" ? (
          <div key={i} className="nb-markdown" dangerouslySetInnerHTML={{ __html: c.html }} />
        ) : (
          <figure key={i} className="nb-card">
            <div className="nb-header">
              <span>{srcName} · {c.label}</span>
              <span>{kernelName(src)}</span>
            </div>
            <CellCode html={c.html} />
            <CellOutputs outputs={c.outputs} />
          </figure>
        ),
      )}
    </>
  );
}
