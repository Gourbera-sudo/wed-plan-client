import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { APIError, betterAuth } from "better-auth";
import { hashPassword } from "better-auth/crypto";
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

function roleForEmail(email: string, requestedRole?: string) {
  const normalized = email.toLowerCase();
  // Env-based roles always win, and admin is never assignable from sign-up.
  if (adminEmails.has(normalized)) return "admin";
  if (vendorEmails.has(normalized)) return "vendor";
  return requestedRole === "vendor" ? "vendor" : "customer";
}

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
const PASSWORD_ERROR =
  "Password must be at least 6 characters and include one uppercase and one lowercase letter.";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    password: {
      hash: async (password) => {
        if (!PASSWORD_RULE.test(password)) {
          throw new APIError("BAD_REQUEST", { message: PASSWORD_ERROR });
        }
        return hashPassword(password);
      },
    },
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
  // Accepted only from the sign-up form; mapped to `role` in the hook below
  // and never stored or returned on the user document.
  user: {
    additionalFields: {
      signupRole: {
        type: "string",
        required: false,
        input: true,
        returned: false,
      },
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
        before: async (user) => {
          const requestedRole = (user as { signupRole?: string }).signupRole;

          return {
            data: {
              signupRole: undefined,
              role: roleForEmail(user.email, requestedRole),
            },
          };
        },
      },
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
