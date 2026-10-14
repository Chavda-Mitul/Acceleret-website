import type { CollectionConfig } from "payload";

/** People who can sign in to /admin and write posts. */
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    // Lock an account for 10 minutes after 5 wrong passwords.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email"],
    group: "Settings",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Shown as the author on articles." },
    },
  ],
};
