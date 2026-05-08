# Next.js App Router + Chakra UI v3 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vite + React SPA を Next.js 16 App Router + Chakra UI v3 + TanStack Query v5 へ移行する。認証・実APIは対象外。モックデータ・常時ログイン済み状態を維持する。

**Architecture:** App Router のファイルベースルーティングを使い、`app/(main)/` にメインレイアウト適用ルート、`app/(auth)/` に認証ルートを置く。データフェッチはデフォルト Server Components。サーバー一覧はポーリングが必要なため TanStack Query v5 Client Component で実装し、`starting`/`stopping` 状態のサーバーが存在する間のみ refetchInterval を有効にする。

**Tech Stack:** Next.js 16, Chakra UI v3, TanStack Query v5, TypeScript 6, Vitest + React Testing Library, lucide-react

---

## ファイルマップ

### 新規作成（すべて `src/` 以下）
- `src/app/layout.tsx` — Root layout
- `src/app/page.tsx` — / → /servers リダイレクト
- `src/app/(main)/layout.tsx` — MainLayout 適用
- `src/app/(main)/servers/page.tsx` — サーバー一覧ページ (Server Component)
- `src/app/(main)/servers/_components/mockServers.ts` — モックデータ
- `src/app/(main)/servers/_components/ServerList.tsx` — TanStack Query Client Component
- `src/app/(main)/servers/_components/ServerListItem.tsx` — サーバー行
- `src/app/(main)/servers/_components/ControlButton.tsx` — 起動/停止ボタン
- `src/app/(main)/servers/_components/StateLabel.tsx` — 状態ラベル
- `src/app/(main)/servers/_components/ServerIcon.tsx` — サーバーアイコン
- `src/app/(auth)/login/page.tsx` — ログインページ
- `src/app/(auth)/login/_components/LoginButtons.tsx` — OAuth ボタン群
- `src/components/shared/AccountMenu.tsx` — ユーザーメニュー (Client Component)
- `src/components/shared/Header.tsx` — アプリヘッダー (Server Component)
- `src/components/shared/MainLayout.tsx` — メインレイアウトラッパー (Server Component)
- `src/theme/index.ts` — Chakra UI v3 createSystem
- `src/lib/react-query.ts` — TanStack Query v5 QueryClient
- `src/app/_components/providers.tsx` — ChakraProvider + QueryClientProvider (Client Component)
- `src/types/server.ts` — Server 型定義
- `src/utils/format.ts` — formatElapsedTime ユーティリティ
- `src/utils/pollingInterval.ts` — ポーリング間隔条件ロジック
- `src/utils/__tests__/pollingInterval.test.ts` — pollingInterval ユニットテスト

### 新規作成（ルート直下）
- `proxy.ts` — Next.js middleware（アクセス制御の骨格。Next.js 規約上 `src/` 外でも可）
- `vitest.config.ts` — Vitest 設定
- `vitest.setup.ts` — testing-library/jest-dom セットアップ
- `CLAUDE.md` — プロジェクト規約
- `public/icons/server_active.png` — アクティブアイコン (src/assets/ から移動)
- `public/icons/server_inactive.png` — 非アクティブアイコン (src/assets/ から移動)

> **SVGロゴはインライン化する。** `logo.svg` / `logo_simple.svg` は `src/components/shared/Header.tsx` にパスを直接埋め込む。`public/` への移動不要。

### 変更（create-next-app が生成・手書き不要）
- `package.json` — next/react/react-dom/@types 含む。追加 deps は別途 install
- `tsconfig.json` — `@/*` → `./src/*` エイリアス付きで生成される
- `.gitignore` — `.next/` 自動追記済み

> **ESLint/Prettier は触らない。** この後に Biome 移行を行うため、`.eslintrc.json` と `.prettierrc.json` はそのまま残す。

### 削除
- `vite.config.ts`
- `index.html`
- `tsconfig.node.json`
- `src/` の旧コード（create-next-app 実行後に新 `src/` として再構築）

---

## Task 1: アセット移動・create-next-app・Vite 除去

`create-next-app` に `tsconfig.json`、`next.config.ts`、`package.json` のベースを生成させる。手書きは不要。

**Files:**
- Delete: `vite.config.ts`, `index.html`, `tsconfig.node.json`, `src/`
- Create: `public/icons/server_active.png`, `public/icons/server_inactive.png`, `public/logo.svg`, `public/logo_simple.svg`
- Generate: `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts` (create-next-app)

- [ ] **Step 1: PNG アイコンを public/ に先にコピーする（src/ 削除前）**

SVGロゴはコンポーネント内にインライン化するため不要。PNG アイコンのみ移動する。

```bash
mkdir -p public/icons
cp src/assets/icons/server_active.png public/icons/server_active.png
cp src/assets/icons/server_inactive.png public/icons/server_inactive.png
```

- [ ] **Step 2: Vite 関連ファイルと旧 src/ を削除する**

```bash
rm vite.config.ts index.html tsconfig.node.json
rm -rf src/
```

- [ ] **Step 3: create-next-app でプロジェクトを初期化する**

カレントディレクトリ（`.`）で実行する。`--src-dir` で `src/app/` が生成される。既存ファイルの上書き確認が出たら `y` で続ける。

```bash
npx create-next-app@latest . \
  --typescript \
  --no-eslint \
  --no-tailwind \
  --src-dir \
  --app \
  --import-alias="@/*" \
  --yes
```

生成されるファイル：`package.json`（next/react/react-dom + @types 含む）、`tsconfig.json`（`"@/*": ["./src/*"]` エイリアス付き）、`next.config.ts`、`next-env.d.ts`、`.gitignore`、`src/app/layout.tsx`、`src/app/page.tsx`、`src/app/globals.css`、`public/` のプレースホルダー SVG

- [ ] **Step 4: create-next-app が生成したサンプルファイルを削除する**

後続タスクで上書きするため削除する。

```bash
rm -f src/app/layout.tsx src/app/page.tsx src/app/globals.css
rm -f public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

- [ ] **Step 5: 追加 deps をインストールする**

```bash
npm install @chakra-ui/react @tanstack/react-query lucide-react dayjs
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 6: package.json の scripts に test コマンドを追記する**

