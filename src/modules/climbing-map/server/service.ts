import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logger";
import type {
  CreatePartnerPostInput,
  CreateRouteReviewInput,
  ListGymsInput,
  ListPartnerPostsInput,
  SubmitGymUpdateInput,
} from "./schema";

const logger = createLogger("climbing-map-service");

export async function listGyms(input: ListGymsInput) {
  const limit = input.limit ?? 20;

  const items = await db.climbingGym.findMany({
    where: {
      city: input.city ? { contains: input.city, mode: "insensitive" } : undefined,
      OR: input.query
        ? [
            { name: { contains: input.query, mode: "insensitive" } },
            { address: { contains: input.query, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      resetPlans: {
        orderBy: { resetDate: "asc" },
        take: 2,
      },
      activities: {
        where: { status: "PUBLISHED" },
        orderBy: { startAt: "asc" },
        take: 2,
      },
      _count: {
        select: {
          routeReviews: true,
          partnerPosts: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
    take: limit + 1,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    skip: input.cursor ? 1 : 0,
  });

  const hasMore = items.length > limit;
  const result = hasMore ? items.slice(0, limit) : items;

  return {
    items: result,
    nextCursor: hasMore ? result[result.length - 1]?.id ?? null : null,
  };
}

export async function listPartnerPosts(input: ListPartnerPostsInput) {
  const limit = input.limit ?? 20;

  const items = await db.climbingPartnerPost.findMany({
    where: {
      status: "OPEN",
      expiresAt: {
        gte: new Date(),
      },
      city: input.city ? { contains: input.city, mode: "insensitive" } : undefined,
      gymId: input.gymId,
    },
    include: {
      gym: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
    take: limit + 1,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    skip: input.cursor ? 1 : 0,
  });

  const hasMore = items.length > limit;
  const result = hasMore ? items.slice(0, limit) : items;

  return {
    items: result,
    nextCursor: hasMore ? result[result.length - 1]?.id ?? null : null,
  };
}

export async function createRouteReview(userId: string, input: CreateRouteReviewInput) {
  const gym = await db.climbingGym.findUnique({ where: { id: input.gymId }, select: { id: true } });

  if (!gym) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Gym not found" });
  }

  const review = await db.climbingRouteReview.create({
    data: {
      gymId: input.gymId,
      userId,
      routeGrade: input.routeGrade,
      styleTag: input.styleTag,
      qualityScore: input.qualityScore,
      comment: input.comment,
    },
  });

  logger.info({ userId, gymId: input.gymId, reviewId: review.id }, "Created climbing route review");

  return review;
}

export async function createPartnerPost(userId: string, input: CreatePartnerPostInput) {
  if (input.gymId) {
    const gym = await db.climbingGym.findUnique({ where: { id: input.gymId }, select: { id: true } });
    if (!gym) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Gym not found" });
    }
  }

  const post = await db.climbingPartnerPost.create({
    data: {
      userId,
      gymId: input.gymId,
      city: input.city,
      preferredGrade: input.preferredGrade,
      climbingStyle: input.climbingStyle,
      availableNote: input.availableNote,
      contactHandle: input.contactHandle,
      message: input.message,
      expiresAt: input.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      status: "OPEN",
    },
  });

  logger.info({ userId, postId: post.id }, "Created climbing partner post");

  return post;
}

export async function submitGymUpdate(userId: string, input: SubmitGymUpdateInput) {
  const gym = await db.climbingGym.findUnique({ where: { id: input.gymId }, select: { id: true } });

  if (!gym) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Gym not found" });
  }

  const submission = await db.climbingGymUserSubmission.create({
    data: {
      gymId: input.gymId,
      userId,
      type: input.type,
      content: input.content as Prisma.InputJsonValue,
      status: "PENDING",
    },
  });

  logger.info({ userId, gymId: input.gymId, submissionId: submission.id, type: input.type }, "Created gym update submission");

  return submission;
}
