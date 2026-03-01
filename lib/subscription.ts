import { supabase, supabaseAdmin } from "./supabase";
import { stripe } from "./stripe";

const FREE_PRACTICE_LIMIT = 1;
const FREE_LEARN_LIMIT = 1;
const FREE_MAX_DURATION_SECONDS = 15 * 60; // 15 minutes

export interface SubscriptionStatus {
  plan: "free" | "pro";
  billingInterval: "monthly" | "yearly" | null;
  status: "active" | "canceled" | "past_due";
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}

export interface UsageStatus {
  practiceUsed: number;
  learnUsed: number;
  canPractice: boolean;
  canLearn: boolean;
  maxDurationSeconds: number | null; // null = unlimited
}

export async function getUserSubscription(
  email: string
): Promise<SubscriptionStatus> {
  // Pro override for beta testers / dev accounts
  const overrideEmails = (process.env.PRO_OVERRIDE_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (overrideEmails.includes(email.toLowerCase())) {
    return {
      plan: "pro",
      billingInterval: null,
      status: "active",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      stripeCustomerId: null,
    };
  }

  if (!supabase) {
    return {
      plan: "free",
      billingInterval: null,
      status: "active",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      stripeCustomerId: null,
    };
  }

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_email", email)
    .single();

  if (error || !data) {
    // Lazily create free subscription record
    const { data: newSub } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: email,
        user_email: email,
        plan_type: "free",
        status: "active",
      })
      .select()
      .single();

    return {
      plan: "free",
      billingInterval: null,
      status: "active",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      stripeCustomerId: newSub?.stripe_customer_id || null,
    };
  }

  // Sync latest state from Stripe if user has an active subscription
  if (data.stripe_subscription_id && stripe && data.plan_type === "pro") {
    try {
      const sub = await stripe.subscriptions.retrieve(data.stripe_subscription_id);
      const interval = sub.items.data[0]?.plan?.interval;
      const statusMap: Record<string, string> = {
        active: "active",
        past_due: "past_due",
        canceled: "canceled",
        unpaid: "past_due",
      };
      const mappedStatus = statusMap[sub.status] || "active";
      const synced = {
        plan_type: sub.status === "canceled" ? "free" : "pro",
        billing_interval: interval === "year" ? "yearly" : "monthly",
        status: mappedStatus,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_end: new Date(
          sub.current_period_end * 1000
        ).toISOString(),
      };

      // Update DB if anything changed (use admin client to bypass RLS)
      if (
        synced.cancel_at_period_end !== (data.cancel_at_period_end || false) ||
        synced.status !== data.status ||
        synced.plan_type !== data.plan_type
      ) {
        const adminClient = supabaseAdmin || supabase;
        await adminClient!
          .from("user_subscriptions")
          .update({ ...synced, updated_at: new Date().toISOString() })
          .eq("user_email", email);
      }

      return {
        plan: synced.plan_type as "free" | "pro",
        billingInterval: synced.billing_interval as "monthly" | "yearly" | null,
        status: synced.status as "active" | "canceled" | "past_due",
        cancelAtPeriodEnd: synced.cancel_at_period_end,
        currentPeriodEnd: synced.current_period_end,
        stripeCustomerId: data.stripe_customer_id || null,
      };
    } catch (err) {
      console.error("Stripe sync failed, using DB state:", err);
    }
  }

  return {
    plan: data.plan_type as "free" | "pro",
    billingInterval: data.billing_interval as "monthly" | "yearly" | null,
    status: data.status as "active" | "canceled" | "past_due",
    cancelAtPeriodEnd: data.cancel_at_period_end || false,
    currentPeriodEnd: data.current_period_end || null,
    stripeCustomerId: data.stripe_customer_id || null,
  };
}

export async function getUsageThisMonth(
  email: string
): Promise<{ practice: number; learn: number }> {
  if (!supabase) {
    return { practice: 0, learn: 0 };
  }

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("usage_tracking")
    .select("session_type")
    .eq("user_email", email)
    .eq("period_start", periodStart);

  if (error || !data) {
    return { practice: 0, learn: 0 };
  }

  return {
    practice: data.filter((r) => r.session_type === "practice").length,
    learn: data.filter((r) => r.session_type === "learn").length,
  };
}

export async function recordUsage(
  email: string,
  sessionType: "practice" | "learn",
  questionId?: string
): Promise<void> {
  if (!supabase) return;

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  await supabase.from("usage_tracking").insert({
    user_email: email,
    session_type: sessionType,
    question_id: questionId || null,
    period_start: periodStart,
  });
}

export async function canStartSession(
  email: string,
  sessionType: "practice" | "learn"
): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await getUserSubscription(email);

  if (subscription.plan === "pro" && subscription.status === "active") {
    return { allowed: true };
  }

  const usage = await getUsageThisMonth(email);
  const limit =
    sessionType === "practice" ? FREE_PRACTICE_LIMIT : FREE_LEARN_LIMIT;
  const used = sessionType === "practice" ? usage.practice : usage.learn;

  if (used >= limit) {
    return {
      allowed: false,
      reason: `You've used your free ${sessionType} session this month. Upgrade to Pro for unlimited access.`,
    };
  }

  return { allowed: true };
}

export function getMaxDuration(plan: "free" | "pro"): number | null {
  return plan === "pro" ? null : FREE_MAX_DURATION_SECONDS;
}

export { FREE_PRACTICE_LIMIT, FREE_LEARN_LIMIT, FREE_MAX_DURATION_SECONDS };
