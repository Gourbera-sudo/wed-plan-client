import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { createAccessControl } from "better-auth/plugins/access";
import { admin } from "better-auth/plugins/admin";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("wed-plan");

const statement = {
  dashboard: ["view"],
  services: ["view", "create", "update", "delete"],
  bookings: ["view", "manage"],
  subscriptions: ["view", "manage"],
  users: ["view", "manage"],
  transactions: ["view"],
} as const;

const ac = createAccessControl(statement);

export const authRoles = {
  customer: ac.newRole({
    dashboard: ["view"],
    services: ["view"],
    bookings: ["view"],
  }),
  vendor: ac.newRole({
    dashboard: ["view"],
    services: ["view", "create", "update"],
    bookings: ["view", "manage"],
    subscriptions: ["view", "manage"],
  }),
  admin: ac.newRole({
    dashboard: ["view"],
    services: ["view", "create", "update", "delete"],
    bookings: ["view", "manage"],
    subscriptions: ["view", "manage"],
    users: ["view", "manage"],
    transactions: ["view"],
  }),
};

const emailSet = (value?: string) =>
  new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

const adminEmails = emailSet(process.env.ADMIN_EMAILS);
const vendorEmails = emailSet(process.env.VENDOR_EMAILS);

function roleForEmail(email: string) {
  const normalized = email.toLowerCase();
  if (adminEmails.has(normalized)) return "admin";
  if (vendorEmails.has(normalized)) return "vendor";
  return "customer";
}

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    admin({
      defaultRole: "customer",
      adminRoles: ["admin"],
      roles: authRoles,
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            role: roleForEmail(user.email),
          },
        }),
      },
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