`package.json` の `scripts` に以下を追加する。`next lint` は Next.js 16 で削除されたため追加しない。

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 7: コミットする**

```bash
git add -A
git commit -m "chore: migrate from Vite to Next.js via create-next-app, move assets to public/"
```

---

## Task 2: Vitest の設定

`tsconfig.json`・`next.config.ts` は create-next-app が生成済みのため手書き不要。ESLint/Prettier はこの後の Biome 移行で置き換えるため触らない。

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`

- [ ] **Step 1: vitest.config.ts を作成する**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
});
```

- [ ] **Step 2: vitest.setup.ts を作成する**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 3: コミットする**

```bash
git add vitest.config.ts vitest.setup.ts
git commit -m "chore: add Vitest configuration"
```

---

## Task 3: 型定義・ユーティリティ・ポーリング条件ロジック（TDD）

**Files:**
- Create: `src/types/server.ts`, `src/utils/format.ts`, `src/utils/pollingInterval.ts`, `src/utils/__tests__/pollingInterval.test.ts`

- [ ] **Step 1: src/types/server.ts を作成する**

```ts
export type ServerState = 'starting' | 'running' | 'stopping' | 'stopped';

export type Server = {
  id: string;
  name: string;
  mcVersion: string;
  state: ServerState;
  startedAt?: Date;
  stoppedAt?: Date;
};
```

- [ ] **Step 2: src/utils/format.ts を作成する**

```ts
import dayjs from 'dayjs';

export const formatDate = (date: Date) => dayjs(date).format('YYYY/M/D');

export const formatElapsedTime = (from: Date): string => {
  const now = new Date();
  const elapsedTimeMS = now.getTime() - from.getTime();
  const secondMS = 1000;
  const minuteMS = secondMS * 60;
  const hourMS = minuteMS * 60;
  const dayMS = hourMS * 24;

  if (elapsedTimeMS >= dayMS) {
    const elapsedDays = Math.floor(elapsedTimeMS / dayMS);
    return `${elapsedDays} day${elapsedDays > 1 ? 's' : ''}`;
  }
  if (elapsedTimeMS >= hourMS) {
    const elapsedHours = Math.floor(elapsedTimeMS / hourMS);
    return `${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}`;
  }
  if (elapsedTimeMS >= minuteMS) {
    const elapsedMinutes = Math.floor(elapsedTimeMS / minuteMS);
    return `${elapsedMinutes} minute${elapsedMinutes > 1 ? 's' : ''}`;
  }
  if (elapsedTimeMS >= secondMS) {
    const elapsedSeconds = Math.floor(elapsedTimeMS / secondMS);
    return `${elapsedSeconds} second${elapsedSeconds > 1 ? 's' : ''}`;
  }

  return `${elapsedTimeMS} ms`;
};
```

- [ ] **Step 3: ポーリング条件のテストを書く**

`src/utils/__tests__/pollingInterval.test.ts` を作成する：

```ts
import { describe, expect, it } from 'vitest';
import { getServerPollingInterval } from '../pollingInterval';
import type { Server } from '@/types/server';

const baseServer: Server = {
  id: '1',
  name: 'test',
  mcVersion: '1.12.0',
  state: 'stopped',
};

describe('getServerPollingInterval', () => {
  it('データが undefined のとき false を返す', () => {
    expect(getServerPollingInterval(undefined)).toBe(false);
  });

  it('全サーバーが stopped のとき false を返す', () => {
    const servers: Server[] = [
      { ...baseServer, state: 'stopped' },
      { ...baseServer, id: '2', state: 'stopped' },
    ];
    expect(getServerPollingInterval(servers)).toBe(false);
  });

  it('全サーバーが running のとき false を返す', () => {
    const servers: Server[] = [{ ...baseServer, state: 'running' }];
    expect(getServerPollingInterval(servers)).toBe(false);
  });

  it('starting のサーバーがいるとき 5000 を返す', () => {
    const servers: Server[] = [
      { ...baseServer, state: 'running' },
      { ...baseServer, id: '2', state: 'starting' },
    ];
    expect(getServerPollingInterval(servers)).toBe(5000);
  });

  it('stopping のサーバーがいるとき 5000 を返す', () => {
    const servers: Server[] = [
      { ...baseServer, state: 'stopped' },
      { ...baseServer, id: '2', state: 'stopping' },
    ];
    expect(getServerPollingInterval(servers)).toBe(5000);
  });
});
```

- [ ] **Step 4: テストを実行して失敗することを確認する**

```bash
npm run test:run src/utils/__tests__/pollingInterval.test.ts
```

Expected: FAIL — `Cannot find module '../pollingInterval'`

- [ ] **Step 5: src/utils/pollingInterval.ts を実装する**

```ts
import type { Server } from '@/types/server';

export const getServerPollingInterval = (
  servers: Server[] | undefined
): number | false => {
  if (!servers) return false;
  const hasTransientState = servers.some(
    (s) => s.state === 'starting' || s.state === 'stopping'
  );
  return hasTransientState ? 5000 : false;
};
```

- [ ] **Step 6: テストを実行して全て通ることを確認する**

```bash
npm run test:run src/utils/__tests__/pollingInterval.test.ts
```

Expected: PASS (5 tests)

- [ ] **Step 7: コミットする**

```bash
git add src/types/ src/utils/
git commit -m "feat: add Server types, format utils, and polling interval logic"
```

---

## Task 4: Chakra UI v3 テーマ設定

**Files:**
- Create: `src/theme/index.ts`

- [ ] **Step 1: src/theme/index.ts を作成する**

```ts
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const font =
  'Helvetica, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", Arial, Meiryo, sans-serif';

const config = defineConfig({
  globalCss: {
    'html, body': {
      color: 'white',
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: font },
        body: { value: font },
      },
      lineHeights: {
        base: { value: '1.4' },
        taller: { value: '1.8' },
      },
      colors: {
        bg: {
          400: { value: '#383838' },
          500: { value: '#2c2c2c' },
          700: { value: '#1e1e1e' },
        },
        border: {
          500: { value: '#444444' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
```

- [ ] **Step 2: コミットする**

