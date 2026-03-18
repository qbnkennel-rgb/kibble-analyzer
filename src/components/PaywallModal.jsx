import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PaywallModal({ onClose }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        successUrl: window.location.href + '?subscribed=true',
        cancelUrl: window.location.href,
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      alert('Error starting checkout: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-blue-400 shadow-2xl">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-4xl mb-2">🐾</div>
            <CardTitle className="text-2xl text-blue-700">Upgrade to Premium</CardTitle>
            <p className="text-gray-500 mt-1 text-sm">You've used your 2 free analyses this month</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-5xl font-bold text-blue-700">$1.99</span>
            <span className="text-gray-500">/month</span>
          </div>

          <ul className="space-y-3">
            {[
              'Unlimited kibble analyses',
              'Full ingredient scoring & red flags',
              'FDA recall alerts',
              'Seasonal & location analysis',
              'Gut microbiome analysis',
              'Price comparison search',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Subscribe for $1.99/month
              </>
            )}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            Cancel anytime. Secure payment via Stripe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}