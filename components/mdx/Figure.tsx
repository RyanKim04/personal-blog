type Props = { caption?: React.ReactNode; children: React.ReactNode };

export function Figure({ caption, children }: Props) {
  return (
    <figure className="figure">
      {children}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

// Breaks out of the 700px column to up to 960px where there is room.
export function WideFigure({ caption, children }: Props) {
  return (
    <figure className="figure figure-wide">
      {children}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
