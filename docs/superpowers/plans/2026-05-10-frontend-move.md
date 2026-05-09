# Frontend Move Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** フロントエンドコードをモノレポ化に向けて `frontend/` サブディレクトリへ移動する。

**Architecture:** `git mv` でファイル履歴を保持しながら移動する。ルートには `docs/`・`CLAUDE.md`・`.github/` 等のリポジトリ共通ファイルのみ残す。ワークスペース管理ツールは後続タスクで対応する。

**Tech Stack:** Next.js 16, git mv, GitHub Actions

---

## File Map

### 移動（`git mv`）

| 移動元 | 移動先 |
|---|---|
| `src/` | `frontend/src/` |
| `public/` | `frontend/public/` |
| `package.json` | `frontend/package.json` |
| `package-lock.json` | `frontend/package-lock.json` |
| `next.config.ts` | `frontend/next.config.ts` |
| `tsconfig.json` | `frontend/tsconfig.json` |
| `vitest.config.ts` | `frontend/vitest.config.ts` |
| `vitest.setup.ts` | `frontend/vitest.setup.ts` |
| `proxy.ts` | `frontend/proxy.ts` |
| `.eslintrc.json` | `frontend/.eslintrc.json` |
| `.prettierignore` | `frontend/.prettierignore` |
| `.prettierrc.json` | `frontend/.prettierrc.json` |

> `next-env.d.ts` は `.gitignore` で除外済みのため git mv 不要。`node_modules/` と `.next/` も gitignore 対象のため移動不要（`frontend/` で `npm ci` を実行し直す）。

### 更新

| ファイル | 変更内容 |
|---|---|
| `.gitignore` | ルート相対プレフィックス `/` を外してどのサブディレクトリでもマッチするよう変更 |
| `.github/workflows/update-screenshot.yml` | `working-directory` と `server_working_dir` を追加 |
| `CLAUDE.md` | 開発コマンドに `cd frontend` を追記 |

---

## Task 1: ファイルを `frontend/` へ移動

**Files:**
- Create dir: `frontend/`
- Move: 上記 File Map の全ファイル

- [ ] **Step 1: `frontend/` ディレクトリを作成して全ファイルを `git mv`**

```bash
mkdir frontend
git mv src frontend/src
git mv public frontend/public
git mv package.json frontend/package.json
git mv package-lock.json frontend/package-lock.json
git mv next.config.ts frontend/next.config.ts
git mv tsconfig.json frontend/tsconfig.json
git mv vitest.config.ts frontend/vitest.config.ts
git mv vitest.setup.ts frontend/vitest.setup.ts
git mv proxy.ts frontend/proxy.ts
git mv .eslintrc.json frontend/.eslintrc.json
git mv .prettierignore frontend/.prettierignore
git mv .prettierrc.json frontend/.prettierrc.json
```

- [ ] **Step 2: `git status` で移動結果を確認**

```bash
git status
```

期待する出力（例）:
```
Changes to be committed:
  renamed: .eslintrc.json -> frontend/.eslintrc.json
  renamed: .prettierignore -> frontend/.prettierignore
  renamed: .prettierrc.json -> frontend/.prettierrc.json
  renamed: next.config.ts -> frontend/next.config.ts
  renamed: package-lock.json -> frontend/package-lock.json
  renamed: package.json -> frontend/package.json
  renamed: proxy.ts -> frontend/proxy.ts
  renamed: public/... -> frontend/public/...
  renamed: src/... -> frontend/src/...
  renamed: tsconfig.json -> frontend/tsconfig.json
  renamed: vitest.config.ts -> frontend/vitest.config.ts
  renamed: vitest.setup.ts -> frontend/vitest.setup.ts
```

- [ ] **Step 3: コミット**

```bash
git commit -m "refactor: move frontend code to frontend/ subdirectory"
```

---

## Task 2: `.gitignore` を更新してどのサブディレクトリでもマッチするよう変更

**Files:**
- Modify: `.gitignore`

現状の `.gitignore` はルート相対パス（先頭 `/`）で記述されているため `frontend/` 配下をカバーしない。先頭の `/` を外すことでリポジトリ内どこにあっても同名ディレクトリが除外される。

- [ ] **Step 1: `.gitignore` の対象エントリを編集**

`.gitignore` の該当箇所を以下に書き換える:

```gitignore
# dependencies
node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
coverage

# next.js
.next/
out/

# production
build

# typescript
*.tsbuildinfo
next-env.d.ts
```

変更点:
- `/node_modules` → `node_modules`
- `/coverage` → `coverage`
- `/.next/` → `.next/`
- `/out/` → `out/`
- `/build` → `build`

（その他の行は変更なし）

- [ ] **Step 2: `git status` で `.gitignore` の変更のみ表示され `frontend/node_modules/` が untracked に出ないことを確認**

```bash
git status
```

期待する出力:
```
Changes not staged for commit:
  modified:   .gitignore
```

`frontend/node_modules/` や `frontend/.next/` が untracked として表示されないことを確認する。

- [ ] **Step 3: コミット**

```bash
git add .gitignore
git commit -m "chore: remove root-relative prefix from .gitignore to match any subdirectory"
```

---

## Task 3: GitHub Actions ワークフローを更新

**Files:**
- Modify: `.github/workflows/update-screenshot.yml`

- [ ] **Step 1: `Install` ステップと `Update Screenshot` ステップを編集**

`.github/workflows/update-screenshot.yml` の該当箇所を以下に書き換える:

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

- [ ] **Step 2: コミット**

```bash
git add .github/workflows/update-screenshot.yml
git commit -m "ci: update workflow to run npm commands in frontend/ subdirectory"
```

---

## Task 4: `CLAUDE.md` を更新

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 開発コマンドセクションを更新**

`CLAUDE.md` の `## 開発コマンド` セクションを以下に書き換える:

```markdown
## 開発コマンド

```bash
cd frontend
npm run dev       # 開発サーバー起動
npm run build     # ビルド
npm run test      # テスト（watch モード）
npm run test:run  # テスト（1 回実行）
```
```

- [ ] **Step 2: コミット**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md dev commands for frontend/ subdirectory"
```

---

## Task 5: 動作確認

**Files:** なし（確認のみ）

- [ ] **Step 1: `frontend/` で依存関係をインストール**

```bash
cd frontend && npm ci
```

期待する出力:
```
added NNN packages in Xs
```

- [ ] **Step 2: テストを実行して全パスすることを確認**

```bash
npm run test:run
```

期待する出力:
```
 ✓ src/utils/__tests__/... (N tests)
Test Files  N passed (N)
Tests       N passed (N)
```

- [ ] **Step 3: ビルドが通ることを確認**

```bash
npm run build
```

期待する出力:
```
Route (app)                Size     First Load JS
...
✓ Compiled successfully
```

- [ ] **Step 4: ルート直下に不要な `node_modules/` が残っていれば削除**

```bash
cd ..   # mc-server-manager/ に戻る
ls node_modules 2>/dev/null && rm -rf node_modules || echo "already clean"
```

（`node_modules/` は gitignore 対象のため git には影響しない）
