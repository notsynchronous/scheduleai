import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { listEvents } from "@/server/gcal";

export const taskRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        task: z.object({
          name: z.string(),
          freq: z.number(),
          duration: z.number(), //in minutes % 5;
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.create({
        data: {
          ...input.task,
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.task.findMany();
  }),
});
