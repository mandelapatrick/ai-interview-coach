import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";
import { getUserOnboarding } from "@/lib/supabase";
import OnboardingFlow from "@/components/OnboardingFlow";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/signin");
  }

  unstable_noStore();
  const onboarding = await getUserOnboarding(session.user.email);

  if (onboarding?.onboarding_completed) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
