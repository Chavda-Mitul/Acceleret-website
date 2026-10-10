"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType } from "react";

type Props<T extends ElementType> = {
  as?: T;
  /** Fraction of the element that must be visible. */
  threshold?: number;
  /** Shrinks the viewport bottom so things start a little after they appear. */
  rootMargin?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Sets data-inview="true" the first time the element is seen. CSS does the
 * rest (.draw lines draw, .rise elements settle). Fires once, then disconnects.
 */
export function InView<T extends ElementType = "div">({
  as,
  threshold = 0.25,
  rootMargin = "0px 0px -8% 0px",
  ...rest
}: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.inview === "true") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.inview = "true";
          io.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return <Tag ref={ref} data-inview="false" {...rest} />;
}
