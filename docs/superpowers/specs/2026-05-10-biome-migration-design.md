# 設計: Prettier + ESLint → Biome 完全移行

## 概要

現在の Prettier + ESLint (Airbnb) 構成を Biome 1 本に統一する。
Airbnb ルールセットへの完全な互換性は求めず、Biome recommended ルールを採用する。

## パッケージ変更

### 削除 (devDependencies)

```
prettier
eslint
eslint-config-airbnb
eslint-config-airbnb-typescript
eslint-config-prettier
eslint-import-resolver-typescript
eslint-plugin-import
eslint-plugin-jsx-a11y
eslint-plugin-react
eslint-plugin-react-hooks
@typescript-eslint/eslint-plugin
@typescript-eslint/parser
```

### 追加 (devDependencies)

```
@biomejs/biome
lefthook
```

### 削除するファイル

```
frontend/.eslintrc.json
frontend/.prettierrc.json
```

### 追加するファイル

```
frontend/biome.json
lefthook.yml              # リポジトリルート
.github/workflows/lint.yml
```

### 変更しないファイル

```
.vscode/settings.json     # gitignore 済みのため対象外。手動で Biome 拡張の設定を追記する
```

## biome.json

`frontend/biome.json` に配置する。デフォルト値と異なる設定のみ記述する。

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

- `files.includes: ["**", "!!.next"]` — 全ファイルを対象にしつつ、`.next/`（ビルド出力）を force-ignore。`node_modules/` は Biome が常に自動除外。`next-env.d.ts` は `.gitignore` に記載されているため Biome のスキャナーが自動除外
- `indentStyle: "space"` — 現行 Prettier の `tabWidth: 2` に合わせる（デフォルトは `"tab"`）
- `quoteStyle: "single"` — 現行 Prettier の `singleQuote: true` に合わせる（デフォルトは `"double"`）
- `lineEnding`, `jsxQuoteStyle`, `linter.enabled`, `linter.rules.recommended`, `organizeImports.enabled` はデフォルト値と同じため省略

## npm scripts

`frontend/package.json` の scripts を以下に変更する。

```json
"lint": "biome lint .",
"format": "biome format --write .",
"check": "biome check --write ."
```

- `prettier` スクリプトは削除する
- 日常的には `check` を使う（lint + format + import 整理を一括実行）
- CI では `biome ci` を直接呼ぶためスクリプトには含めない

## lefthook.yml

リポジトリルートに配置する。

```yaml
pre-commit:
  commands:
    biome:
      glob: "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}"
      run: npx @biomejs/biome check --write --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}
      stage_fixed: true
```

- `{staged_files}` — ステージ済みファイルのみを対象にするので高速
- `stage_fixed: true` — 自動修正されたファイルを再ステージ
- `--files-ignore-unknown=true` — Biome が処理できない拡張子をエラーにしない
- `--colors=off` — ターミナルログに色コードが混入しない

## GitHub Actions

`.github/workflows/lint.yml` を新規作成する。

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

- `biome ci` はファイルを変更せず、違反があれば非ゼロで終了する
- リポジトリルートから実行するため対象パスを `frontend/src` に固定

## VS Code 設定（手動対応）

`.vscode/settings.json` は gitignore 済みのため実装タスクには含めない。
各開発者が手動で以下を追記する。

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

また、Biome VS Code 拡張 (`biomejs.biome`) のインストールが必要。
