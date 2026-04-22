import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export const businessRouter = router({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const membership = await ctx.prisma.businessMember.findFirst({
      where: {
        user: { supabaseId: ctx.user.id },
      },
      include: {
        business: {
          include: { subscription: true },
        },
      },
    });
    return membership?.business ?? null;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        industry: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        timezone: z.string().default("America/New_York"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { supabaseId: ctx.user.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found. Please sign up first.",
        });
      }

      // Check if user already has a business
      const existing = await ctx.prisma.businessMember.findFirst({
        where: { userId: user.id },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a business.",
        });
      }

      // Generate a unique slug
      let slug = generateSlug(input.name);
      const slugExists = await ctx.prisma.business.findUnique({
        where: { slug },
      });
      if (slugExists) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const business = await ctx.prisma.business.create({
        data: {
          ...input,
          slug,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
          subscription: {
            create: {
              plan: "FREE",
              status: "TRIALING",
              trialEndsAt: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
              ),
            },
          },
        },
        include: {
          subscription: true,
        },
      });

      return business;
    }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().url().optional().or(z.literal("")),
        industry: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        timezone: z.string().optional(),
        taxRate: z.number().min(0).max(100).optional(),
        invoicePrefix: z.string().max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.prisma.businessMember.findFirst({
        where: {
          user: { supabaseId: ctx.user.id },
          role: { in: ["OWNER", "ADMIN"] },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this business.",
        });
      }

      return ctx.prisma.business.update({
        where: { id: membership.businessId },
        data: input,
      });
    }),
});
