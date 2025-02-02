
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/trpc';

export const createServerSideTRPCClient = () =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'https://docmentor.onrender.com/api/trpc',
      }),
    ],
  });
