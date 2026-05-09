# MC Server Manager

Minecraft サーバーをタイミングよく起動・停止するための Web アプリ。AWS EC2 インスタンスを管理し、クラウドコストを抑える。

## 技術スタック

- **フレームワーク:** Next.js 16（App Router）
- **UI:** Chakra UI v3（テーマは `/theme` に集約）
- **データフェッチ:** デフォルトは Server Components。クライアント状態が必要な場合のみ TanStack Query v5
- **テスト:** Vitest + React Testing Library
- **認証:** Better Auth（未実装、スコープ外）
- **バックエンド:** FastAPI on AWS Lambda（未実装、スコープ外）

## データフェッチ方針

- **基本:** Server Components で fetch する
- **TanStack Query を使うケース:** ポーリング、楽観的更新、クライアント側のキャッシュ管理が必要なとき
- サーバー一覧は `starting`/`stopping` 状態のサーバーが存在する間のみ 5 秒間隔でポーリングする

## コンポーネント配置ルール

| 場所 | 用途 |
|---|---|
| `app/[route]/_components/` | そのルート専用コンポーネント。他ルートから import しない |
| `components/shared/` | 複数ルートで使うが、プロジェクト文脈（認証・ドメイン知識）を含む共通コンポーネント |
| `components/ui/` | 他プロジェクトでも流用できる純粋 UI パーツ（ボタン、チェックボックス等）。必要になったら作る |

## テーマ

- Chakra UI v3 の `createSystem` + `defineConfig` を使う
- テーマ設定・recipe は `theme/` に置く
- recipe が増えたら `theme/recipes/` サブディレクトリを作る

## ディレクトリ構造

```
frontend/
  src/
    app/
      layout.tsx              # Root layout（Providers のみ）
      page.tsx                # / → /servers リダイレクト
      (main)/
        layout.tsx            # MainLayout 適用
        servers/
          page.tsx
          _components/        # サーバー一覧専用コンポーネント
      (auth)/
        login/
          page.tsx
          _components/
    components/shared/        # プロジェクト共通コンポーネント
    theme/                    # Chakra UI v3 テーマ
    lib/                      # QueryClient 等
    types/                    # 型定義
    utils/                    # ユーティリティ関数
  public/                     # 静的ファイル（画像・SVG）
  proxy.ts                    # Next.js middleware（アクセス制御）
```

## 開発コマンド

```bash
cd frontend
npm run dev       # 開発サーバー起動
npm run build     # ビルド
npm run test      # テスト（watch モード）
npm run test:run  # テスト（1 回実行）
```
