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
- `src/lib/providers.tsx` — ChakraProvider + QueryClientProvider (Client Component)
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
- `public/logo.svg` — ロゴ (src/assets/ から移動)
- `public/logo_simple.svg` — シンプルロゴ (src/assets/ から移動)

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

- [ ] **Step 1: アセットを public/ に先にコピーする（src/ 削除前）**

```bash
mkdir -p public/icons
cp src/assets/icons/server_active.png public/icons/server_active.png
cp src/assets/icons/server_inactive.png public/icons/server_inactive.png
cp src/assets/logo.svg public/logo.svg
cp src/assets/logo_simple.svg public/logo_simple.svg
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
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 6: package.json の scripts に test コマンドを追記する**

`package.json` の `scripts` に以下を追加する（`next lint` の行の後）：

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
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
        whiteAlpha: {
          50:  { value: 'rgba(255, 255, 255, 0.04)' },
          100: { value: 'rgba(255, 255, 255, 0.06)' },
          200: { value: 'rgba(255, 255, 255, 0.08)' },
          300: { value: 'rgba(255, 255, 255, 0.16)' },
          400: { value: 'rgba(255, 255, 255, 0.24)' },
          500: { value: 'rgba(255, 255, 255, 0.36)' },
          600: { value: 'rgba(255, 255, 255, 0.48)' },
          700: { value: 'rgba(255, 255, 255, 0.64)' },
          800: { value: 'rgba(255, 255, 255, 0.80)' },
          900: { value: 'rgba(255, 255, 255, 0.92)' },
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
- Create: `src/lib/react-query.ts`, `src/lib/providers.tsx`

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

- [ ] **Step 2: src/lib/providers.tsx を作成する**

`ChakraProvider` と `QueryClientProvider` はクライアントサイドのため `"use client"` が必要。QueryClient は `useState` で安定したインスタンスを保持する。

```tsx
'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createQueryClient } from '@/lib/react-query';
import { system } from '@/theme/index';

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
git add src/lib/
git commit -m "feat: add TanStack Query client and Providers component"
```

---

## Task 6: 共通コンポーネント

**Files:**
- Create: `src/components/shared/AccountMenu.tsx`, `src/components/shared/Header.tsx`, `src/components/shared/MainLayout.tsx`

- [ ] **Step 1: src/components/shared/AccountMenu.tsx を作成する**

Chakra UI v3 では `Menu` がコンポンドコンポーネントに変わった（`Menu.Root`, `Menu.Trigger` 等）。`@chakra-ui/icons` は廃止され `lucide-react` を使う。認証未実装のため Avatar は仮のサークルで代替。

```tsx
'use client';

import { Box, Center, Menu } from '@chakra-ui/react';
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
        <Box w={8} h={8} borderRadius="full" bg="gray.600" />
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

Next.js では `<img>` に next/image を使うことが推奨されるが、SVG は `<img>` タグが最もシンプル。Server Component のため `'use client'` 不要。

```tsx
import { Center, Flex } from '@chakra-ui/react';
import { AccountMenu } from './AccountMenu';

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="MC Server Manager" height={32} />
    </Center>
    <AccountMenu />
  </Flex>
);
```

- [ ] **Step 3: src/components/shared/MainLayout.tsx を作成する**

`@emotion/react` は Chakra UI v3 では不要。`height="100dvh"` で動的ビューポート高さを指定。

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
    height="100dvh"
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
import { Providers } from '@/lib/providers';

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

export function middleware(request: NextRequest) {
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

Chakra v3 では `Box as="span"` はそのまま動作する。`color="whiteAlpha.500"` は Task 4 のテーマで定義したトークンを参照する。

```tsx
'use client';

import { Box, Text } from '@chakra-ui/react';
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
      content = <Box as="span">STARTING...</Box>;
      break;
    case 'running': {
      const elapsed = startedAt ? formatElapsedTime(startedAt) : '';
      content = (
        <>
          <Box as="span">RUNNING</Box>
          {elapsed && (
            <Box as="span" marginLeft={1.5}>
              {elapsed} ago
            </Box>
          )}
        </>
      );
      break;
    }
    case 'stopping':
      content = <Box as="span">STOPPING...</Box>;
      break;
    case 'stopped': {
      const elapsed = stoppedAt ? formatElapsedTime(stoppedAt) : '';
      content = (
        <>
          <Box as="span">STOPPED</Box>
          {elapsed && (
            <Box as="span" marginLeft={1.5}>
              {elapsed} ago
            </Box>
          )}
        </>
      );
      break;
    }
    default:
      content = null;
  }

  return (
    <Text fontSize="xs" lineHeight="1.33" color="whiteAlpha.500">
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
    color={disabled ? 'whiteAlpha.400' : 'blue.500'}
    _hover={{ bg: 'transparent', color: disabled ? undefined : 'blue.300' }}
    onClick={onClick}
  >
    {type === 'start' ? <StartIcon /> : <StopIcon />}
  </IconButton>
);
```

- [ ] **Step 6: ServerListItem を作成する**

Chakra v3 では `Stack spacing` → `Stack gap`、`Text noOfLines` → `Text lineClamp`。

```tsx
'use client';

import { Flex, HStack, Stack, Text } from '@chakra-ui/react';
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
  <Flex
    as="li"
    align="center"
    px={8}
    py={4}
    borderTop={isFirst ? '1px solid' : undefined}
    borderBottom="1px solid"
    borderColor="border.500"
    role="group"
  >
    <Flex align="center" gap={8} flex={1}>
      <ServerIcon isActive={server.state === 'running'} h={8} />
      <Stack gap={1} width="11rem">
        <Text lineClamp={1}>{server.name}</Text>
        <StateLabel
          serverState={server.state}
          startedAt={server.startedAt}
          stoppedAt={server.stoppedAt}
        />
      </Stack>
      {server.mcVersion && (
        <Text lineHeight="shorter" color="whiteAlpha.500">
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
  </Flex>
);
```

- [ ] **Step 7: ServerList を作成する**

`refetchInterval` に `getServerPollingInterval` を使い、`starting`/`stopping` 中のみポーリングを有効にする。TanStack Query v5 の `refetchInterval` は `(query) => number | false` のコールバック形式でも、データを受け取る関数形式でも渡せる。

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Box, Spinner, Text } from '@chakra-ui/react';
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
    <Box as="ul" listStyleType="none" m={0} p={0}>
      {data.map((server, idx) => (
        <ServerListItem key={server.id} isFirst={idx === 0} server={server} />
      ))}
    </Box>
  );
};
```

> **注意:** Chakra v3 では `<List>` → `<List.Root>`。`spacing` → `gap`。

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
  lib/                      # QueryClient、Providers 等
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
npm run lint      # ESLint
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
