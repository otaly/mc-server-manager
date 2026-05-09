import { MainLayout } from '@/components/shared/MainLayout';

export default function MainGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