```bash
git add src/theme/
git commit -m "feat: add Chakra UI v3 theme"
```

---

## Task 5: TanStack Query クライアントと Providers

**Files:**
- Create: `src/lib/react-query.ts`, `src/app/_components/providers.tsx`

> **`providers.tsx` の場所:** `src/app/_components/providers.tsx` に置く。`app/` 直下は `layout.tsx` / `page.tsx` のみ、それ以外はプライベートフォルダ（`_components/`, `_hooks/` 等）に収める方針。

- [ ] **Step 1: src/lib/react-query.ts を作成する**

TanStack Query v5 の QueryClient。v5 では `useErrorBoundary` → `throwOnError`、`suspense` オプションは廃止（`useSuspenseQuery` を使う）。

```ts
import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError: true,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
```

- [ ] **Step 2: src/app/_components/providers.tsx を作成する**

`ChakraProvider` と `QueryClientProvider` はクライアントサイドのため `"use client"` が必要。QueryClient は `useState` で安定したインスタンスを保持する。

```tsx
'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createQueryClient } from '@/lib/react-query';
import { system } from '@/theme';

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ChakraProvider value={system}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ChakraProvider>
  );
};
```

- [ ] **Step 3: コミットする**

```bash
git add src/lib/ src/app/_components/
git commit -m "feat: add TanStack Query client and Providers component"
```

---

## Task 6: 共通コンポーネント

**Files:**
- Create: `src/components/shared/AccountMenu.tsx`, `src/components/shared/Header.tsx`, `src/components/shared/MainLayout.tsx`

- [ ] **Step 1: src/components/shared/AccountMenu.tsx を作成する**

Chakra UI v3 では `Menu` がコンポンドコンポーネントに変わった（`Menu.Root`, `Menu.Trigger` 等）。`@chakra-ui/icons` は廃止され `lucide-react` を使う。`Avatar` は Chakra UI v3 にも存在するため、`Avatar.Root` + `Avatar.Fallback` を使う。

```tsx
'use client';

import { Avatar, Center, Menu } from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';

export const AccountMenu = () => (
  <Menu.Root>
    <Menu.Trigger asChild>
      <Center
        as="button"
        gap={1}
        bg="transparent"
        border="none"
        cursor="pointer"
        color="white"
      >
        <Avatar.Root size="sm">
          <Avatar.Fallback />
        </Avatar.Root>
        <ChevronDown size={18} />
      </Center>
    </Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content bg="bg.700" shadow="lg" border="none">
        <Menu.Item
          value="logout"
          color="white"
          _hover={{ bg: 'blue.500' }}
          cursor="pointer"
        >
          Log out
        </Menu.Item>
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
);
```

- [ ] **Step 2: src/components/shared/Header.tsx を作成する**

SVGは `<img>` タグを使わず `Icon asChild` + インラインSVGで実装する。ロゴSVGのパスは既存の `src/assets/logo.svg` および `logo_simple.svg` から取得する（src/ 削除前に必ず確認）。

