import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Anek_Latin, Kalam } from "next/font/google";
import { site } from "@/content/site";
import { baseOpenGraph, seo } from "@/content/seo";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { WhatsAppButton } from "@/components/chrome/WhatsAppButton";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { MotionPrompt } from "@/components/motion/MotionToggle";
import { PencilLayer } from "@/components/motion/PencilLayer";
import { motionScript } from "@/lib/motion-script";
import { HeadScript } from "@/components/HeadScript";
import "./globals.css";

/* Two typefaces (brief §5), both from Indian foundries:
   Anek Latin (Ek Type) for everything engineered (variable weight);
   Kalam (Indian Type Foundry) for the engineer's handwritten field notes.
   Both are preloaded: the hero headline is written in Kalam before it is set in Anek. */
const anek = Anek_Latin({
  subsets: ["latin"],
  variable: "--font-anek",
  display: "swap",
});

const kalam = Kalam({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kalam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: seo.home.title, template: "%s" },
  description: seo.home.description,
  applicationName: site.name,
  openGraph: baseOpenGraph,
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  // Google Search Console HTML-tag token. It is public (served in every page's <head>),
  // so it lives here rather than in the server's .env.
  verification: { google: "FKlhWlwQVmTzXiJIHHl9VDVAOhUvYUmLf8gH1lZadRw" },
};

/* Google Analytics 4 measurement ID. Like the token above it is public (every page sends it),
   so it lives here rather than in the server's .env. <GoogleAnalytics> renders Google's
   gtag.js snippet. `next dev` and CI (which sets CI=true) leave it out, so test runs
   aren't counted as visits. */
const gaId = process.env.NODE_ENV === "production" && !process.env.CI ? "G-2DC6HJSYCP" : null;

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`no-js ${anek.variable} ${kalam.variable}`}
      data-motion="full"
      // base.css scrolls smoothly in full motion; this tells Next to jump instantly
      // on a page change, so a link lands on its section (or the top), not mid-glide.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Before first paint: no-js, motion mode, wide screens (lib/motion-script.ts). */}
        <HeadScript html={motionScript} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <MotionPrompt />
        <MotionProvider />
        <PencilLayer />
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
