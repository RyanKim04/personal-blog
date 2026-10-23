import styles from "./CoverBand.module.css";

// Graph-paper band that fades out toward the bottom (SPEC §5).
export function CoverBand({ fade, children }: { fade: 30 | 35; children: React.ReactNode }) {
  return (
    <header className={styles.band}>
      <div aria-hidden="true" className={styles.grid} style={{ "--solid": `${fade}%` } as React.CSSProperties} />
      <div className={styles.inner}>{children}</div>
    </header>
  );
}
