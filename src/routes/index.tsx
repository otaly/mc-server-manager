import { useBoolean } from '@chakra-ui/react';
import { Navigate, useRoutes } from 'react-router-dom';
import { protectedRoutes } from './protected';
import { publicRoutes } from './public';

export const AppRoutes = () => {
  const [isLoggingIn] = useBoolean(true);

  const routes = isLoggingIn ? protectedRoutes : publicRoutes;

  const element = useRoutes([
    ...routes,
    {
      path: '*',
      element: <Navigate to={isLoggingIn ? '/app' : '/auth'} />,
    },
  ]);

  return element;
};
