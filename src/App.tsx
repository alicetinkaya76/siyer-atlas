import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Spinner } from '@/components/common/Spinner';
import { AppShell } from '@/components/layout/AppShell';
import { routes } from '@/config/routes';

/* ─── Query Client ─── */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/* ─── Router ─── */
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: routes,
  },
]);

/* ─── App Root ─── */
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<FullScreenLoader />}>
          <RouterProvider router={router} />
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function FullScreenLoader() {
  return (
    <div
      className="flex h-dvh items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #d4af37, #e6bf55)',
            color: '#1a1a2e',
          }}
        >
          ☪
        </div>
        <Spinner size="md" />
      </div>
    </div>
  );
}
