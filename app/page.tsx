import { CoverBand } from "@/components/CoverBand";
import { PostIndex } from "@/components/home/PostIndex";
import { Sidebar } from "@/components/home/Sidebar";
import { site } from "@/content/site";
import { getAllPosts } from "@/lib/posts";
import styles from "@/components/home/home.module.css";

export default function Home() {
  const posts = getAllPosts();
  return (
    <>
      <CoverBand fade={35}>
        <div className={`container ${styles.bandRow}`}>
          <h1 className={styles.blogName}>{site.name}</h1>
          {/* Mascot slot (Phase 3). Fixed size so the frog never shifts layout. */}
          <div className={styles.frogSlot} />
        </div>
      </CoverBand>
      <div className={`container ${styles.body}`}>
        <main className={styles.main}>
          <PostIndex posts={posts} categories={site.categories} showStatus={process.env.NODE_ENV !== "production"} />
        </main>
        <Sidebar />
      </div>
    </>
  );
}
