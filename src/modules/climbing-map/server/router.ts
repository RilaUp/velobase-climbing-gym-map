import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  createPartnerPostInputSchema,
  createRouteReviewInputSchema,
  listGymsInputSchema,
  listPartnerPostsInputSchema,
  submitGymUpdateInputSchema,
} from "./schema";
import {
  createPartnerPost,
  createRouteReview,
  listGyms,
  listPartnerPosts,
  submitGymUpdate,
} from "./service";

export const climbingMapRouter = createTRPCRouter({
  listGyms: publicProcedure
    .input(listGymsInputSchema.optional())
    .query(async ({ input }) => {
      return listGyms(input ?? { limit: 20 });
    }),

  listPartnerPosts: publicProcedure
    .input(listPartnerPostsInputSchema.optional())
    .query(async ({ input }) => {
      return listPartnerPosts(input ?? { limit: 20 });
    }),

  createRouteReview: protectedProcedure
    .input(createRouteReviewInputSchema)
    .mutation(async ({ ctx, input }) => {
      return createRouteReview(ctx.session.user.id, input);
    }),

  createPartnerPost: protectedProcedure
    .input(createPartnerPostInputSchema)
    .mutation(async ({ ctx, input }) => {
      return createPartnerPost(ctx.session.user.id, input);
    }),

  submitGymUpdate: protectedProcedure
    .input(submitGymUpdateInputSchema)
    .mutation(async ({ ctx, input }) => {
      return submitGymUpdate(ctx.session.user.id, input);
    }),
});
