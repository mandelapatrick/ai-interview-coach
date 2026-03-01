import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserSubscription,
  getUsageThisMonth,
  getMaxDuration,
  FREE_PRACTICE_LIMIT,
  FREE_LEARN_LIMIT,
} from "@/lib/subscription";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const [subscription, usage] = await Promise.all([
      getUserSubscription(email),
      getUsageThisMonth(email),
    ]);

    const isPro =
      subscription.plan === "pro" && subscription.status === "active";

    return NextResponse.json({
      plan: subscription.plan,
      billingInterval: subscription.billingInterval,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      currentPeriodEnd: subscription.currentPeriodEnd,
      practiceUsed: usage.practice,
      learnUsed: usage.learn,
      practiceLimit: isPro ? null : FREE_PRACTICE_LIMIT,
      learnLimit: isPro ? null : FREE_LEARN_LIMIT,
      canPractice: isPro || usage.practice < FREE_PRACTICE_LIMIT,
      canLearn: isPro || usage.learn < FREE_LEARN_LIMIT,
      maxDurationSeconds: getMaxDuration(subscription.plan),
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
