import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { generateCompletion } from "@/server/openai";

export const aiRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = await generateCompletion(input.prompt);

      return ctx.db.prompt.create({
        data: {
          content: result.choices[0]?.message.content,
        },
      });
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),
});
