# Biome Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prettier + ESLint (Airbnb) を Biome 1 本に置き換え、lint・format・import 整理を統一する。

**Architecture:** ESLint/Prettier 関連パッケージをすべて削除して Biome をインストールし、`biome.json` で formatter と linter を設定する。pre-commit hook は lefthook で管理し、CI は GitHub Actions の `biome ci` で検査する。

**Tech Stack:** `@biomejs/biome` 2.x, `lefthook`, GitHub Actions (`biomejs/setup-biome@v2`)

**Spec:** `docs/superpowers/specs/2026-05-10-biome-migration-design.md`

---

## ファイル変更マップ

| 操作 | パス |
|------|------|
| 削除 | `frontend/.eslintrc.json` |
| 削除 | `frontend/.prettierrc.json` |
| 作成 | `frontend/biome.json` |
| 変更 | `frontend/package.json`（devDependencies・scripts） |
| 作成 | `lefthook.yml`（リポジトリルート） |
| 作成 | `.github/workflows/lint.yml` |

---

### Task 1: ESLint/Prettier を削除し Biome と lefthook をインストールする

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: 旧パッケージを削除する**

```bash
cd frontend
npm uninstall prettier eslint eslint-config-airbnb eslint-config-airbnb-typescript eslint-config-prettier eslint-import-resolver-typescript eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

- [ ] **Step 2: Biome と lefthook をインストールする**

```bash
npm install --save-dev @biomejs/biome lefthook
```

- [ ] **Step 3: インストールを確認する**

```bash
npx biome --version
```

期待値: `biome 2.x.x` のようなバージョン文字列が出力される

- [ ] **Step 4: コミットする**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: replace eslint/prettier with biome and lefthook"
```

---

### Task 2: biome.json を作成する

**Files:**
- Create: `frontend/biome.json`

- [ ] **Step 1: `frontend/biome.json` を作成する**

```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "files": {
    "includes": ["**", "!!.next"]
  },
  "formatter": {
    "indentStyle": "space"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  }
}
```

- [ ] **Step 2: Biome が設定を読めることを確認する**

```bash
cd frontend
npx biome check .
```

期待値: `Checked N file(s)` のような出力（エラーがあっても Step 3 で auto-fix するため問題ない）

- [ ] **Step 3: コミットする**

```bash
git add frontend/biome.json
git commit -m "chore: add biome.json"
```

---

### Task 3: npm scripts を更新し旧設定ファイルを削除する

**Files:**
- Modify: `frontend/package.json`
- Delete: `frontend/.eslintrc.json`
- Delete: `frontend/.prettierrc.json`

- [ ] **Step 1: `frontend/package.json` の scripts を更新する**

`scripts` セクションの `lint`・`prettier`・`format` を以下に置き換える。`check` を新規追加し、`postinstall` も追加する。

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --write .",
    "postinstall": "lefthook install",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "next typegen && tsc --noEmit"
  }
}
```

- [ ] **Step 2: 旧設定ファイルを削除する**

```bash
cd frontend
rm .eslintrc.json .prettierrc.json
```

- [ ] **Step 3: lint スクリプトが動くことを確認する**

```bash
cd frontend
npm run lint
```

期待値: Biome の lint 結果が出力される（警告・エラーがあっても次 Task で修正するため問題ない）

- [ ] **Step 4: コミットする**

```bash
git add frontend/package.json
git rm frontend/.eslintrc.json frontend/.prettierrc.json
git commit -m "chore: update npm scripts for biome, remove eslint/prettier config"
```

---

### Task 4: 既存コードに Biome を適用する

**Files:**
- Modify: `frontend/src/**`（auto-fix による変更）
- Modify: `frontend/next.config.ts`, `frontend/vitest.config.ts`, `frontend/proxy.ts`, `frontend/vitest.setup.ts`（auto-fix による変更）

- [ ] **Step 1: auto-fix を実行する**

```bash
cd frontend
npm run check
```

フォーマット・auto-fix 可能な lint 違反がすべて自動修正される。

- [ ] **Step 2: 残った lint エラーを確認する**

```bash
cd frontend
npm run lint
```

auto-fix できないエラーが残った場合は、該当ルールを `biome.json` で無効化する。例:

```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "files": {
    "includes": ["**", "!!.next"]
  },
  "formatter": {
    "indentStyle": "space"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  },
  "linter": {
    "rules": {
      "カテゴリ名": {
        "ルール名": "off"
      }
    }
  }
}
```

エラーがゼロになるまで繰り返す。

- [ ] **Step 3: 既存テストが通ることを確認する**

```bash
cd frontend
npm run test:run
```

期待値: すべてのテストが PASS

- [ ] **Step 4: コミットする**

```bash
cd frontend
git add -A
git commit -m "chore: apply biome formatting and lint auto-fixes"
```

---

### Task 5: lefthook を設定する

**Files:**
- Create: `lefthook.yml`（リポジトリルート）

- [ ] **Step 1: リポジトリルートに `lefthook.yml` を作成する**

```yaml
pre-commit:
  commands:
    biome:
      glob: "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}"
      run: npx @biomejs/biome check --write --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}
      stage_fixed: true
```

- [ ] **Step 2: lefthook の git hooks をインストールする**

```bash
npx lefthook install
```

期待値: `SYNCING...` の後に成功メッセージが表示される

- [ ] **Step 3: pre-commit hook が動くことを確認する**

```bash
npx lefthook run pre-commit
```

期待値: `biome` コマンドが実行され、エラーなく完了する

- [ ] **Step 4: コミットする**

```bash
git add lefthook.yml
git commit -m "chore: add lefthook pre-commit hook for biome"
```

---

### Task 6: GitHub Actions lint ワークフローを作成する

**Files:**
- Create: `.github/workflows/lint.yml`

- [ ] **Step 1: ディレクトリを作成する（存在しない場合）**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: `.github/workflows/lint.yml` を作成する**

```yaml
name: Lint

on:
  push:
    branches: [main]
  pull_request:

jobs:
  biome:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: biomejs/setup-biome@v2
      - run: biome ci frontend
```

- [ ] **Step 3: コミットする**

```bash
git add .github/workflows/lint.yml
git commit -m "ci: add GitHub Actions lint workflow with biome"
```

---

## 手動対応（実装タスク外）

`.vscode/settings.json` は `.gitignore` 済みのため、各開発者が手動で以下を追記する。
また Biome VS Code 拡張 (`biomejs.biome`) のインストールも手動で行う。

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```
