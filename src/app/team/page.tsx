import type { Metadata } from "next";
import { baseOpenGraph, seo } from "@/content/seo";
import { site } from "@/content/site";
import { mergerLine } from "@/content/team";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { Team } from "@/components/team/Team";

export const metadata: Metadata = {
  title: seo.team.title,
  description: seo.team.description,
  alternates: { canonical: "/team" },
  openGraph: { ...baseOpenGraph, title: seo.team.title, description: seo.team.description, url: "/team" },
};

export default function TeamPage() {
  const lead = mergerLine ? (
    mergerLine
  ) : site.showPending ? (
    <span className="pending-tag">Pending: the merger line from File 02</span>
  ) : undefined;
  return (
    <>
      <PageHero title="Who we are" lead={lead} note="built in Surat" />
      <Team />
      <CtaBand />
    </>
  );
}
