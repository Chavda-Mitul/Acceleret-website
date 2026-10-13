import type { Metadata } from "next";
import type { ReactNode } from "react";
import { seo } from "@/content/seo";
import { Hero } from "@/components/home/Hero";
import { ProblemScene } from "@/components/home/ProblemScene";
import { TaglineBand } from "@/components/home/TaglineBand";
import { StreetScene } from "@/components/art/StreetScene";
import { ServicesJourney } from "@/components/home/ServicesJourney";
import { ServiceDiagram } from "@/components/diagrams/ServiceDiagram";
import { services, type ServiceId } from "@/content/services";
import { ProcessHome } from "@/components/home/ProcessHome";
import { ProcessDrawing } from "@/components/diagrams/ProcessDrawing";
import { stages, type StageId } from "@/content/process";
import { Work } from "@/components/home/Work";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: seo.home.title,
  description: seo.home.description,
  alternates: { canonical: "/" },
  openGraph: { title: seo.home.title, description: seo.home.description, url: "/" },
};

// Server-rendered once; the client sections only move between / reveal them.
const serviceDiagrams = Object.fromEntries(services.map((s) => [s.id, <ServiceDiagram key={s.id} id={s.id} />])) as Record<
  ServiceId,
  ReactNode
>;
const processStack = Object.fromEntries(
  stages.map((s) => [s.id, <ProcessDrawing key={s.id} stage={s.id} layout="compact" />]),
) as Record<StageId, ReactNode>;

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Hero />
      <ProblemScene />
      <TaglineBand />
      <StreetScene />
      <ServicesJourney diagrams={serviceDiagrams} />
      <ProcessHome drawing={<ProcessDrawing layout="wide" engineer />} stack={processStack} />
      <Work />
      <CtaBand />
    </>
  );
}
