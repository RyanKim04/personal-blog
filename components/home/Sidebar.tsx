import { site } from "@/content/site";
import styles from "./home.module.css";

type Entry = { role: string; org: string; years: string };

function Section({ label, entries }: { label: string; entries: readonly Entry[] }) {
  return (
    <div className={styles.sideSection}>
      <span className={styles.sideLabel}>{label}</span>
      {entries.map((e, i) => (
        <div key={i} className={styles.entry}>
          <div className={styles.entryText}>
            <span className={styles.entryRole}>{e.role}</span>
            <span className={styles.entryOrg}>{e.org}</span>
          </div>
          <span className={styles.entryYears}>{e.years}</span>
        </div>
      ))}
    </div>
  );
}

export function Sidebar() {
  const p = site.profile;
  return (
    <aside aria-label="About" className={styles.sidebar}>
      <div className={styles.profile}>
        {p.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatar} alt="" width={96} height={96} className={styles.avatar} />
        ) : (
          <span aria-hidden="true" className={styles.avatar} />
        )}
        <div className={styles.nameBlock}>
          <span className={styles.name}>{p.name}</span>
          <p className={styles.bio}>{p.bio}</p>
        </div>
        <div className={styles.links}>
          {p.links.map((l) => (
            <a key={l.label} href={l.href}>{l.label}</a>
          ))}
          <a href={`mailto:${p.email}`}>Email</a>
        </div>
      </div>
      <Section label="Experience" entries={p.experience} />
      <Section label="Education" entries={p.education} />
    </aside>
  );
}
