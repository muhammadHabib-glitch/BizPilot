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

export const schedulingRouter = router({
  /* ── Booking Pages ── */

  listPages: protectedProcedure.query(async ({ ctx }) => {
    const businessId = await getBusinessId(ctx);
    return ctx.prisma.bookingPage.findMany({
      where: { businessId },
      include: { _count: { select: { appointments: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  getPage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const page = await ctx.prisma.bookingPage.findFirst({
        where: { id: input.id, businessId },
        include: { _count: { select: { appointments: true } } },
      });
      if (!page) throw new TRPCError({ code: "NOT_FOUND" });
      return page;
    }),

  createPage: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        duration: z.number().int().min(5).max(480).optional(),
        bufferBefore: z.number().int().min(0).max(120).optional(),
        bufferAfter: z.number().int().min(0).max(120).optional(),
        minNotice: z.number().int().min(0).optional(),
        maxAdvance: z.number().int().min(1).max(365).optional(),
        locationType: z.enum(["video", "phone", "in-person"]).optional(),
        locationDetails: z.string().optional(),
        color: z.string().optional(),
        requirePhone: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);

      const existing = await ctx.prisma.bookingPage.findFirst({
        where: { businessId, slug: input.slug },
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Slug already in use" });
      }

      return ctx.prisma.bookingPage.create({
        data: {
          businessId,
          title: input.title,
          slug: input.slug,
          description: input.description,
          duration: input.duration ?? 30,
          bufferBefore: input.bufferBefore ?? 0,
          bufferAfter: input.bufferAfter ?? 15,
          minNotice: input.minNotice ?? 60,
          maxAdvance: input.maxAdvance ?? 30,
          locationType: input.locationType ?? "video",
          locationDetails: input.locationDetails,
          color: input.color ?? "#2563eb",
          requirePhone: input.requirePhone ?? false,
        },
      });
    }),

  updatePage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        duration: z.number().int().min(5).max(480).optional(),
        bufferBefore: z.number().int().min(0).max(120).optional(),
        bufferAfter: z.number().int().min(0).max(120).optional(),
        minNotice: z.number().int().min(0).optional(),
        maxAdvance: z.number().int().min(1).max(365).optional(),
        locationType: z.enum(["video", "phone", "in-person"]).optional(),
        locationDetails: z.string().optional(),
        color: z.string().optional(),
        requirePhone: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const existing = await ctx.prisma.bookingPage.findFirst({
        where: { id: input.id, businessId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const { id, ...data } = input;
      return ctx.prisma.bookingPage.update({
        where: { id },
        data,
      });
    }),

  deletePage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const existing = await ctx.prisma.bookingPage.findFirst({
        where: { id: input.id, businessId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.prisma.bookingPage.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /* ── Appointments ── */

  listAppointments: protectedProcedure
    .input(
      z.object({
        status: z.enum(["CONFIRMED", "PENDING", "CANCELED", "COMPLETED", "NO_SHOW"]).optional(),
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      return ctx.prisma.appointment.findMany({
        where: {
          businessId,
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.from || input?.to
            ? {
                startTime: {
                  ...(input?.from ? { gte: input.from } : {}),
                  ...(input?.to ? { lte: input.to } : {}),
                },
              }
            : {}),
        },
        include: { bookingPage: { select: { title: true, color: true } }, client: { select: { name: true, email: true } } },
        orderBy: { startTime: "asc" },
      });
    }),

  getAppointment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const appt = await ctx.prisma.appointment.findFirst({
        where: { id: input.id, businessId },
        include: { bookingPage: true, client: true },
      });
      if (!appt) throw new TRPCError({ code: "NOT_FOUND" });
      return appt;
    }),

  createAppointment: protectedProcedure
    .input(
      z.object({
        bookingPageId: z.string().optional(),
        clientId: z.string().optional(),
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
        title: z.string().optional(),
        notes: z.string().optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().email().optional(),
        clientPhone: z.string().optional(),
        status: z.enum(["CONFIRMED", "PENDING"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      return ctx.prisma.appointment.create({
        data: {
          businessId,
          bookingPageId: input.bookingPageId || null,
          clientId: input.clientId || null,
          startTime: input.startTime,
          endTime: input.endTime,
          title: input.title,
          notes: input.notes,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          status: input.status ?? "CONFIRMED",
        },
        include: { client: true, bookingPage: true },
      });
    }),

  updateAppointmentStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["CONFIRMED", "PENDING", "CANCELED", "COMPLETED", "NO_SHOW"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const appt = await ctx.prisma.appointment.findFirst({
        where: { id: input.id, businessId },
      });
      if (!appt) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.appointment.update({
        where: { id: input.id },
        data: { status: input.status },
        include: { client: true, bookingPage: true },
      });
    }),

  deleteAppointment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const appt = await ctx.prisma.appointment.findFirst({
        where: { id: input.id, businessId },
      });
      if (!appt) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.prisma.appointment.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
