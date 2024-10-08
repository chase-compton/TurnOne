import { appRouter } from "~/server/api/root";
import db from "~/server/db";  // Import the PostgreSQL connection
import superjson from "superjson";
import { createServerSideHelpers } from '@trpc/react-query/server';

export const generateSSGHelper = () =>
  createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson, 
  });