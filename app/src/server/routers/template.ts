import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";

type PrismaType = typeof prisma;

async function getBusinessId(ctx: { prisma: PrismaType; user: { id: string } }) {
  const membership = await ctx.prisma.businessMember.findFirst({
    where: { user: { supabaseId: ctx.user.id } },
    select: { businessId: true },
  });
  if (!membership) throw new TRPCError({ code: "NOT_FOUND", message: "No business found" });
  return membership.businessId;
}

const templateItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
});

export const templateRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const businessId = await getBusinessId(ctx);
    return ctx.prisma.invoiceTemplate.findMany({
      where: { businessId },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const template = await ctx.prisma.invoiceTemplate.findFirst({
        where: { id: input.id, businessId },
      });
      if (!template) throw new TRPCError({ code: "NOT_FOUND" });
      return template;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        notes: z.string().optional(),
        terms: z.string().optional(),
        taxRate: z.number().min(0).max(100).optional(),
        items: z.array(templateItemSchema).min(1),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);

      // If setting as default, unset other defaults
      if (input.isDefault) {
        await ctx.prisma.invoiceTemplate.updateMany({
          where: { businessId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return ctx.prisma.invoiceTemplate.create({
        data: {
          businessId,
          name: input.name,
          notes: input.notes,
          terms: input.terms,
          taxRate: input.taxRate ?? 0,
          items: input.items,
          isDefault: input.isDefault ?? false,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200).optional(),
        notes: z.string().optional(),
        terms: z.string().optional(),
        taxRate: z.number().min(0).max(100).optional(),
        items: z.array(templateItemSchema).min(1).optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const existing = await ctx.prisma.invoiceTemplate.findFirst({
        where: { id: input.id, businessId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const { id, ...data } = input;

      if (data.isDefault) {
        await ctx.prisma.invoiceTemplate.updateMany({
          where: { businessId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return ctx.prisma.invoiceTemplate.update({
        where: { id },
        data: {
          ...data,
          items: data.items ?? undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const existing = await ctx.prisma.invoiceTemplate.findFirst({
        where: { id: input.id, businessId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.prisma.invoiceTemplate.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
