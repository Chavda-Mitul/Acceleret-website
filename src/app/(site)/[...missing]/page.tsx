import { notFound } from "next/navigation";

/*
 * The site and the CMS each have their own root layout, so there is no
 * app-wide layout to wrap unmatched URLs. Catching them here renders the
 * site's own 404 page (../not-found.tsx) with its header and footer.
 */
// Always a 404, so there is no page to validate for instant navigation.
export const instant = false;

export default function Missing() {
  notFound();
}
