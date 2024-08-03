import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { createEvent, listEvents } from "@/server/gcal";

export const eventRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        events: z.array(
          z.object({
            name: z.string(),
            startTime: z.string(),
            endTime: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: PERSIST HERE
      for(const item of input.events) {
        const t = await createEvent(item);
        if(!t?.summary || !t?.id || !t?.start?.date || !t?.end?.date ) continue;
        await ctx.db.event.create({
          data: {
            name: t?.summary ,
            startTime: t.start?.date,
            endTime: t.end?.date,
            eventId: t?.id,
            isGenerated: true,
          }
        })
      }
      return await ctx.db.event.findMany({});
    }),

  fetchEvents: publicProcedure.query(async ({ ctx }) => {
    const events = await listEvents();
    if (!events) {
      return ctx.db.event.findMany({});
    }
    for (const item of events) {
      if (
        !item.summary ||
        !item.start?.dateTime ||
        !item.end?.dateTime ||
        !item.id
      )
        continue;
      await ctx.db.event.upsert({
        create: {
          eventId: item.id,
          name: item.summary,
          startTime: item.start.dateTime,
          endTime: item.end.dateTime,
        },
        update: {
          name: item.summary,
          startTime: item.start.dateTime,
          endTime: item.end.dateTime,
        },
        where: {
          eventId: item.id,
        },
      });
    }
    return ctx.db.event.findMany({});
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.event.findMany();
  }),
});
