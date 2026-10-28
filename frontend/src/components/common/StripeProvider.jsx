'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function StripeProvider({ children, clientSecret }) {
  if (!clientSecret) return null;
  return (
    <Elements stripe={stripePromise} options={{
      clientSecret,
      layout: 'tabs',
      paymentMethodOrder: ['card'],
      appearance: {
        theme: 'night',
        variables: {
          colorPrimary: '#7c3aed',
          colorBackground: '#1a1a2e',
          colorText: '#ffffff',
          colorDanger: '#ef4444',
          borderRadius: '8px'
        }
      }
    }}>
      {children}
    </Elements>
  );
}
