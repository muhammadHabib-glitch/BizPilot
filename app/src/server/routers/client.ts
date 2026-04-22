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

export const clientRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        includeArchived: z.boolean().default(false),
        tag: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      return ctx.prisma.client.findMany({
        where: {
          businessId,
          isArchived: input?.includeArchived ? undefined : false,
          ...(input?.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: "insensitive" } },
                  { email: { contains: input.search, mode: "insensitive" } },
                  { company: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(input?.tag ? { tags: { has: input.tag } } : {}),
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const client = await ctx.prisma.client.findFirst({
        where: { id: input.id, businessId },
        include: {
          invoices: { orderBy: { createdAt: "desc" }, take: 10 },
          appointments: { orderBy: { startTime: "desc" }, take: 10 },
        },
      });
      if (!client) throw new TRPCError({ code: "NOT_FOUND" });
      return client;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        company: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      return ctx.prisma.client.create({
        data: {
          businessId,
          ...input,
          email: input.email || null,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200).optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        company: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const { id, ...data } = input;
      const client = await ctx.prisma.client.findFirst({
        where: { id, businessId },
      });
      if (!client) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.prisma.client.update({
        where: { id },
        data: { ...data, email: data.email || null },
      });
    }),

  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const client = await ctx.prisma.client.findFirst({
        where: { id: input.id, businessId },
      });
      if (!client) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.prisma.client.update({
        where: { id: input.id },
        data: { isArchived: !client.isArchived },
      });
    }),
});
