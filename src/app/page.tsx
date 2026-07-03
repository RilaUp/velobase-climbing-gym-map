"use client";

import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Background } from "@/components/layout/background";
import { SiteFooter } from "@/components/layout/site-footer";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const t = useTranslations("landing");
  const capabilities = t.raw("capabilities") as string[];
  const monetization = t.raw("monetization") as string[];

  return (
    <div
      className={cn(
        "w-full bg-background text-foreground font-sans selection:bg-primary/30 relative",
        "min-h-screen overflow-y-auto overflow-x-hidden"
      )}
    >
      <Background />
      <Header />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-12 pt-28 md:px-6">
        <section className="rounded-3xl border bg-gradient-to-br from-orange-200/70 via-amber-100/40 to-teal-100/60 p-8 shadow-lg backdrop-blur-sm md:p-12">
          <div className="max-w-3xl space-y-5">
            <p className="font-poppins text-sm font-semibold uppercase tracking-[0.2em] text-orange-800/80">{t("hero.badge")}</p>
            <h1 className="font-poppins text-4xl font-semibold leading-tight text-zinc-900 md:text-6xl">{t("hero.title")}</h1>
            <p className="max-w-2xl text-base text-zinc-700 md:text-lg">{t("hero.subtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-zinc-900 text-white hover:bg-zinc-800">
                <Link href="/climbing">{t("hero.primaryCta")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs">{t("hero.secondaryCta")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.capabilitiesTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {capabilities.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("sections.monetizationTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {monetization.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border bg-background/90 p-6">
          <h2 className="text-xl font-semibold">{t("sections.pathTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("sections.pathSubtitle")}</p>
          <p className="mt-4 text-sm font-medium text-foreground">{t("sections.pathFlow")}</p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
