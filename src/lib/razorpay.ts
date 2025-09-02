// Razorpay configuration
export const razorpayConfig = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  currency: 'INR',
  name: 'Enterprise Search',
  description: 'Subscription Payment',
  theme: {
    color: '#3B82F6'
  }
};

// Plan pricing (in paise - INR subunits)
export const subscriptionPlans = {
  starter: {
    name: 'Starter Plan',
    monthly: 0, // Free
    yearly: 0, // Free
  },
  plus: {
    name: 'Plus Plan', 
    monthly: 150000, // $15 = ₹1500 (approx) = 150000 paise
    yearly: 1440000, // $15 * 12 * 0.8 = $144 = ₹14400 (20% discount)
  },
  business: {
    name: 'Business Plan',
    monthly: 250000, // $25 = ₹2500 (approx) = 250000 paise
    yearly: 2400000, // $25 * 12 * 0.8 = $240 = ₹24000 (20% discount)
  }
};

export interface RazorpayOrderData {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, any>;
}

export interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
