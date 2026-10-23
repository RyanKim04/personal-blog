export function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="pullquote">
      <span aria-hidden="true" className="pullquote-bar" />
      {children}
    </blockquote>
  );
}
