import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.error(
    "\n" +
    "╔════════════════════════════════════════════════════════════════╗\n" +
    "║  MISSING GOOGLE OAUTH CREDENTIALS                              ║\n" +
    "╠════════════════════════════════════════════════════════════════╣\n" +
    "║  Google Sign-In will not work until you configure:             ║\n" +
    "║                                                                ║\n" +
    "║  1. GOOGLE_CLIENT_ID                                           ║\n" +
    "║  2. GOOGLE_CLIENT_SECRET                                       ║\n" +
    "║                                                                ║\n" +
    "║  Add these to your .env.local file.                            ║\n" +
    "║                                                                ║\n" +
    "║  Get credentials at: https://console.cloud.google.com/apis     ║\n" +
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
