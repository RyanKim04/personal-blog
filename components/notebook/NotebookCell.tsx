import { kernelName, renderCodeCell, type Notebook } from "@/lib/notebook";
import { CellCode, CellOutputs } from "./parts";

type Props = {
  src: Notebook;
  srcName?: string; // added by remark-colocated-assets
  cell: number;
  // Optional replacement for the stored outputs, e.g. an interactive figure.
  children?: React.ReactNode;
};

// One cell of a notebook, rendered at build time as a card (SPEC §6).
export async function NotebookCell({ src, srcName = "notebook.ipynb", cell, children }: Props) {
  const c = await renderCodeCell(src, cell);
  return (
    <figure className="nb-card">
      <div className="nb-header">
        <span>{srcName} · {c.label}</span>
        <span>{kernelName(src)}</span>
      </div>
      <CellCode html={c.html} />
      {children ? <div className="nb-output">{children}</div> : <CellOutputs outputs={c.outputs} />}
    </figure>
  );
}
