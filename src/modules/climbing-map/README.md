# Climbing Map Module

This module implements the core domain for a China climbing gym map:

- gym discovery and location indexing
- route reset schedule tracking
- route quality reviews
- activity aggregation
- partner matching posts

## Server API

Router: `climbingMap`

- `listGyms` (public query)
- `listPartnerPosts` (public query)
- `createRouteReview` (protected mutation)
- `createPartnerPost` (protected mutation)
- `submitGymUpdate` (protected mutation)

## Data models

Prisma entities:

- `ClimbingGym`
- `ClimbingGymResetPlan`
- `ClimbingGymActivity`
- `ClimbingRouteReview`
- `ClimbingPartnerPost`
- `ClimbingGymUserSubmission`
- `ClimbingGymPromotion`
- `ClimbingBrandCampaign`
- `ClimbingActivityTicketOrder`

## Notes

- List endpoints use cursor-based pagination (default size: 20).
- User-generated updates are stored as submissions for moderation.
- Promotion/campaign/ticket models are included as MVP-ready monetization scaffolding.
