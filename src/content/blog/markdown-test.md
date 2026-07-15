---
title: Markdownレンダリング確認
aliases: []
created: 2026-07-16
updated: 2026-07-16
tags:
  - tech/tool/astro
status: active
---

# Markdownレンダリング確認

このページはブログ側で各種Markdown記法が正しく表示されるかを確認するためのテストページです。

## テキスト装飾

**太字**、*斜体*、~~取り消し線~~、`インラインコード`。

## リスト

- 項目A
- 項目B
  - ネストした項目
- 項目C

1. 手順1
2. 手順2
3. 手順3

## コードブロック

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

## テーブル

| 項目   | 値  |
| ------ | --- |
| Alpha  | 1   |
| Beta   | 2   |

## 引用・コールアウト

> 通常の引用ブロック。

> [!note]
> Obsidianのコールアウト記法（変換なしだとどう表示されるかの確認用）。

## リンク

- 外部リンク: [Astro Docs](https://docs.astro.build)
- Wikilink: [[hello-world]]

---

区切り線の上下確認。
