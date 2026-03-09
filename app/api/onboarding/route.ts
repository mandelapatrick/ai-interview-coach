import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getUserOnboarding, saveUserOnboarding, markOnboardingComplete } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const onboarding = await getUserOnboarding(session.user.email);
    return NextResponse.json(onboarding);
  } catch (error) {
    console.error("Onboarding GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role, referral_source, markComplete } = body;

    // Save onboarding data
    const result = await saveUserOnboarding({
      user_email: session.user.email,
      role: role || "",
      referral_source,
    });

    // Optionally mark as complete
    if (markComplete) {
      await markOnboardingComplete(session.user.email);
      revalidatePath("/dashboard");
      revalidatePath("/onboarding");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Onboarding POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