```tsx
import { Center, Flex, Icon } from '@chakra-ui/react';
import { AccountMenu } from './AccountMenu';

const LogoFull = () => (
  <Icon asChild w="auto" h={8} aria-label="MC Server Manager">
    <svg width="172" height="34" viewBox="0 0 172 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.4597 0H8.30645V2.16034H4.15322V0H0V15.1224H4.15322V6.48101H8.30645V15.1224H12.4597V0Z" fill="#EDF2F7"/>
      <path d="M22.8468 4.32068H27V2.16034H24.9234V0H16.6169V2.16034H14.5403V12.962H16.6169V15.1224H24.9234V12.962H27V10.8017H22.8468V12.962H18.6936V2.16034H22.8468V4.32068Z" fill="#EDF2F7"/>
      <path d="M4.15322 19.038H12.4597V16.8776H2.07661V19.038H0V21.1983H2.07661V23.3587H8.30645V29.8397H4.15322V27.6793H0V29.8397H2.07661V32H10.3831V29.8397H12.4597V23.3587H10.3831V21.1983H4.15322V19.038Z" fill="#EDF2F7"/>
      <path d="M27 16.8776H22.8468V19.038H18.6936V16.8776H14.5403V32H18.6936V23.3587H22.8468V32H27V16.8776Z" fill="#EDF2F7"/>
      <path d="M34.352 2.8H38.064L38.704 11.216V12.848H39.088V11.216L39.728 2.8H43.44V14H41.52V6.512L41.712 3.952H41.328L40.496 14H37.328L36.464 3.952H36.08L36.272 6.512V14H34.352V2.8ZM48.7249 12.304C49.1302 12.304 49.4609 12.2453 49.7169 12.128C49.9835 12 50.1862 11.8347 50.3249 11.632C50.4742 11.4187 50.5755 11.1787 50.6289 10.912C50.6822 10.6347 50.7089 10.352 50.7089 10.064V9.776H52.8209V10.064C52.8209 11.3973 52.4689 12.4267 51.7649 13.152C51.0715 13.8667 50.0582 14.224 48.7249 14.224C47.4449 14.224 46.4315 13.8347 45.6849 13.056C44.9382 12.2773 44.5649 11.1413 44.5649 9.648V7.152C44.5649 6.43733 44.6609 5.79733 44.8529 5.232C45.0449 4.656 45.3222 4.176 45.6849 3.792C46.0475 3.39733 46.4849 3.09867 46.9969 2.896C47.5089 2.68267 48.0849 2.576 48.7249 2.576C49.3862 2.576 49.9729 2.672 50.4849 2.864C50.9969 3.056 51.4235 3.33333 51.7649 3.696C52.1169 4.05867 52.3782 4.496 52.5489 5.008C52.7302 5.52 52.8209 6.096 52.8209 6.736V7.024H50.7089V6.736C50.7089 6.46933 50.6769 6.20267 50.6129 5.936C50.5489 5.66933 50.4422 5.42933 50.2929 5.216C50.1435 5.00267 49.9409 4.832 49.6849 4.704C49.4289 4.56533 49.1089 4.496 48.7249 4.496C48.3729 4.496 48.0689 4.56533 47.8129 4.704C47.5569 4.832 47.3435 5.01333 47.1729 5.248C47.0022 5.472 46.8742 5.73867 46.7889 6.048C46.7142 6.34667 46.6769 6.66133 46.6769 6.992V9.808C46.6769 10.1707 46.7142 10.5067 46.7889 10.816C46.8635 11.1147 46.9809 11.376 47.1409 11.6C47.3009 11.824 47.5089 12 47.7649 12.128C48.0315 12.2453 48.3515 12.304 48.7249 12.304ZM40.816 22.224C40.816 21.776 40.64 21.3867 40.288 21.056C39.9467 20.7253 39.4613 20.56 38.832 20.56C38.2987 20.56 37.8773 20.672 37.568 20.896C37.2587 21.1093 37.104 21.4027 37.104 21.776C37.104 21.968 37.1413 22.144 37.216 22.304C37.2907 22.4533 37.4187 22.592 37.6 22.72C37.792 22.8373 38.0373 22.944 38.336 23.04C38.6453 23.136 39.0347 23.2267 39.504 23.312C40.6773 23.5253 41.5733 23.8827 42.192 24.384C42.8107 24.8853 43.12 25.6267 43.12 26.608V26.8C43.12 27.3227 43.024 27.7973 42.832 28.224C42.6507 28.64 42.384 28.9973 42.032 29.296C41.68 29.5947 41.2533 29.824 40.752 29.984C40.2507 30.144 39.6853 30.224 39.056 30.224C38.32 30.224 37.6693 30.1227 37.104 29.92C36.5493 29.7067 36.0853 29.4187 35.712 29.056C35.3387 28.6827 35.056 28.2507 34.864 27.76C34.672 27.2587 34.576 26.7147 34.576 26.128V25.648H36.688V26.032C36.688 26.704 36.88 27.2427 37.264 27.648C37.6587 28.0427 38.2667 28.24 39.088 28.24C39.728 28.24 40.2027 28.1013 40.512 27.824C40.8213 27.5467 40.976 27.216 40.976 26.832C40.976 26.6507 40.944 26.48 40.88 26.32C40.816 26.1493 40.704 26 40.544 25.872C40.384 25.7333 40.1653 25.6107 39.888 25.504C39.6107 25.3973 39.2587 25.3067 38.832 25.232C38.2667 25.136 37.7493 25.0133 37.28 24.864C36.8107 24.704 36.4 24.496 36.048 24.24C35.7067 23.984 35.44 23.664 35.248 23.28C35.056 22.896 34.96 22.4267 34.96 21.872V21.776C34.96 21.3173 35.0507 20.896 35.232 20.512C35.424 20.1173 35.6853 19.776 36.016 19.488C36.3573 19.2 36.7627 18.976 37.232 18.816C37.712 18.656 38.2453 18.576 38.832 18.576C39.4933 18.576 40.08 18.672 40.592 18.864C41.104 19.0453 41.5307 19.296 41.872 19.616C42.224 19.936 42.4853 20.304 42.656 20.72C42.8373 21.136 42.928 21.5733 42.928 22.032V22.608H40.816V22.224ZM46.8209 26.688C46.8315 26.9227 46.8849 27.1413 46.9809 27.344C47.0875 27.536 47.2262 27.7067 47.3969 27.856C47.5782 27.9947 47.7809 28.1067 48.0049 28.192C48.2395 28.2667 48.4849 28.304 48.7409 28.304C49.2422 28.304 49.6262 28.2187 49.8929 28.048C50.1595 27.8667 50.3515 27.6533 50.4689 27.408L52.1969 28.368C52.1009 28.5707 51.9675 28.784 51.7969 29.008C51.6262 29.2213 51.4022 29.4187 51.1249 29.6C50.8582 29.7813 50.5275 29.9307 50.1329 30.048C49.7489 30.1653 49.2955 30.224 48.7729 30.224C48.1755 30.224 47.6315 30.128 47.1409 29.936C46.6502 29.744 46.2235 29.4667 45.8609 29.104C45.5089 28.7413 45.2315 28.2987 45.0289 27.776C44.8369 27.2533 44.7409 26.6613 44.7409 26V25.904C44.7409 25.296 44.8422 24.7413 45.0449 24.24C45.2582 23.7387 45.5462 23.312 45.9089 22.96C46.2715 22.608 46.6929 22.336 47.1729 22.144C47.6635 21.9413 48.1862 21.84 48.7409 21.84C49.4235 21.84 50.0102 21.9627 50.5009 22.208C50.9915 22.4427 51.3969 22.7467 51.7169 23.12C52.0369 23.4827 52.2715 23.888 52.4209 24.336C52.5702 24.7733 52.6449 25.2 52.6449 25.616V26.688H46.8209ZM48.7249 23.664C48.2129 23.664 47.7969 23.7973 47.4769 24.064C47.1569 24.32 46.9489 24.6187 46.8529 24.96H50.5969C50.5329 24.5867 50.3302 24.2773 49.9889 24.032C49.6582 23.7867 49.2369 23.664 48.7249 23.664ZM54.4578 22.064H57.8177V23.216H58.1058C58.2551 22.7787 58.5058 22.4427 58.8578 22.208C59.2204 21.9627 59.6524 21.84 60.1538 21.84C60.9431 21.84 61.5778 22.0907 62.0578 22.592C62.5378 23.0827 62.7778 23.8347 62.7778 24.848V25.2L60.6978 25.392V25.168C60.6978 24.7307 60.5858 24.384 60.3618 24.128C60.1378 23.8613 59.8018 23.728 59.3538 23.728C58.9058 23.728 58.5538 23.8827 58.2977 24.192C58.0418 24.5013 57.9138 24.944 57.9138 25.52V28.08H59.7378V30H54.2658V28.08H55.8978V23.984H54.4578V22.064ZM64.0786 22.064H66.2546L68.1266 29.04H68.4146L70.2866 22.064H72.4626L70.1906 30H66.3506L64.0786 22.064ZM76.2115 26.688C76.2222 26.9227 76.2755 27.1413 76.3715 27.344C76.4782 27.536 76.6168 27.7067 76.7875 27.856C76.9688 27.9947 77.1715 28.1067 77.3955 28.192C77.6302 28.2667 77.8755 28.304 78.1315 28.304C78.6328 28.304 79.0168 28.2187 79.2835 28.048C79.5502 27.8667 79.7422 27.6533 79.8595 27.408L81.5875 28.368C81.4915 28.5707 81.3582 28.784 81.1875 29.008C81.0168 29.2213 80.7928 29.4187 80.5155 29.6C80.2488 29.7813 79.9182 29.9307 79.5235 30.048C79.1395 30.1653 78.6862 30.224 78.1635 30.224C77.5662 30.224 77.0222 30.128 76.5315 29.936C76.0408 29.744 75.6142 29.4667 75.2515 29.104C74.8995 28.7413 74.6222 28.2987 74.4195 27.776C74.2275 27.2533 74.1315 26.6613 74.1315 26V25.904C74.1315 25.296 74.2328 24.7413 74.4355 24.24C74.6488 23.7387 74.9368 23.312 75.2995 22.96C75.6622 22.608 76.0835 22.336 76.5635 22.144C77.0542 21.9413 77.5768 21.84 78.1315 21.84C78.8142 21.84 79.4008 21.9627 79.8915 22.208C80.3822 22.4427 80.7875 22.7467 81.1075 23.12C81.4275 23.4827 81.6622 23.888 81.8115 24.336C81.9608 24.7733 82.0355 25.2 82.0355 25.616V26.688H76.2115ZM78.1155 23.664C77.6035 23.664 77.1875 23.7973 76.8675 24.064C76.5475 24.32 76.3395 24.6187 76.2435 24.96H79.9875C79.9235 24.5867 79.7208 24.2773 79.3795 24.032C79.0488 23.7867 78.6275 23.664 78.1155 23.664ZM83.8484 22.064H87.2084V23.216H87.4964C87.6457 22.7787 87.8964 22.4427 88.2484 22.208C88.611 21.9627 89.043 21.84 89.5444 21.84C90.3337 21.84 90.9684 22.0907 91.4484 22.592C91.9284 23.0827 92.1684 23.8347 92.1684 24.848V25.2L90.0884 25.392V25.168C90.0884 24.7307 89.9764 24.384 89.7524 24.128C89.5284 23.8613 89.1924 23.728 88.7444 23.728C88.2964 23.728 87.9444 23.8827 87.6884 24.192C87.4324 24.5013 87.3044 24.944 87.3044 25.52V28.08H89.1284V30H83.6564V28.08H85.2884V23.984H83.8484V22.064ZM102.93 18.8H106.642L107.282 27.216V28.848H107.666V27.216L108.306 18.8H112.018V30H110.098V22.512L110.29 19.952H109.906L109.074 30H105.906L105.042 19.952H104.658L104.85 22.512V30H102.93V18.8ZM118.759 28.848C118.546 29.3493 118.247 29.7067 117.863 29.92C117.479 30.1227 117.031 30.224 116.519 30.224C116.039 30.224 115.586 30.1333 115.159 29.952C114.743 29.7707 114.375 29.504 114.055 29.152C113.735 28.8 113.479 28.3733 113.287 27.872C113.106 27.3707 113.015 26.8 113.015 26.16V25.904C113.015 25.2747 113.106 24.7093 113.287 24.208C113.468 23.7067 113.714 23.28 114.023 22.928C114.332 22.576 114.69 22.3093 115.095 22.128C115.511 21.936 115.954 21.84 116.423 21.84C116.988 21.84 117.442 21.936 117.783 22.128C118.135 22.32 118.412 22.6187 118.615 23.024H118.903V22.064H120.919V27.6C120.919 27.92 121.063 28.08 121.351 28.08H121.655V30H120.279C119.916 30 119.618 29.8933 119.383 29.68C119.159 29.4667 119.047 29.1893 119.047 28.848H118.759ZM116.967 28.304C117.554 28.304 118.023 28.112 118.375 27.728C118.727 27.3333 118.903 26.8 118.903 26.128V25.936C118.903 25.264 118.727 24.736 118.375 24.352C118.023 23.9573 117.554 23.76 116.967 23.76C116.38 23.76 115.911 23.9573 115.559 24.352C115.207 24.736 115.031 25.264 115.031 25.936V26.128C115.031 26.8 115.207 27.3333 115.559 27.728C115.911 28.112 116.38 28.304 116.967 28.304ZM125.436 30H123.42V22.064H125.436V23.248H125.724C125.905 22.8 126.199 22.4533 126.604 22.208C127.009 21.9627 127.484 21.84 128.028 21.84C128.412 21.84 128.769 21.904 129.1 22.032C129.441 22.1493 129.74 22.336 129.996 22.592C130.252 22.848 130.449 23.1733 130.588 23.568C130.737 23.9627 130.812 24.432 130.812 24.976V30H128.796V25.488C128.796 24.9227 128.657 24.48 128.38 24.16C128.113 23.8293 127.724 23.664 127.212 23.664C126.615 23.664 126.167 23.8667 125.868 24.272C125.58 24.6667 125.436 25.2 125.436 25.872V30ZM138.353 28.848C138.139 29.3493 137.841 29.7067 137.457 29.92C137.073 30.1227 136.625 30.224 136.113 30.224C135.633 30.224 135.179 30.1333 134.753 29.952C134.337 29.7707 133.969 29.504 133.649 29.152C133.329 28.8 133.073 28.3733 132.881 27.872C132.699 27.3707 132.609 26.8 132.609 26.16V25.904C132.609 25.2747 132.699 24.7093 132.881 24.208C133.062 23.7067 133.307 23.28 133.617 22.928C133.926 22.576 134.283 22.3093 134.689 22.128C135.105 21.936 135.547 21.84 136.017 21.84C136.582 21.84 137.035 21.936 137.377 22.128C137.729 22.32 138.006 22.6187 138.209 23.024H138.497V22.064H140.513V27.6C140.513 27.92 140.657 28.08 140.945 28.08H141.249V30H139.873C139.51 30 139.211 29.8933 138.977 29.68C138.753 29.4667 138.641 29.1893 138.641 28.848H138.353ZM136.561 28.304C137.147 28.304 137.617 28.112 137.969 27.728C138.321 27.3333 138.497 26.8 138.497 26.128V25.936C138.497 25.264 138.321 24.736 137.969 24.352C137.617 23.9573 137.147 23.76 136.561 23.76C135.974 23.76 135.505 23.9573 135.153 24.352C134.801 24.736 134.625 25.264 134.625 25.936V26.128C134.625 26.8 134.801 27.3333 135.153 27.728C135.505 28.112 135.974 28.304 136.561 28.304ZM148.678 28.848H148.39C148.304 29.0293 148.198 29.2053 148.07 29.376C147.952 29.536 147.792 29.68 147.59 29.808C147.398 29.936 147.163 30.0373 146.886 30.112C146.619 30.1867 146.294 30.224 145.91 30.224C145.419 30.224 144.96 30.1387 144.534 29.968C144.118 29.7867 143.75 29.5253 143.43 29.184C143.12 28.832 142.875 28.4053 142.694 27.904C142.523 27.4027 142.438 26.8267 142.438 26.176V25.888C142.438 25.248 142.528 24.6773 142.71 24.176C142.902 23.6747 143.158 23.2533 143.478 22.912C143.808 22.56 144.187 22.2933 144.614 22.112C145.051 21.9307 145.51 21.84 145.99 21.84C146.63 21.84 147.136 21.9627 147.51 22.208C147.883 22.4427 148.176 22.7787 148.39 23.216H148.678V22.064H150.694V31.952C150.694 32.3147 150.576 32.6133 150.342 32.848C150.118 33.0827 149.824 33.2 149.462 33.2H144.118V31.28H148.246C148.534 31.28 148.678 31.12 148.678 30.8V28.848ZM146.566 28.304C147.195 28.304 147.702 28.1067 148.086 27.712C148.48 27.3067 148.678 26.7787 148.678 26.128V25.936C148.678 25.2853 148.48 24.7627 148.086 24.368C147.702 23.9627 147.195 23.76 146.566 23.76C145.936 23.76 145.424 23.9573 145.03 24.352C144.646 24.736 144.454 25.264 144.454 25.936V26.128C144.454 26.8 144.646 27.3333 145.03 27.728C145.424 28.112 145.936 28.304 146.566 28.304ZM154.587 26.688C154.597 26.9227 154.651 27.1413 154.747 27.344C154.853 27.536 154.992 27.7067 155.163 27.856C155.344 27.9947 155.547 28.1067 155.771 28.192C156.005 28.2667 156.251 28.304 156.507 28.304C157.008 28.304 157.392 28.2187 157.659 28.048C157.925 27.8667 158.117 27.6533 158.235 27.408L159.963 28.368C159.867 28.5707 159.733 28.784 159.562 29.008C159.392 29.2213 159.168 29.4187 158.891 29.6C158.624 29.7813 158.293 29.9307 157.899 30.048C157.515 30.1653 157.061 30.224 156.539 30.224C155.941 30.224 155.397 30.128 154.907 29.936C154.416 29.744 153.989 29.4667 153.627 29.104C153.275 28.7413 152.997 28.2987 152.795 27.776C152.603 27.2533 152.507 26.6613 152.507 26V25.904C152.507 25.296 152.608 24.7413 152.811 24.24C153.024 23.7387 153.312 23.312 153.674 22.96C154.037 22.608 154.459 22.336 154.939 22.144C155.429 21.9413 155.952 21.84 156.507 21.84C157.189 21.84 157.776 21.9627 158.267 22.208C158.757 22.4427 159.163 22.7467 159.483 23.12C159.803 23.4827 160.037 23.888 160.187 24.336C160.336 24.7733 160.411 25.2 160.411 25.616V26.688H154.587ZM156.491 23.664C155.979 23.664 155.563 23.7973 155.243 24.064C154.923 24.32 154.715 24.6187 154.619 24.96H158.363C158.299 24.5867 158.096 24.2773 157.755 24.032C157.424 23.7867 157.003 23.664 156.491 23.664ZM162.223 22.064H165.583V23.216H165.871C166.021 22.7787 166.271 22.4427 166.623 22.208C166.986 21.9627 167.418 21.84 167.919 21.84C168.709 21.84 169.343 22.0907 169.823 22.592C170.303 23.0827 170.543 23.8347 170.543 24.848V25.2L168.463 25.392V25.168C168.463 24.7307 168.351 24.384 168.127 24.128C167.903 23.8613 167.567 23.728 167.119 23.728C166.671 23.728 166.319 23.8827 166.063 24.192C165.807 24.5013 165.679 24.944 165.679 25.52V28.08H167.503V30H162.031V28.08H163.663V23.984H162.223V22.064Z" fill="#EDF2F7"/>
    </svg>
  </Icon>
);

export const Header = () => (
  <Flex
    as="header"
    bg="bg.500"
    align="center"
    px={8}
    py={2}
    justify="space-between"
    position="sticky"
    top={0}
    borderBottom="1px solid"
    borderColor="border.500"
    zIndex={100}
  >
    <Center h={8}>
      <LogoFull />
    </Center>
    <AccountMenu />
  </Flex>
);
```

