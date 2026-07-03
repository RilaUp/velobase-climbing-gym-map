import { z } from "zod";

export const listGymsInputSchema = z.object({
  city: z.string().min(1).max(60).optional(),
  query: z.string().min(1).max(100).optional(),
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const listPartnerPostsInputSchema = z.object({
  city: z.string().min(1).max(60).optional(),
  gymId: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const createRouteReviewInputSchema = z.object({
  gymId: z.string().cuid(),
  routeGrade: z.string().min(1).max(40),
  styleTag: z.string().min(1).max(60),
  qualityScore: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const createPartnerPostInputSchema = z.object({
  gymId: z.string().cuid().optional(),
  city: z.string().min(1).max(60),
  preferredGrade: z.string().min(1).max(40).optional(),
  climbingStyle: z.string().min(1).max(60).optional(),
  availableNote: z.string().min(1).max(200),
  contactHandle: z.string().min(1).max(80),
  message: z.string().max(500).optional(),
  expiresAt: z.date().optional(),
});

export const submitGymUpdateInputSchema = z.object({
  gymId: z.string().cuid(),
  type: z.enum(["GYM_PROFILE", "RESET_SCHEDULE", "ACTIVITY", "ROUTE_CONDITION"]),
  content: z.record(z.unknown()),
});

export type ListGymsInput = z.infer<typeof listGymsInputSchema>;
export type ListPartnerPostsInput = z.infer<typeof listPartnerPostsInputSchema>;
export type CreateRouteReviewInput = z.infer<typeof createRouteReviewInputSchema>;
export type CreatePartnerPostInput = z.infer<typeof createPartnerPostInputSchema>;
export type SubmitGymUpdateInput = z.infer<typeof submitGymUpdateInputSchema>;
