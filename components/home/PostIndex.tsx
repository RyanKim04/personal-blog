"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PostMeta } from "@/lib/posts";
import { formatMonthYear } from "@/lib/format";
import styles from "./home.module.css";

type Category = { id: string; label: string };

export function PostIndex({ posts, categories, showStatus }: { posts: PostMeta[]; categories: readonly Category[]; showStatus: boolean }) {
  const [active, setActive] = useState("all");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("category");
    if (fromUrl && categories.some((c) => c.id === fromUrl)) setActive(fromUrl);
  }, [categories]);

  function pick(id: string) {
    setActive(id);
    const url = new URL(window.location.href);
    if (id === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", id);
    window.history.replaceState(null, "", url);
  }

  const tabs = [{ id: "all", label: "All posts" }, ...categories];
  const visible = posts.filter((p) => active === "all" || p.category === active);

  return (
    <>
      <div role="group" aria-label="Categories" className={styles.catBar}>
        {tabs.map((c) => {
          const count = posts.filter((p) => c.id === "all" || p.category === c.id).length;
          return (
            <button key={c.id} type="button" aria-pressed={c.id === active} onClick={() => pick(c.id)} className={styles.catButton}>
              <span>{c.label}</span>
              <span className={styles.catCount}>{count}</span>
            </button>
          );
        })}
      </div>
      {visible.map((p) => (
        <article key={p.slug} className={styles.row}>
          <div className={styles.rowText}>
            <div className={`meta ${styles.rowMeta}`}>
              <span className="cat">{p.category}</span>
              <span>{formatMonthYear(p.date, true)}</span>
              {showStatus && p.status !== "published" && <span className="status-label">{p.status}</span>}
            </div>
            <h2 className={styles.rowTitle}>
              <Link href={`/${p.slug}`}>{p.title}</Link>
            </h2>
            {p.subtitle && <p className={styles.rowExcerpt}>{p.subtitle}</p>}
          </div>
          {p.thumbnail && <div aria-hidden="true" className={styles.thumb} />}
        </article>
      ))}
    </>
  );
}
