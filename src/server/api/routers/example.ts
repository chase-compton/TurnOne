import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import db from "~/server/db";  
import { type Post } from "~/types/types";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(async () => {
    try {
      const result = await db.query<Post>('SELECT * FROM posts');
      return result.rows;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }),
});