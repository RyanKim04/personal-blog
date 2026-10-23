"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/posts";
import styles from "./post.module.css";

// Active section = the last h2 whose top has crossed 35% of the viewport.
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const onScroll = () => {
      const limit = window.innerHeight * 0.35;
      let cur = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= limit) cur = it.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  if (items.length === 0) return <div className={styles.toc} />;

  return (
    <nav aria-label="Table of contents" className={styles.toc}>
      <span className={styles.tocLabel}>Table of contents</span>
      {items.map((it) => (
        <a key={it.id} href={`#${it.id}`} className={styles.tocItem} aria-current={it.id === active ? "location" : undefined}>
          <span className={styles.tocNum}>{it.num}</span>
          <span className={styles.tocText}>{it.label}</span>
        </a>
      ))}
    </nav>
  );
}
