import { Navigate, createBrowserRouter } from 'react-router-dom';
import { RequireAdmin } from '@/features/auth/components/RequireAdmin';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage';
import { ShipmentsPage } from '@/features/shipments/pages/ShipmentsPage';
import { PaymentsPage } from '@/features/payments/pages/PaymentsPage';
import { ReceiptsPage } from '@/features/payments/pages/ReceiptsPage';
import { NewReceiptPage } from '@/features/payments/pages/NewReceiptPage';
import { ReceiptDetailPage } from '@/features/payments/pages/ReceiptDetailPage';
import { PartsPage } from '@/features/parts/pages/PartsPage';
import { PartFormPage } from '@/features/parts/pages/PartFormPage';
import { CatalogPage } from '@/features/parts/pages/CatalogPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { AuditLogPage } from '@/features/users/pages/AuditLogPage';
import { AdminLayout } from './AdminLayout';
import { NotFoundPage } from './NotFoundPage';
import { RouteError } from './RouteError';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage />, errorElement: <RouteError /> },

  // Every other page needs a login with ROLE_ADMIN.
  {
    element: <RequireAdmin />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/', element: <Navigate to="/orders" replace /> },
          { path: '/orders', element: <OrdersPage /> },
          { path: '/orders/:orderNo', element: <OrderDetailPage /> },
          { path: '/shipments', element: <ShipmentsPage /> },
          { path: '/payments', element: <PaymentsPage /> },
          { path: '/courier-receipts', element: <ReceiptsPage /> },
          { path: '/courier-receipts/new', element: <NewReceiptPage /> },
          { path: '/courier-receipts/:id', element: <ReceiptDetailPage /> },
          { path: '/parts', element: <PartsPage /> },
          { path: '/parts/new', element: <PartFormPage /> },
          { path: '/parts/:id', element: <PartFormPage /> },
          { path: '/catalog', element: <CatalogPage /> },
          { path: '/users', element: <UsersPage /> },
          { path: '/users/audit-log', element: <AuditLogPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
