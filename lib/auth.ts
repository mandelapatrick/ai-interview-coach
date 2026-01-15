import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET;

// Check for missing environment variables
const missingVars: string[] = [];
if (!googleClientId) missingVars.push("GOOGLE_CLIENT_ID");
if (!googleClientSecret) missingVars.push("GOOGLE_CLIENT_SECRET");
if (!authSecret) missingVars.push("AUTH_SECRET");

if (missingVars.length > 0) {
  console.error(
    "\n" +
    "╔════════════════════════════════════════════════════════════════╗\n" +
    "║  MISSING AUTHENTICATION ENVIRONMENT VARIABLES                  ║\n" +
    "╠════════════════════════════════════════════════════════════════╣\n" +
    "║  The following required variables are not set:                 ║\n" +
    "║                                                                ║\n" +
    missingVars.map(v => `║  - ${v.padEnd(58)}║\n`).join("") +
    "║                                                                ║\n" +
    "║  Add these to your environment variables.                      ║\n" +
    "║                                                                ║\n" +
    "║  AUTH_SECRET: Generate with `openssl rand -base64 32`          ║\n" +
    "║  Google credentials: https://console.cloud.google.com/apis     ║\n" +
    "╚════════════════════════════════════════════════════════════════╝\n"
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: googleClientId && googleClientSecret ? [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ] : [],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
});
