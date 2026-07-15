type RecentPost = {
  id: string;
  title: string;
  created: Date;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function HomePage({ recentPosts }: { recentPosts: RecentPost[] }) {
  return (
    <div className="page" style={{ textAlign: 'center' }}>
      <div className="eyebrow muted">notes</div>
      <h1 className="h-site">余白ノート</h1>
      <p className="muted lead">
        個人的な技術メモと雑記。Obsidian で書いたノートを、ほぼそのまま公開しています。
      </p>
      <hr />
      <div className="measure" style={{ textAlign: 'left' }}>
        <div className="eyebrow muted" style={{ marginBottom: '12px' }}>
          最近の記事
        </div>
        {recentPosts.map((post) => (
          <div className="metarow" style={{ padding: '7px 0' }} key={post.id}>
            <a className="rowlink" href={`/blog/${post.id}`}>
              {post.title}
            </a>
            <span className="date">{formatDate(post.created)}</span>
          </div>
        ))}
      </div>
      <hr />
      <div className="mono muted footerlinks">
        <a href="/blog">記事一覧</a>
        <a href="#">RSS</a>
        <a href="#">GitHub</a>
      </div>
    </div>
  );
}