- [ ] **Step 3: src/components/shared/MainLayout.tsx を作成する**

`@emotion/react` は Chakra UI v3 では不要。`h="dvh"` で動的ビューポート高さを指定（Chakra v3 のショートハンド）。

```tsx
import { Flex } from '@chakra-ui/react';
import { Header } from './Header';

type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => (
  <Flex
    bg="bg.500"
    direction="column"
    position="relative"
    overflow="auto"
    h="dvh"
  >
    <Header />
    {children}
  </Flex>
);
```

- [ ] **Step 4: コミットする**

```bash
git add src/components/
git commit -m "feat: add shared layout components (Header, AccountMenu, MainLayout)"
```

---

## Task 7: Root レイアウト・Root ページ・Middleware

**Files:**
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `proxy.ts`

- [ ] **Step 1: src/app/layout.tsx を作成する**

Root layout は Server Component。`<Providers>` (Client Component) を子として受け取る。

```tsx
import type { Metadata } from 'next';
import { Providers } from '@/app/_components/providers';

export const metadata: Metadata = {
  title: 'MC Server Manager',
  description: 'Minecraft サーバー起動・停止管理',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: src/app/page.tsx を作成する**

`/` にアクセスしたら `/servers` にリダイレクトする。

```tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/servers');
}
```

- [ ] **Step 3: proxy.ts を作成する**

Next.js 16 の middleware ファイル名は `proxy.ts`。現時点ではアクセス制御のスケルトンのみ。

```ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/).*)'],
};
```

- [ ] **Step 4: コミットする**

```bash
git add src/app/layout.tsx src/app/page.tsx proxy.ts
git commit -m "feat: add root layout, redirect, and middleware skeleton"
```

---

## Task 8: (main) レイアウト・サーバー一覧コンポーネント群

**Files:**
- Create: `src/app/(main)/layout.tsx`, `src/app/(main)/servers/page.tsx`, `src/app/(main)/servers/_components/mockServers.ts`, `src/app/(main)/servers/_components/ServerIcon.tsx`, `src/app/(main)/servers/_components/StateLabel.tsx`, `src/app/(main)/servers/_components/ControlButton.tsx`, `src/app/(main)/servers/_components/ServerListItem.tsx`, `src/app/(main)/servers/_components/ServerList.tsx`

- [ ] **Step 1: src/app/(main)/layout.tsx を作成する**

```tsx
import { MainLayout } from '@/components/shared/MainLayout';

