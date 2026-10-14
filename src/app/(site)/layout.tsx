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
  // Google Search Console: set GOOGLE_SITE_VERIFICATION to the HTML-tag token.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

/* Before first paint: drop the no-js class (drawings only start hidden when
   JavaScript is there to reveal them) and set the motion mode. */
const jsFlag = `document.documentElement.classList.remove("no-js");${motionScript}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`no-js ${anek.variable} ${kalam.variable}`}
      data-motion="full"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
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
      {process.env.NEXT_PUBLIC_GA_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /> : null}
    </html>
  );
}
