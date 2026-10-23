// Numbered display equation: wrap a $$…$$ block and pass its number.
export function Eq({ n, children }: { n: number | string; children: React.ReactNode }) {
  return (
    <div className="eq">
      <span aria-hidden="true" className="eq-spacer" />
      <div className="eq-body">{children}</div>
      <span className="eq-num">({n})</span>
    </div>
  );
}
