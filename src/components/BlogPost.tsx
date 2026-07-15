import type { ReactNode } from 'react';

type BlogPostProps = {
  title: string;
  created: Date;
  updated: Date;
  tags: string[];
  children: ReactNode;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function BlogPost({ title, created, updated, tags, children }: BlogPostProps) {
  return (
    <div className="page">
      <div className="measure">
        <div className="breadcrumbs crumbs">
          <ul>
            <li>
              <a href="/">ホーム</a>
            </li>
            <li>
              <a href="/blog">記事一覧</a>
            </li>
            <li>
              <span className="muted">{title}</span>
            </li>
          </ul>
        </div>
        <div className="eyebrow muted">技術メモ</div>
        <h1 className="h-post">{title}</h1>
        <div className="metaStack">
          <span>作成　{formatDate(created)}</span>
          {updated.getTime() !== created.getTime() && <span>更新　{formatDate(updated)}</span>}
        </div>
        {tags.length > 0 && (
          <div className="tags">
            {tags.map((tag) => (
              <span key={tag} className="badge badge-outline badge-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
        <hr />
        <div className="doc">{children}</div>
      </div>
    </div>
  );
}
