import { initTRPC, TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function createTRPCContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { prisma, supabase, user };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = t.procedure.use(enforceAuth);