export default function MainGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
```

- [ ] **Step 2: モックデータを作成する**

`src/app/(main)/servers/_components/mockServers.ts` を作成する：

```ts
import type { Server } from '@/types/server';

export const MOCK_SERVERS: Server[] = [
  {
    id: '0',
    name: 'server-name',
    mcVersion: '1.8.0',
    state: 'stopped',
    stoppedAt: new Date('2023-01-03T01:00:00'),
  },
  {
    id: '1',
    name: 'server-name',
    mcVersion: '1.8.0',
    state: 'starting',
    stoppedAt: new Date('2023-01-02T01:00:00'),
  },
  {
    id: '2',
    name: '黄昏の森&魔法MOD',
    mcVersion: '1.12.0',
    state: 'running',
    startedAt: new Date('2023-01-03T01:00:00'),
  },
  {
    id: '3',
    name: 'server-name',
    mcVersion: '1.10.1',
    state: 'stopping',
  },
];

export const fetchServers = (): Promise<Server[]> =>
  new Promise((res) => {
    setTimeout(() => res(MOCK_SERVERS), 500);
  });
```

- [ ] **Step 3: ServerIcon を作成する**

Chakra v3 の `chakra()` ファクトリで `img` をラップし、Chakra スタイルプロップを使えるようにする。画像は `public/icons/` から参照する。

```tsx
'use client';

