import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const { priceType } = await request.json();

    if (!["monthly", "yearly"].includes(priceType)) {
      return NextResponse.json(
        { error: "Invalid price type" },
        { status: 400 }
      );
    }

    const priceId =
      priceType === "monthly"
        ? process.env.STRIPE_MONTHLY_PRICE_ID
        : process.env.STRIPE_YEARLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 503 }
      );
    }

    const email = session.user.email;

    // Find or create Stripe customer
    let customerId: string | undefined;

    if (supabase) {
      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("stripe_customer_id")
        .eq("user_email", email)
        .single();

      if (sub?.stripe_customer_id) {
        customerId = sub.stripe_customer_id;
      }
    }

    if (!customerId) {
      // Check if customer exists in Stripe
      const existing = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          name: session.user.name || undefined,
        });
        customerId = customer.id;
      }

      // Save customer ID to our DB
      if (supabase) {
        await supabase
          .from("user_subscriptions")
          .update({ stripe_customer_id: customerId })
          .eq("user_email", email);
      }
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        user_email: email,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
