import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverBand } from "@/components/CoverBand";
import { Toc } from "@/components/post/Toc";
import { site } from "@/content/site";
import { formatMonthYear } from "@/lib/format";
import { getAllPosts, getPost, getToc } from "@/lib/posts";
import styles from "@/components/post/post.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: post.meta.title, description: post.meta.subtitle } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const { meta } = post;
  const { default: Content } = await import(`@/content/posts/${slug}/index.mdx`);
  const toc = getToc(slug);
  const showStatus = process.env.NODE_ENV !== "production" && meta.status !== "published";

  return (
    <>
      <CoverBand fade={30}>
        <div className="container">
          <div className={styles.topRow}>
            <Link href="/" className={styles.blogName}>{site.name}</Link>
          </div>
          <div className={styles.headRow}>
            <div aria-hidden="true" className={styles.side} />
            <div className={styles.head}>
              <Link href="/" className={styles.back}>← All writing</Link>
              <div className={`meta ${styles.meta}`}>
                <span className="cat">{meta.category}</span>
                <span>{formatMonthYear(meta.date)}</span>
                {showStatus && <span className="status-label">{meta.status}</span>}
              </div>
              <h1 className={styles.title}>{meta.title}</h1>
              {meta.subtitle && <p className={styles.subtitle}>{meta.subtitle}</p>}
              <div className={styles.byline}>
                <span className={styles.author}>{site.profile.name}</span>
                <span aria-hidden="true" className={styles.dot} />
                {site.profile.links.map((l) => (
                  <a key={l.label} href={l.href}>{l.label}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CoverBand>

      <div className="container">
        <div className={styles.body}>
          <Toc items={toc} />
          <article className={`prose ${styles.article}`}>
            <Content />
            <div className="post-end">
              <span aria-hidden="true" className="post-end-mark">∎</span>
              <p>
                Thanks for reading. Spot a mistake? <a href={`mailto:${site.profile.email}`}>Tell me</a>.
              </p>
            </div>
            <section id="comments" aria-labelledby="comments-title" className={styles.comments}>
              <h2 id="comments-title" className={styles.commentsTitle}>Comments</h2>
              {/* giscus mounts here in Phase 5. */}
              <div className={styles.commentsSlot}>Comments load here. Readers sign in with GitHub to reply.</div>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
