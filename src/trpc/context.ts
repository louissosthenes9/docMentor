import { inferAsyncReturnType } from '@trpc/server';

export const createcontext = () => {
  return {};
};

export type Context = inferAsyncReturnType<typeof createcontext>;
