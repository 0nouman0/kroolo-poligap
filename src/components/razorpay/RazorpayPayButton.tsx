"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { subscriptionPlans, razorpayConfig } from "@/lib/razorpay";

type BillingInfo = {
  plan: string;
  billingCycle: string; // Monthly | Yearly
  currentBillValue?: number;
  nextPaymentValue?: number;
};

interface Props {
  userId: string;
  billingInfo: BillingInfo;
  label?: string;
}

export default function RazorpayPayButton({ userId, billingInfo, label = "Pay Now" }: Props) {
  const [loading, setLoading] = useState(false);

  // Decide the payable amount (in paise) using plan + cycle mapping
  const amountPaise = useMemo(() => {
    const planKey = (billingInfo?.plan || "").toLowerCase();
    const cycle = (billingInfo?.billingCycle || "Monthly").toLowerCase();
    const plan = (subscriptionPlans as any)[planKey];
    if (!plan) return 0;
    return cycle === "yearly" ? plan.yearly : plan.monthly;
  }, [billingInfo]);

  // Load Razorpay script once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {};
    script.onerror = () => toast.error("Failed to load Razorpay checkout");
    document.body.appendChild(script);
  }, []);

  const handlePay = useCallback(async () => {
    try {
      if (!userId) {
        toast.error("Missing userId");
        return;
      }
      if (!amountPaise || amountPaise <= 0) {
        toast.error("Invalid amount for selected plan");
        return;
      }

      setLoading(true);

      // 1) Create order on server
      const createRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountPaise, currency: "INR", notes: { userId } }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok || !createJson?.success) {
        throw new Error(createJson?.message || "Failed to create order");
      }

      const { order } = createJson;

      // 2) Open Razorpay Checkout
      const options: any = {
        key: razorpayConfig.key,
        amount: amountPaise,
        currency: "INR",
        name: razorpayConfig.name,
        description: razorpayConfig.description,
        order_id: order.id,
        notes: { userId },
        theme: razorpayConfig.theme,
        handler: async function (response: any) {
          try {
            // 3) Verify payment on server
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok || !verifyJson?.success) {
              throw new Error(verifyJson?.message || "Payment verification failed");
            }

            // 4) Update plan in database after successful payment
            const changePlanRes = await fetch("/api/settings/change-plan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                plan: billingInfo.plan,
                billingCycle: billingInfo.billingCycle,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              }),
            });
            const changePlanJson = await changePlanRes.json();
            if (!changePlanRes.ok || !changePlanJson?.success) {
              throw new Error(changePlanJson?.error || "Failed to update plan");
            }

            toast.success("Payment successful! Plan upgraded.");
            // Reload page to reflect changes
            window.location.reload();
          } catch (err: any) {
            toast.error(err.message || "Verification error");
          }
        },
        prefill: {},
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }, [amountPaise, userId]);

  return (
    <Button onClick={handlePay} disabled={loading} size="sm" className="w-full">
      {loading ? "Processing..." : label}
    </Button>
  );
}
