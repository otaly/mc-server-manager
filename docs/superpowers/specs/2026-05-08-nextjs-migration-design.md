# Next.js App Router + Chakra UI v3 移行設計

**日付:** 2026-05-08  
**対象:** mc-server-manager フロントエンド  
**ステータス:** 承認済み

---

## 概要

現在の Vite + React SPA を Next.js 16 App Router + Chakra UI v3 へ移行する。
認証・バックエンドAPI接続は本移行のスコープ外とし、モックデータ・常時ログイン済み状態を維持する。

---

## 技術スタック

| 領域 | 移行前 | 移行後 |
|---|---|---|
| フレームワーク | Vite + React SPA | Next.js 16（App Router） |
| UIライブラリ | Chakra UI v2 | Chakra UI v3 |
| ルーティング | React Router DOM v6 | Next.js ファイルベースルーティング |
| データフェッチ | React Query v3 | Server Components（基本）+ TanStack Query v5（ポーリング） |
| 認証 | 未実装（常にログイン済み） | 変更なし（スコープ外） |
| API | モックデータ | 変更なし（スコープ外） |
| ビルド | Vite | Next.js（Turbopack） |
| TypeScript | 4.x | 6.x |

---

## ディレクトリ構造

```
app/
  layout.tsx                    # Root layout: ChakraProvider + TanStack Query Provider
  page.tsx                      # / → /servers へリダイレクト
  (main)/
    layout.tsx                  # MainLayout（Header含む）を適用
    servers/
      page.tsx                  # Server Component（シェル）
      _components/
        ServerList.tsx          # "use client" + TanStack Query でポーリング
        ServerListItem.tsx
        ControlButton.tsx
        StateLabel.tsx
        ServerIcon.tsx
  (auth)/
    login/
      page.tsx                  # ログイン画面（現状未使用）
      _components/
        LoginButtons.tsx

components/
  shared/
    Header.tsx
    AccountMenu.tsx
    MainLayout.tsx
  # ui/ — 他プロジェクトでも流用できる純粋UIパーツが生まれたら追加

theme/
  index.ts                      # createSystem() をエクスポート（現状はデフォルト設定のみ）
  # recipes/ — recipe が増えたら追加

lib/
  react-query.ts                # QueryClient の設定

types/
  server.ts                     # Server 型定義

CLAUDE.md                       # プロジェクト規約
proxy.ts                        # Next.js middleware（アクセス制御）
```

---

## データフローとコンポーネント境界

```
app/(main)/servers/page.tsx        [Server Component]
  └─ _components/ServerList.tsx    [Client Component "use client"]
       ├─ useQuery('servers', fetchServers, { refetchInterval: starting/stopping中のみ5000 })
       └─ ServerListItem.tsx       [Client Component]
            ├─ ControlButton.tsx   [Client Component]
            └─ StateLabel.tsx      [Client Component]
```

- `page.tsx` はシェルのみ。将来、初期データをServer側でfetchしてpropsで渡す構造に移行しやすいよう境界を明確にしておく
- `ServerList` は TanStack Query でサーバー一覧を取得。`state` が `starting` または `stopping` のサーバーが存在する間のみポーリング（5秒間隔想定）。全サーバーが `running` / `stopped` になったらポーリングを停止
- Start/Stop ボタンは将来 Server Actions に接続予定。今回はモックのため未配線

---

## ルート構成

| URL | 内容 |
|---|---|
| `/` | `/servers` へリダイレクト |
| `/servers` | サーバー一覧 |
| `/login` | ログイン画面（現状は未使用） |

### Route Groups の役割

- `(main)/layout.tsx` — MainLayout（Header含む）を適用するルート群
- `(auth)/` — ヘッダーなしのレイアウト
- アクセス制御は `proxy.ts`（Next.js 16 の middleware ファイル名）で一元管理。Route Group の layout はレイアウト適用のみ担当

---

## CLAUDE.md に記載する規約

### 技術スタック
- Next.js 16 App Router
- Chakra UI v3（テーマは `/theme` に集約）
- TanStack Query v5（クライアントfetchが必要な場面のみ。基本はServer Components）

### データフェッチ方針
- デフォルトはServer Componentsでfetch
- ポーリング・楽観的更新など、クライアント状態が必要な場合のみTanStack Queryを使う

### コンポーネント配置ルール
- `app/[route]/_components/` — そのルート専用。他ルートからimportしない
- `components/shared/` — 複数ルートで使うが、プロジェクト文脈（認証・ドメイン知識）を含む共通コンポーネント
- `components/ui/` — 他プロジェクトでも流用できる純粋UIパーツ（ボタン、チェックボックス等）。必要になったら作る
- `theme/` — Chakra UI v3の `createSystem` 設定・recipe

---

## スコープ外（別タスク）

- Better Auth による認証実装（Google/GitHub OAuth、許可メールアドレス制限）
- FastAPI バックエンドへの実API接続
- DynamoDB による操作履歴管理
