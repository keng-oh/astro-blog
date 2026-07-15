---
title: よく使うVimのキーバインド
aliases: []
created: 2026-07-16
updated: 2026-07-16
tags:
  - tech/tool/vim
status: active
---

# よく使うVimのキーバインド

普段よく使っているVimのキーバインドをいくつかメモしておく。

## 移動

- `gg` / `G`: ファイルの先頭・末尾へ移動
- `Ctrl-d` / `Ctrl-u`: 半画面スクロール
- `%`: 対応する括弧へ移動

## 編集

```vim
:%s/foo/bar/g
```

- `ciw`: カーソル位置の単語を変更
- `dd` → `p`: 行の入れ替え

関連: [[hello-world]]
