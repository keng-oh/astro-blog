---
title: 自宅サーバーの入口を Cloudflare Tunnel 中心から Tailscale 中心に組み替える
aliases: []
created: 2026-11-11
updated: 2026-11-16
tags:
  - project/home-server
  - tech/tool/tailscale
  - tech/tool/caddy
  - tech/tool/cloudflare
  - tech/tool/security
status: active
---

Proxmox 上で動かしている自分用のサービス群を、これまで Cloudflare Tunnel 経由でほぼすべて外に出していた。最近は AI を使った攻撃で既知の脆弱性が突かれるまでの時間が短くなっているので、「自分用は Tailscale からだけ、外に出すのは本当に公開したいものだけ」という構成に組み替えた。最終的には、内部のネットワークを外に出す入口はなくなった。その設計をまとめておく。

## これまでの構成

```text
インターネット
  └─ Cloudflare ─ Tunnel ─ cloudflared ─ Nginx Proxy Manager ─ 各サービス（LXC）
                  （ingress は *.example.com のワイルドカード 1 本）
```

- Proxmox VE の上に OPNsense（VM）と LXC がいくつか載っている
- LXC は OPNsense の内側のセグメントにいる
- 外からのアクセスは、Cloudflare Tunnel から Nginx Proxy Manager（NPM）に渡して振り分けていた
- 一部のホストには Cloudflare Access をかけていた

## 見直して分かった問題

- **ワイルドカードの ingress**: cloudflared の ingress が `*.example.com` の 1 本だけなので、NPM にホストを足すと、それだけで外に出る。外に出すかどうかを判断する場所がなかった
- **Access のかけ漏れ**: 管理画面のいくつかに Cloudflare Access がかかっておらず、アプリのログイン画面だけで守られていた。設定する場所が NPM と Cloudflare の 2 か所に分かれているので、漏れに気づきにくい
- **NPM の IP 制限が効かない**: cloudflared と NPM が同じ場所にあるので、NPM から見た送信元は常に cloudflared になる。「LAN からのみ許可」のようなアクセスリストをかけても、インターネット全体を許可しているのと同じだった
- **スキャンが来ている**: アクセスログを見ると、`/wp-admin`・`/.env`・`/.git` を探しに来るリクエストがすでに届いていた

アクセスログを 1 か月分見直すと、外から本当に使われていたのは、公開しているアプリと、スマホのアプリから自分が使うものくらいだった。後者は Tailscale があれば外に出す必要がない。

## 新しい構成

```text
[インターネット]
  └─ （内部のネットワークへの入口なし）

[自分の端末（Tailscale を常時接続）]
  ① app.example.com → 公開 DNS が 192.168.1.201 を返す（DNS only）
  ② 192.168.1.0/24 はサブネットルート → OPNsense → 内部セグメント
  ③ Caddy :443（OPNsense 経由の送信元だけ許可。証明書は DNS-01）
  ④ 各サービス
```

### Tailscale の入口は OPNsense のサブネットルーター

OPNsense に Tailscale のプラグインを入れて、内部のセグメントをサブネットルートとして広告している。もともと SSH 用に使っていたので、Web もここにまとめた。

- LXC 側に Tailscale を入れなくて済む
- サブネットルーターを通ると送信元は OPNsense のアドレスに変換される（SNAT）。そのため、プロキシから見て端末の区別はつかない。誰が入れるかは Tailscale の ACL で絞る

Proxmox のホストだけは別に tailnet に入れる。管理画面がサブネットルートの範囲外にあることと、OPNsense 自体がこのホストの上の VM なので、OPNsense が落ちたときの入口が要るためだ。

### DNS は公開 DNS にプライベートアドレスを書く

`*.example.com` を、DNS only（Cloudflare のプロキシなし）でプロキシのプライベートアドレスに向ける。ワイルドカードなので、サービスを足すときに DNS をさわる必要はない。

- split DNS も Tailscale の DNS 設定も要らない。家でも外でも同じ URL で開ける
- 答えは誰でも引けるが、tailnet に入っていなければ届かない
- 端末の DNS は今までどおりなので、自宅が落ちてもスマホの普段の通信には影響しない

一部のルーターや DNS は、DNS rebinding 対策でプライベートアドレスの答えを捨てることがある。うちの環境（ホームゲートウェイ、8.8.8.8、1.1.1.1）では問題なく引けたが、使う回線と端末で確かめておいたほうがいい。

### NPM をやめて Caddy にする

Tailscale に移すと、全ホストに HTTPS と送信元の制限を付け直すことになる。手間が同じなら設定がファイルとして残るほうがいいので、Caddy に置き換えることにした。

```caddyfile
{
	acme_dns cloudflare {env.CF_API_TOKEN}
}

# OPNsense 経由（= tailnet）からだけ受ける
(private) {
	tls {
		dns cloudflare {env.CF_API_TOKEN}
	}
	@outside not remote_ip 192.168.1.1
	respond @outside 403
}

grafana.example.com {
	import private
	reverse_proxy 192.168.1.204:3000
}

# 同じセグメントの CT からも呼ぶホストは、その CT だけ許可に足す
app.example.com {
	tls {
		dns cloudflare {env.CF_API_TOKEN}
	}
	@outside not remote_ip 192.168.1.1 192.168.1.205
	respond @outside 403
	reverse_proxy 192.168.1.202:80
}
```

- 証明書は Let's Encrypt の DNS-01 で取る（`caddy-dns/cloudflare` を入れてビルドする）。外からの到達は要らない。API トークンは対象ゾーンの DNS 編集だけに絞る
- 送信元で判定するので、Docker は `network_mode: host` で動かす
- 同じセグメントの CT は OPNsense を通らずに直接届くので、送信元はその CT のアドレスになる。CT 同士で URL を使って呼び合うなら、そのアドレスを許可に足す

### 公開していたアプリも内部専用にした

移行の途中までは、公開アプリだけを Tunnel に残していた。cloudflared の ingress に公開するホスト名だけを並べ、Caddy では Tunnel（localhost）からしか受けない形だ。

ただ、そのアプリは新しいドメインで本番を別に立てることになり、今のものは検証環境として自分が使うだけになった。そこで、他のサービスと同じく tailnet からだけにし、cloudflared は撤去した。

## あわせて決めたこと

- **AdGuard Home は廃止する**: スマホの DoH のためだけに外に出していた。家全体の DNS にはしていなかったので、やめても困らない。DNS を自宅に依存させないほうを取った
- **n8n の MCP はローカルでつなぐ**: claude.ai のコネクタは Anthropic のクラウドから届くので、n8n を閉じると使えなくなる。使うのは自宅の Claude Code だけなので、そちらに MCP サーバーとして直接登録する
- **公開するアプリは DMZ から出す（次の段階）**: 本番は新しいドメインで別の VM（Dokploy）を DMZ に置き、その中で cloudflared を動かす。内部のセグメントは外部公開の経路に入れない

## 気をつけること

- **スマホの Tailscale を常時接続にする**
  - 電池の最適化の対象から外しておく
  - 「VPN なしの接続をブロック」は OFF にしておく。ON だと Tailscale が落ちたときに通信が全部止まる
  - Android は同時に 1 つしか VPN を使えないので、ほかの VPN アプリとは切り替えになる
- **Linux の端末**: サブネットルートを使うには `--accept-routes` が要る
- **単一障害点**: OPNsense とプロキシが単一障害点になる。ホストを直接 tailnet に入れておくのはそのため
