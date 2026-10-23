export function Callout({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <aside className="callout">
      {label && <span className="callout-label">{label}</span>}
      {children}
    </aside>
  );
}