import { chakra } from '@chakra-ui/react';

const ChakraImg = chakra('img');

type ServerIconProps = React.ComponentProps<typeof ChakraImg> & {
  isActive?: boolean;
};

export const ServerIcon = ({ isActive = false, ...props }: ServerIconProps) => (
  <ChakraImg
    src={isActive ? '/icons/server_active.png' : '/icons/server_inactive.png'}
    alt={isActive ? 'active server' : 'inactive server'}
    {...props}
  />
);
```

- [ ] **Step 4: StateLabel を作成する**

Chakra v3 では `Box as="span"` の代わりに `Span` コンポーネントを使う。透過色は `white/36` で指定（`whiteAlpha` トークン不要）。

```tsx
'use client';

import { Span, Text } from '@chakra-ui/react';
import { formatElapsedTime } from '@/utils/format';
import type { ServerState } from '@/types/server';

type StateLabelProps = {
  serverState?: ServerState;
  startedAt?: Date;
  stoppedAt?: Date;
};

export const StateLabel = ({
  serverState = 'stopped',
  startedAt,
  stoppedAt,
}: StateLabelProps) => {
  let content: React.ReactNode;

  switch (serverState) {
    case 'starting':
      content = <Span>STARTING...</Span>;
      break;
    case 'running': {
      const elapsed = startedAt ? formatElapsedTime(startedAt) : '';
      content = (
        <>
          <Span>RUNNING</Span>
          {elapsed && (
            <Span ml={1.5}>
              {elapsed} ago
            </Span>
          )}
        </>
      );
      break;
    }
    case 'stopping':
      content = <Span>STOPPING...</Span>;
      break;
    case 'stopped': {
      const elapsed = stoppedAt ? formatElapsedTime(stoppedAt) : '';
      content = (
        <>
          <Span>STOPPED</Span>
          {elapsed && (
            <Span ml={1.5}>
              {elapsed} ago
            </Span>
          )}
        </>
      );
      break;
    }
    default:
      content = null;
  }

  return (
    <Text fontSize="xs" lineHeight="1.33" color="white/36">
      {content}
    </Text>
  );
};
```

- [ ] **Step 5: ControlButton を作成する**

Chakra v3 では `IconButton` の `icon` プロップが廃止され、children を使う。`isRound` → `rounded="full"`、`isDisabled` → `disabled`。`StartIcon`/`StopIcon` は SVG パス直書きの Chakra `Icon` コンポーネント（v3 でも `Icon` は利用可能）。

```tsx
'use client';

import { Icon, IconButton } from '@chakra-ui/react';

const StartIcon = () => (
  <Icon viewBox="0 0 48 48" w={9} h={9}>
    <path
      fill="currentColor"
      d="M19.15 32.5L32.5 24l-13.35-8.5zM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41zm0-17z"
    />
  </Icon>
);

const StopIcon = () => (
  <Icon viewBox="0 0 48 48" w={9} h={9}>
    <path
      fill="currentColor"
      d="M16.5 31.5h15v-15h-15zM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 23.95q0-4.1 1.575-7.75 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24.05 4q4.1 0 7.75 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44zm.05-3q7.05 0 12-4.975T41 23.95q0-7.05-4.95-12T24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24.05 41zM24 24z"
    />
  </Icon>
);

type ControlButtonProps = {
  type: 'start' | 'stop';
  disabled?: boolean;
  onClick?: () => void;
};

