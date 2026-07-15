---
title: Obsidian × Git × Astro でブログ公開パイプラインを組んだ
aliases: []
created: 2026-07-16
updated: 2026-07-16
tags:
  - tech/tool/astro
  - tech/tool/obsidian
  - tech/tool/github-actions
status: active
---

このVault（Obsidian）で書いたノートを、そのまま個人ブログとして公開する仕組みを作った。記事の一次情報源はあくまでVaultで、ブログ側（Astro）は「表示するだけ」の立場にしたかったので、その構成をメモしておく。

## 全体構成

```
notes (このVault, private)
  └── 60_blog/                 ← ここに置いた status:active なノートだけが公開対象
        ↓ push (60_blog/** に変更があったとき)
  GitHub Actions: repository_dispatch を astro-blog へ送信
        ↓
astro-blog (Astro, public)
  GitHub Actions: notesをcheckoutしてactive記事だけをミラー同期 → commit & push
        ↓
Cloudflare Pages (Git連携) が自動ビルド・デプロイ
```

Vaultとブログを別リポジトリに分けているのは、Vaultには`60_blog/`以外にも仕事のメモや日記など公開したくないノートが大量にあるため。公開対象は`status: active`のノートだけ、というフィルタをVault側のfrontmatterで管理し、CIがそれをそのまま反映する形にした。

## content collectionはfrontmatterをほぼそのまま使う

AstroのContent Layer（`glob()`ローダー）で、Vaultのfrontmatterスキーマ（`title` / `aliases` / `created` / `updated` / `tags` / `status`）をそのまま`zod`スキーマにした。Astro向けに`pubDate`などへ変換する層を挟まなかったので、同期スクリプトはfrontmatterを一切書き換えず、該当ファイルをコピーするだけで済んでいる。

```ts
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    aliases: z.array(z.string()).default([]),
    created: z.coerce.date(),
    updated: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    status: z.literal('active'),
  }),
});
```

## wikilinkは自前のremarkプラグインで解決した

Obsidianの`[[wikilink]]`をAstro側で解決するために既存の`@portaljs/remark-wiki-link`を入れたが、Astro 7が使う最新の`micromark`/`mdast-util-from-markdown`（v4/v2系）と噛み合わず、ビルドがクラッシュした。このパッケージが前提にしているmicromarkのメジャーバージョンが古く、依存解決で新しい方に寄せられてトークナイザーの内部状態が壊れるのが原因だった。

回避策として、mdastのtext nodeを正規表現で走査して`[[target]]` / `[[target|alias]]`を独自に`link`ノードへ置き換えるだけの小さなremarkプラグインを書いた。既存のmicromark拡張機構に頼らないぶん、バージョン間の非互換に巻き込まれにくい。存在しないノートへのリンクはリンクにせず、静かにプレーンテキストへ落とすようにしている。

## GITHUB_TOKENはリポジトリをまたげない

VaultリポジトリのCIからブログリポジトリを更新する、という構成にする上で地味にハマったのが、GitHub Actionsが自動発行する`GITHUB_TOKEN`は**実行中のリポジトリ自身にしかアクセスできない**という制約だった。同じアカウントが持つリポジトリ同士でも例外はない。

そのため今回は最小権限のfine-grained PATを2つ用意した。

- Vault → ブログ: `repository_dispatch`を送るための書き込み権限PAT
- ブログ → Vault: 記事を読み取るための読み取り専用PAT

同一リポジトリ内で完結する処理（同期後に自分自身へcommitする部分）は`GITHUB_TOKEN`のままで問題ない。クロスリポジトリの橋渡しだけ、明示的なPATが必要になる。

## UIはReactだが、JSは配信していない

デザイン部分はTailwind v4 + daisyUI v5、コンポーネントはReactで書いている。ただし`client:*`ディレクティブを一切付けていないので、Astroのアイランドアーキテクチャによりビルド時に静的HTMLへ変換されるだけで、ブラウザにJSは一切送られない。Reactの書き味を保ちながら、静的ブログとしてのパフォーマンス特性は崩さずに済んでいる。

## 運用フロー

Vault側で記事を書いて`status: active`にし、`60_blog/`に置いてpushするだけで、あとは自動でブログに反映されるところまで組めた。デザインの調整はブログリポジトリ側だけで完結するので、コンテンツとデザインの更新サイクルを分離できているのも狙い通り。
