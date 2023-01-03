import { lazyImport } from '@/utils/lazyImport';
import { RouteObject } from 'react-router-dom';

const { AuthRoutes } = lazyImport(
  () => import('@/features/auth'),
  'AuthRoutes'
);

export const publicRoutes: RouteObject[] = [
  {
    path: '/auth/*',
    element: <AuthRoutes />,
  },
];
