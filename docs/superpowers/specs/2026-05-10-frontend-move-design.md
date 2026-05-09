# Design: フロントエンドコードを `frontend/` へ移動

**Date:** 2026-05-10  
**Status:** Approved

## 背景

バックエンド・インフラを含むモノレポ化に向けて、既存のフロントエンドコードを `frontend/` サブディレクトリへ移動する。

## アプローチ

フラットな移動（Approach A）。`git mv` で履歴を保持しながら `frontend/` へ移動する。ルートにはリポジトリ全体に関わるファイルのみ残す。ワークスペース管理ツール（npm workspaces 等）は後続タスクで検討する。

## ファイル移動の範囲

### `frontend/` へ移動するもの

| ファイル/ディレクトリ | 理由 |
|---|---|
| `src/` | Next.js アプリ本体 |
| `public/` | 静的アセット |
| `package.json` | フロントエンド依存 |
| `package-lock.json` | ロックファイル |
| `next.config.ts` | Next.js 設定 |
| `tsconfig.json` | TypeScript 設定 |
| `vitest.config.ts` | テスト設定 |
| `vitest.setup.ts` | テストセットアップ |
| `next-env.d.ts` | Next.js 型定義 |
| `proxy.ts` | Next.js middleware |
| `.eslintrc.json` | フロントエンド用 ESLint |
| `.prettierignore` | Prettier 対象除外 |
| `.prettierrc.json` | フロントエンド用 Prettier |

### ルートに残すもの

| ファイル/ディレクトリ | 理由 |
|---|---|
| `docs/` | モノレポ全体のドキュメント |
| `CLAUDE.md` | モノレポ全体の AI 指示 |
| `README.md` | プロジェクト説明 |
| `__screenshots__/` | README から参照 |
| `.github/` | CI/CD ワークフロー |
| `.gitignore` | リポジトリ全体の除外設定 |
| `.vscode/` | エディタ設定 |
| `skills-lock.json` | Superpowers スキル管理 |
| `.claude/` | Claude Code 設定 |
| `.superpowers/` | Superpowers ブレインストーム履歴 |

## 設定ファイルの更新

### `.github/workflows/update-screenshot.yml`

`npm ci` に `working-directory: frontend` を追加。スクリーンショット取得ステップに `server_working_dir: frontend` を追加。

```yaml
- name: Install
  run: npm ci
  working-directory: frontend

- name: Update Screenshot
  uses: otaly/readme-screenshot-action@v1.0.0
  with:
    urls: http://localhost:3000/servers
    server_command: npm run dev
    server_working_dir: frontend
    width: 1280
    height: 832
    delay: 3000
```

### `CLAUDE.md`

開発コマンドを `frontend/` 配下で実行するよう記載を更新する。

```markdown
## 開発コマンド
cd frontend
npm run dev       # 開発サーバー起動
npm run build     # ビルド
npm run test      # テスト（watch モード）
npm run test:run  # テスト（1 回実行）
```

### `tsconfig.json`（frontend 内）

パスエイリアス `@/*` は `./src/*` を指しており、`frontend/` 内では変更不要。

## 注意事項

- `node_modules/` と `.next/` は移動せず、`frontend/` で `npm ci` を実行し直す。
- `tsconfig.json` の `paths` は変更不要（相対パスのため）。
