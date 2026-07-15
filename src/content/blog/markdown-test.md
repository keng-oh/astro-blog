---
title: Markdown てんこ盛りテスト
aliases: []
created: 2026-07-16
updated: 2026-07-17
tags: [test, markdown]
status: active
---

## 見出し2

本文の段落です。**太字**、*斜体*、~~取り消し線~~、`インラインコード`、そして[外部リンク](https://example.com)を含みます。

記事間リンクのテストです。[[hello-world|Hello World 記事へ]]、存在しない記事へのリンクは[[not-a-real-post|存在しない記事]]のようにプレーンテキストへ落ちます。

> 引用のテストです。
> 複数行にまたがる引用も確認します。

### 見出し3

#### 見出し4(doc内では見出し3と同じ扱いになるはず)

順序なしリスト:

- 項目A
- 項目B
  - ネストした項目B-1
  - ネストした項目B-2
- 項目C

順序ありリスト:

1. 最初のステップ
2. 次のステップ
3. 最後のステップ

タスクリスト:

- [x] 完了したタスク
- [ ] 未完了のタスク

表:

| 項目 | 説明 | 値 |
| --- | --- | --- |
| foo | ふー | 1 |
| bar | ばー | 2 |

言語指定ありコードブロック:

```ts
type Post = {
  title: string;
  tags: string[];
};

function greet(post: Post): string {
  return `Hello, ${post.title}`;
}
```

言語指定なしコードブロック:

```
plain text block
no language specified
```

画像のテスト:

![プレースホルダー画像](https://placehold.co/600x200)

水平線:

---

脚注のテストです[^1]。

[^1]: これは脚注の本文です。
