"use client";

import { useEffect, useState } from "react";
import { services, type ServiceId } from "@/content/services";

/** Sticky station list for /services: lights the section you're reading, links to each anchor. */
export function ServiceIndex() {
  const [active, setActive] = useState<ServiceId>(services[0].id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as ServiceId);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    services.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav className="svc-index" aria-label="Services on this page">
      <ol>
        {services.map((s) => (
          <li key={s.id} data-active={active === s.id}>
            <a href={`#${s.id}`} aria-current={active === s.id ? "location" : undefined}>
              <span className="svc-index__node" aria-hidden />
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