export const ControlButton = ({
  type,
  disabled = false,
  onClick,
}: ControlButtonProps) => (
  <IconButton
    aria-label="server control"
    rounded="full"
    variant="ghost"
    disabled={disabled}
    transitionDuration="300ms"
    color={disabled ? 'white/24' : 'blue.500'}
    _hover={{ bg: 'transparent', color: disabled ? undefined : 'blue.300' }}
    onClick={onClick}
  >
    {type === 'start' ? <StartIcon /> : <StopIcon />}
  </IconButton>
);
```

- [ ] **Step 6: ServerListItem を作成する**

Chakra v3 では `Stack spacing` → `Stack gap`、`Text noOfLines` → `Text lineClamp`。`as="li"` の代わりに `List.Item` を使う。

```tsx
'use client';

import { Flex, HStack, List, Stack, Text } from '@chakra-ui/react';
import type { Server } from '@/types/server';
import { ControlButton } from './ControlButton';
import { ServerIcon } from './ServerIcon';
import { StateLabel } from './StateLabel';

type ServerListItemProps = {
  isFirst?: boolean;
  server: Server;
};

export const ServerListItem = ({
  isFirst = false,
  server,
}: ServerListItemProps) => (
  <List.Item
    display="flex"
    alignItems="center"
    px={8}
    py={4}
    borderTop={isFirst ? '1px solid' : undefined}
    borderBottom="1px solid"
    borderColor="border.500"
    role="group"
  >
    <Flex align="center" gap={8} flex={1}>
      <ServerIcon isActive={server.state === 'running'} h={8} />
      <Stack gap={1} w="11rem">
        <Text lineClamp={1}>{server.name}</Text>
        <StateLabel
          serverState={server.state}
          startedAt={server.startedAt}
          stoppedAt={server.stoppedAt}
        />
      </Stack>
      {server.mcVersion && (
        <Text lineHeight="shorter" color="white/36">
          MC{server.mcVersion}
        </Text>
      )}
    </Flex>
    <HStack transitionDuration="100ms" opacity={0} _groupHover={{ opacity: 1 }}>
      <ControlButton
        type={
          server.state === 'stopped' || server.state === 'stopping'
            ? 'start'
            : 'stop'
        }
        disabled={server.state === 'starting' || server.state === 'stopping'}
        onClick={() => console.log('click. state:', server.state)}
      />
    </HStack>
  </List.Item>
);
```

- [ ] **Step 7: ServerList を作成する**

`refetchInterval` に `getServerPollingInterval` を使い、`starting`/`stopping` 中のみポーリングを有効にする。TanStack Query v5 の `refetchInterval` は `(query) => number | false` のコールバック形式でも、データを受け取る関数形式でも渡せる。

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { List, Spinner, Text } from '@chakra-ui/react';
import { getServerPollingInterval } from '@/utils/pollingInterval';
import { fetchServers } from './mockServers';
import { ServerListItem } from './ServerListItem';

export const ServerList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: fetchServers,
    refetchInterval: (query) => getServerPollingInterval(query.state.data),
  });

  if (isLoading) {
    return <Spinner size="lg" />;
  }

  if (!data || data.length === 0) {
    return <Text fontWeight="bold">No Servers Found</Text>;
  }

  return (
    <List.Root variant="plain">
      {data.map((server, idx) => (
        <ServerListItem key={server.id} isFirst={idx === 0} server={server} />
      ))}
    </List.Root>
  );
};

- [ ] **Step 8: src/app/(main)/servers/page.tsx を作成する**

```tsx
import { Container } from '@chakra-ui/react';
import { ServerList } from './_components/ServerList';

export default function ServersPage() {
  return (
    <Container mt={24} p={0} maxW="container.lg">
      <ServerList />
    </Container>
  );
}
```

- [ ] **Step 9: コミットする**

```bash
git add src/app/
git commit -m "feat: add server list page with conditional TanStack Query polling"
```

---

## Task 9: 認証ページ

**Files:**
- Create: `src/app/(auth)/login/_components/LoginButtons.tsx`, `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: src/app/(auth)/login/_components/LoginButtons.tsx を作成する**

現時点は UI スケルトンのみ。クリックハンドラーは未接続。

```tsx
'use client';

import { Button, Stack } from '@chakra-ui/react';

export const LoginButtons = () => (
  <Stack gap={4} w="full" maxW="sm">
    <Button
      variant="outline"
      colorPalette="gray"
      onClick={() => console.log('Google login')}
    >
      Google でログイン
    </Button>
    <Button
      variant="outline"
      colorPalette="gray"
      onClick={() => console.log('GitHub login')}
    >
      GitHub でログイン
    </Button>
  </Stack>
);
```

- [ ] **Step 2: src/app/(auth)/login/page.tsx を作成する**

```tsx
import { Center, Text } from '@chakra-ui/react';
import { LoginButtons } from './_components/LoginButtons';

export default function LoginPage() {
  return (
    <Center minH="100dvh" bg="bg.700" flexDirection="column" gap={8}>
      <Text fontSize="xl" fontWeight="bold">
        MC Server Manager
      </Text>
      <LoginButtons />
    </Center>
  );
}
```

- [ ] **Step 3: コミットする**

```bash
git add src/app/\(auth\)/
git commit -m "feat: add login page skeleton"
```

---

## Task 10: CLAUDE.md 作成・最終確認

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: CLAUDE.md を作成する**

```markdown
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

\`\`\`
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
\`\`\`

## 開発コマンド

\`\`\`bash
npm run dev       # 開発サーバー起動
npm run build     # ビルド
npm run test      # テスト（watch モード）
npm run test:run  # テスト（1 回実行）
\`\`\`
```

- [ ] **Step 2: 全テストを実行して通ることを確認する**

```bash
npm run test:run
```

Expected: PASS (5 tests in utils/__tests__/pollingInterval.test.ts)

- [ ] **Step 3: 開発サーバーを起動してブラウザで動作確認する**

```bash
npm run dev
```

確認項目：
- `http://localhost:3000` にアクセスして `/servers` にリダイレクトされる
- サーバー一覧が表示される（4 件のモックデータ）
- Header にロゴとアカウントメニューが表示される
- アカウントメニューをクリックして「Log out」メニューが表示される
- `http://localhost:3000/login` にアクセスしてログインページが表示される

- [ ] **Step 4: コミットする**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with project conventions"
```
