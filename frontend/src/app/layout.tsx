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
    <html lang="ja" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
