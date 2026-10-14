"use client";

/*
 * Replaces the root layout when it fails, so it brings its own document and
 * inline styles: none of the site's CSS or fonts are loaded here.
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "16px",
          background: "#fff",
          color: "#0c1322",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <title>Something went wrong | Acceleret</title>
        <main style={{ maxWidth: "36rem" }}>
          <h1 style={{ fontWeight: 400, fontSize: "2rem", margin: "0 0 1rem" }}>Something broke on our side.</h1>
          <p style={{ margin: "0 0 2rem", lineHeight: 1.5 }}>
            Try again in a moment. If it keeps happening, write to support@acceleret.com.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              font: "inherit",
              padding: "0.75rem 1.5rem",
              border: 0,
              borderRadius: "999px",
              background: "#2350ff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
