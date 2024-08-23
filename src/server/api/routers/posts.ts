import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import db from "~/server/db";
import {type Post} from "~/types/types"

const addUserDataToPosts = async (posts: Post[]) => {
  const userId = posts.map((post) => post.author_id);
  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
      limit: 110,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.author_id);

    if (!author) {
      console.error("AUTHOR NOT FOUND", post);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.author_id}`,
      });
    }
    return {
      post,
      author: {
        ...author,
        username: author.username ?? "(username not found)",
      },
    };
  });
};

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const query = 'SELECT * FROM posts WHERE id = $1';
      const result = await db.query<Post>(query, [input.id]);
      const post = result.rows[0];

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToPosts([post]))[0];
    }),

  getAll: publicProcedure.query(async () => {
    const query = 'SELECT * FROM posts ORDER BY created_at DESC LIMIT 200';
    const result = await db.query<Post>(query);
    const posts = result.rows;

    return addUserDataToPosts(posts);
  }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const query = 'SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC LIMIT 200';
      const result = await db.query<Post>(query, [input.userId]);
      const posts = result.rows;

      return addUserDataToPosts(posts);
    }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const query = 'INSERT INTO posts (author_id, content) VALUES ($1, $2) RETURNING *';
      const result = await db.query<Post>(query, [authorId, input.content]);
      const post = result.rows[0];

      return post;
    }),
});