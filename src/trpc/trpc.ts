import {initTRPC, TRPCError} from "@trpc/server"
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import {KindeUser} from "@kinde-oss/kinde-auth-nextjs/types";

const t = initTRPC.create();
const middleware = t.middleware
const isAuth = middleware(async(opts)=>{
    const {getUser} = getKindeServerSession()
    const user =  await getUser() as KindeUser

    if(!user){
        throw new TRPCError({code: 'UNAUTHORIZED'})
    }

    return opts.next({
        ctx:{
            userId:user.id,
            user,
            name:'john'
        }
    })
})
export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);