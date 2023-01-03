import { Navigate, Route, Routes } from 'react-router-dom';
import { Servers } from './Servers';

export const ServersRoutes = () => (
  <Routes>
    <Route path="" element={<Servers />} />
    <Route path="*" element={<Navigate to="." />} />
  </Routes>
);
