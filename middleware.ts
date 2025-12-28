import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnCompany = req.nextUrl.pathname.startsWith("/company");
  const isOnPractice = req.nextUrl.pathname.startsWith("/practice");

  // Protected routes
  if ((isOnDashboard || isOnCompany || isOnPractice) && !isLoggedIn) {
    return Response.redirect(new URL("/signin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/company/:path*", "/practice/:path*"],
};
