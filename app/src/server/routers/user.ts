import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const dbUser = await ctx.prisma.user.findUnique({
      where: { supabaseId: ctx.user.id },
      include: {
        memberships: {
          include: { business: true },
        },
      },
    });
    return dbUser;
  }),

  upsertFromAuth: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.upsert({
      where: { supabaseId: ctx.user.id },
      update: {
        email: ctx.user.email!,
        name: ctx.user.user_metadata?.name || null,
        lastLoginAt: new Date(),
      },
      create: {
        supabaseId: ctx.user.id,
        email: ctx.user.email!,
        name: ctx.user.user_metadata?.name || null,
        provider: "EMAIL",
        lastLoginAt: new Date(),
      },
    });
    return user;
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        avatar: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { supabaseId: ctx.user.id },
        data: input,
      });
    }),
});
