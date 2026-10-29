import { RouterProvider } from 'react-router-dom';
import { AuthGate } from './AuthGate';
import { router } from './router';

export const AppProviders = () => (
  <AuthGate>
    <RouterProvider router={router} />
  </AuthGate>
);
