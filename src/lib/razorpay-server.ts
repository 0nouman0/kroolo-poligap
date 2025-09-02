import Razorpay from 'razorpay';

// Server-only Razorpay instance (do not import this in client components)
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
