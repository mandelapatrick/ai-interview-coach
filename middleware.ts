import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnCompany = req.nextUrl.pathname.startsWith("/company");
  const isOnPractice = req.nextUrl.pathname.startsWith("/practice");
  const isOnHistory = req.nextUrl.pathname.startsWith("/history");
  const isOnLearn = req.nextUrl.pathname.startsWith("/learn");
  const isOnOnboarding = req.nextUrl.pathname.startsWith("/onboarding");

  // Protected routes
  if ((isOnDashboard || isOnCompany || isOnPractice || isOnHistory || isOnLearn || isOnOnboarding) && !isLoggedIn) {
    return Response.redirect(new URL("/signin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/company/:path*", "/practice/:path*", "/history/:path*", "/learn/:path*", "/onboarding/:path*"],
};
