import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod'
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/types';

export const appRouter = router({
  authCallback: publicProcedure.query(
    async () => {
      const { getUser } = getKindeServerSession()
      const user = await getUser() as KindeUser

      if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" })

      // Check if the user is in the database
      const dbUser = await db.user.findFirst({
        where: {
          id: user.id
        }
      })
      
      if (!dbUser) {
        await db.user.create({
          data: {
            id: user.id,
            email: user.email
          }
        })
      }
      return { success: true }
    }
  ),

getFile:privateProcedure
.input(z.object({
  key:z.string()
}))
.mutation(async ({ctx,input})=>{
  const {userId} = ctx

  const file = await db.file.findFirst({
    where:{
      key:input.key,
      userId
    }
  })

  if(!file) throw new TRPCError({code:"NOT_FOUND"})

  return file

}),
// get user files endpoint
    getUserFiles:privateProcedure.query(async ({ctx})=>{
     const {userId} = ctx

    const files = await db.file.findMany({
      where: {
        userId: userId,
      }
    });

    return files;
  }),

  deleteFile: privateProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
    
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId
        }
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      await db.file.delete({
        where: {
          id: input.id,
        },
      });
    
      return file;
    }),
})

export type AppRouter = typeof appRouter;