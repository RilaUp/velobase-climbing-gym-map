"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ClimbingMapPage() {
  const t = useTranslations("climbingMap");
  const { data: session } = useSession();

  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);

  const [routeGrade, setRouteGrade] = useState("");
  const [styleTag, setStyleTag] = useState("");
  const [qualityScore, setQualityScore] = useState(3);
  const [reviewComment, setReviewComment] = useState("");

  const [partnerCity, setPartnerCity] = useState("");
  const [partnerAvailability, setPartnerAvailability] = useState("");
  const [partnerContact, setPartnerContact] = useState("");
  const [partnerMessage, setPartnerMessage] = useState("");

  const gymsQuery = api.climbingMap.listGyms.useQuery({ city: city || undefined, query: query || undefined, limit: 20 });
  const postsQuery = api.climbingMap.listPartnerPosts.useQuery({ city: partnerCity || city || undefined, limit: 20 });

  const reviewMutation = api.climbingMap.createRouteReview.useMutation({
    onSuccess: () => {
      setRouteGrade("");
      setStyleTag("");
      setQualityScore(3);
      setReviewComment("");
      void gymsQuery.refetch();
    },
  });

  const partnerMutation = api.climbingMap.createPartnerPost.useMutation({
    onSuccess: () => {
      setPartnerAvailability("");
      setPartnerContact("");
      setPartnerMessage("");
      void postsQuery.refetch();
    },
  });

  const gyms = gymsQuery.data?.items ?? [];
  const partnerPosts = postsQuery.data?.items ?? [];

  const selectedGym = gyms.find((gym) => gym.id === selectedGymId) ?? null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("filters.city")} />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("filters.query")} />
        <Button onClick={() => void gymsQuery.refetch()}>{t("filters.search")}</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("gyms.title")}</CardTitle>
            <CardDescription>{t("gyms.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gymsQuery.isLoading ? <p className="text-sm text-muted-foreground">{t("state.loading")}</p> : null}
            {!gymsQuery.isLoading && gyms.length === 0 ? <p className="text-sm text-muted-foreground">{t("state.emptyGyms")}</p> : null}
            {gyms.map((gym) => (
              <button
                key={gym.id}
                type="button"
                className="w-full rounded-lg border p-3 text-left transition hover:border-primary/60"
                onClick={() => setSelectedGymId(gym.id)}
              >
                <p className="font-medium">{gym.name}</p>
                <p className="text-sm text-muted-foreground">{gym.city} {gym.district ?? ""}</p>
                <p className="text-xs text-muted-foreground">{gym.address}</p>
                <p className="mt-2 text-xs">{t("gyms.reviews", { count: gym._count.routeReviews })} · {t("gyms.partners", { count: gym._count.partnerPosts })}</p>
                {gym.resetPlans[0] ? <p className="mt-1 text-xs text-primary">{t("gyms.nextReset", { date: new Date(gym.resetPlans[0].resetDate).toLocaleDateString() })}</p> : null}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("partner.title")}</CardTitle>
            <CardDescription>{t("partner.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={partnerCity} onChange={(e) => setPartnerCity(e.target.value)} placeholder={t("partner.city")} />
            {partnerPosts.length === 0 ? <p className="text-sm text-muted-foreground">{t("state.emptyPartners")}</p> : null}
            {partnerPosts.map((post) => (
              <div key={post.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{post.user?.name ?? t("partner.anonymous")}</p>
                <p className="text-muted-foreground">{post.city} · {post.gym?.name ?? t("partner.noGym")}</p>
                <p className="mt-1">{post.availableNote}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("partner.contact")} {post.contactHandle}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("review.title")}</CardTitle>
            <CardDescription>{t("review.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">{selectedGym ? t("review.selectedGym", { name: selectedGym.name }) : t("review.selectGym")}</p>
            <Input value={routeGrade} onChange={(e) => setRouteGrade(e.target.value)} placeholder={t("review.routeGrade")} />
            <Input value={styleTag} onChange={(e) => setStyleTag(e.target.value)} placeholder={t("review.styleTag")} />
            <Input
              type="number"
              min={1}
              max={5}
              value={qualityScore}
              onChange={(e) => setQualityScore(Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
              placeholder={t("review.qualityScore")}
            />
            <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder={t("review.comment")} />
            <Button
              disabled={!session || !selectedGym || !routeGrade || !styleTag || reviewMutation.isPending}
              onClick={() => {
                if (!selectedGym) return;
                reviewMutation.mutate({ gymId: selectedGym.id, routeGrade, styleTag, qualityScore, comment: reviewComment || undefined });
              }}
            >
              {reviewMutation.isPending ? t("review.submitting") : t("review.submit")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("partner.postTitle")}</CardTitle>
            <CardDescription>{t("partner.postSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={partnerCity} onChange={(e) => setPartnerCity(e.target.value)} placeholder={t("partner.city")} />
            <Input value={partnerAvailability} onChange={(e) => setPartnerAvailability(e.target.value)} placeholder={t("partner.availability")} />
            <Input value={partnerContact} onChange={(e) => setPartnerContact(e.target.value)} placeholder={t("partner.contactHandle")} />
            <Textarea value={partnerMessage} onChange={(e) => setPartnerMessage(e.target.value)} placeholder={t("partner.message")} />
            <Button
              disabled={!session || !partnerCity || !partnerAvailability || !partnerContact || partnerMutation.isPending}
              onClick={() => {
                partnerMutation.mutate({
                  city: partnerCity,
                  gymId: selectedGymId ?? undefined,
                  availableNote: partnerAvailability,
                  contactHandle: partnerContact,
                  message: partnerMessage || undefined,
                });
              }}
            >
              {partnerMutation.isPending ? t("partner.submitting") : t("partner.submit")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
