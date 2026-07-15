type Post = {
  id: string;
  title: string;
  created: Date;
  tags: string[];
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function BlogList({ posts }: { posts: Post[] }) {
  return (
    <div className="page">
      <div className="measure">
        <div className="breadcrumbs crumbs">
          <ul>
            <li>
              <a href="/">ホーム</a>
            </li>
            <li>
              <span className="muted">記事一覧</span>
            </li>
          </ul>
        </div>
        <div className="eyebrow muted">archive</div>
        <h1 className="h-page">記事一覧</h1>
        {posts.map((post, index) => (
          <div
            className="lrow"
            style={{
              paddingTop: index === 0 ? 0 : undefined,
              borderBottom: index === posts.length - 1 ? 'none' : undefined,
            }}
            key={post.id}
          >
            <div className="metarow">
              <a className="rowlink" href={`/blog/${post.id}`}>
                {post.title}
              </a>
              <span className="date">{formatDate(post.created)}</span>
            </div>
            {post.tags.length > 0 && (
              <div className="tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="badge badge-outline badge-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
