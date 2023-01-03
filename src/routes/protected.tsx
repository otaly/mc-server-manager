import { MainLayout } from '@/components/Layout';
import { lazyImport } from '@/utils/lazyImport';
import { Suspense } from 'react';
import { Navigate, Outlet, RouteObject } from 'react-router-dom';

const { ServersRoutes } = lazyImport(
  () => import('@/features/servers'),
  'ServersRoutes'
);

const App = () => (
  <MainLayout>
    <Suspense fallback={<p>protected: Loading...</p>}>
      <Outlet />
    </Suspense>
  </MainLayout>
);

export const protectedRoutes: RouteObject[] = [
  {
    path: '/app',
    element: <App />,
    children: [
      { path: 'servers/*', element: <ServersRoutes /> },
      { path: '', element: <Navigate to="servers" /> },
      { path: '*', element: <Navigate to="servers" /> },
    ],
  },
];
