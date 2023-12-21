import { aiRouter } from "@/server/api/routers/ai";
import { createTRPCRouter } from "@/server/api/trpc";
import { taskRouter } from "./routers/task";
import { eventRouter } from "./routers/event";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ai: aiRouter,
  task: taskRouter,
  event: eventRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
