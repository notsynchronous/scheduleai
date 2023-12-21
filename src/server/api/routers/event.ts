import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { listEvents } from "@/server/gcal";

export const eventRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        event: z.object({
          name: z.string(),
          startTime: z.string(),
          endTime: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: PERSIST HERE
      // return ctx.db.event.create({
      //   data: {
      //     ...input.event,
      //   },
      // });
    }),

  fetchEvents: publicProcedure.query(async ({ ctx }) => {
    const events = await listEvents();
    if (!events) {
      return ctx.db.event.findMany({});
    }
    for (const item of events) {
      if (!item.summary || !item.start?.dateTime || !item.end?.dateTime || !item.id)
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
          eventId: item.id
        }
      });
    }
    return ctx.db.event.findMany({});
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.event.findMany();
  }),
});
