import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy. Inline scripts are allowed because Next.js streams
 * inline bootstrapping scripts; everything else is locked to this origin plus
 * Google Analytics (only loaded when NEXT_PUBLIC_GA_ID is set).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Blog images are served by Payload from /api/media/file (src/collections/Media.ts).
  images: {
    localPatterns: [{ pathname: "/api/media/file/**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The CMS (src/app/(payload)) stays out of search results; blog images under /api/media/file do not.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path((?!media/file/).*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  /*
   * Domain rules from the brief (§2): acceleret.com is canonical,
   * acceleret.in/* and www.acceleret.com/* redirect to it with a 301.
   * These only apply when the requests reach this app; doing it at the
   * DNS/host level as well is recommended.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(www\\.)?acceleret\\.in" }],
        destination: "https://acceleret.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.acceleret.com" }],
        destination: "https://acceleret.com/:path*",
        permanent: true,
      },
      // The case studies section was called "Work" before 14 Oct 2026.
      { source: "/work", destination: "/case-studies", permanent: true },
      { source: "/work/:slug*", destination: "/case-studies/:slug*", permanent: true },
    ];
  },
};

const withCms = withPayload(nextConfig, { devBundleServerPackages: false });

/*
 * withPayload sends `Accept-CH`, `Vary` and `Critical-CH: Sec-CH-Prefers-Color-Scheme`
 * on every URL, so the admin can pick light or dark on its first render. Critical-CH
 * makes Chrome discard the first response and request the page again with the hint:
 * each first visit to the public site was fetched twice, and opening
 * /admin/collections/posts/create that way created two drafts, because Payload
 * creates the draft while rendering that page. Keep the hint on /admin only, without
 * Critical-CH; the admin corrects its theme in the browser anyway.
 */
export default {
  ...withCms,
  async headers() {
    const rules = (await withCms.headers?.()) ?? [];
    return rules.map((rule) =>
      rule.headers.some((h) => h.key === "Critical-CH")
        ? { ...rule, source: "/admin/:path*", headers: rule.headers.filter((h) => h.key !== "Critical-CH") }
        : rule,
    );
  },
} satisfies NextConfig;
