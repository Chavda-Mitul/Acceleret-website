/**
 * "Who we are" (brief §4 Home section 6).
 *
 * PENDING (brief §7):
 * - founder photos, due 3 Nov: put files in /public/team and set `photo`
 * - partner name, role line and photo
 * - the merger line from "File 02" (not supplied with this brief)
 */

export type Person = {
  name: string;
  role: string;
  line: string;
  /** Path under /public, e.g. "/team/shivanshu.jpg". */
  photo?: string;
  /** Still waiting on founder content. Hidden when site.showPending is false. */
  pending?: boolean;
};

/** PENDING: the merger line from File 02. Leave empty to hide. */
export const mergerLine = "";

export const people: Person[] = [
  {
    name: "Shivanshu Mishra",
    role: "Co-founder",
    line: "Leads engineering and product.",
  },
  {
    name: "Abhishek Mishra",
    role: "Co-founder",
    line: "Leads clients and operations.",
  },
  {
    name: "Partner name",
    role: "Partner",
    line: "One line, pending.",
    pending: true,
  },
];
