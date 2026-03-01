import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!supabaseAdmin || !stripe) return;

  const email =
    session.metadata?.user_email || session.customer_email;
  if (!email) return;

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Fetch subscription details to get interval
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const interval = subscription.items.data[0]?.plan?.interval;

  await supabaseAdmin
    .from("user_subscriptions")
    .upsert(
      {
        user_id: email,
        user_email: email,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan_type: "pro",
        billing_interval: interval === "year" ? "yearly" : "monthly",
        status: "active",
        current_period_end: new Date(
          subscription.items.data[0].current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_email" }
    );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!supabaseAdmin) return;

  const customerId = subscription.customer as string;

  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
  };

  const mappedStatus = statusMap[subscription.status] || "active";
  const interval = subscription.items.data[0]?.plan?.interval;

  await supabaseAdmin
    .from("user_subscriptions")
    .update({
      status: mappedStatus,
      plan_type: subscription.status === "canceled" ? "free" : "pro",
      billing_interval: interval === "year" ? "yearly" : "monthly",
      current_period_end: new Date(
        subscription.items.data[0].current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!supabaseAdmin) return;

  const customerId = subscription.customer as string;

  await supabaseAdmin
    .from("user_subscriptions")
    .update({
      plan_type: "free",
      billing_interval: null,
      status: "active",
      stripe_subscription_id: null,
      current_period_end: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!supabaseAdmin) return;

  const customerId = invoice.customer as string;

  await supabaseAdmin
    .from("user_subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}
