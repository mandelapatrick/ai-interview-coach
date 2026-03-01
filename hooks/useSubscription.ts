"use client";

import { useState, useEffect, useCallback } from "react";

interface SubscriptionData {
  plan: "free" | "pro";
  billingInterval: "monthly" | "yearly" | null;
  status: "active" | "canceled" | "past_due";
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  practiceUsed: number;
  learnUsed: number;
  practiceLimit: number | null;
  learnLimit: number | null;
  canPractice: boolean;
  canLearn: boolean;
  maxDurationSeconds: number | null;
}

const DEFAULT_DATA: SubscriptionData = {
  plan: "free",
  billingInterval: null,
  status: "active",
  cancelAtPeriodEnd: false,
  currentPeriodEnd: null,
  practiceUsed: 0,
  learnUsed: 0,
  practiceLimit: 1,
  learnLimit: 1,
  canPractice: true,
  canLearn: true,
  maxDurationSeconds: 900,
};

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const response = await fetch("/api/subscription/status");
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    ...data,
    loading,
    refetch,
  };
}
