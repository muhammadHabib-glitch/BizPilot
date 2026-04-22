import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { businessRouter } from "./routers/business";
import { clientRouter } from "./routers/client";
import { invoiceRouter } from "./routers/invoice";
import { dashboardRouter } from "./routers/dashboard";
import { templateRouter } from "./routers/template";
import { schedulingRouter } from "./routers/scheduling";

export const appRouter = router({
  user: userRouter,
  business: businessRouter,
  clients: clientRouter,
  invoice: invoiceRouter,
  dashboard: dashboardRouter,
  template: templateRouter,
  scheduling: schedulingRouter,
});

export type AppRouter = typeof appRouter;
