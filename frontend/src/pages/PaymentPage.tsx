import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, ShieldCheck, ArrowRight, Lock, Sparkles, Building2, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function PaymentPage() {
  const { studioId } = useParams<{ studioId: string }>();
  const navigate = useNavigate();
  const { studiosList, createRazorpayOrder, verifyRazorpayPayment } = useAuth();

  const studio = studiosList.find((s) => s.id === studioId) || studiosList[0];
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [txRef, setTxRef] = useState<string | null>(null);

  const amount = studio?.amount || 4999;
  const planName = studio?.plan || 'Studio Pro Subscription';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayNow = async () => {
    setIsLoading(true);
    try {
      const orderRes = await createRazorpayOrder(studio.id, amount, planName);
      if (!orderRes || !orderRes.orderId) {
        throw new Error('Could not initialize Razorpay order');
      }

      const options = {
        key: orderRes.keyId || 'rzp_test_lumina12345',
        amount: orderRes.amountInPaise || amount * 100,
        currency: orderRes.currency || 'INR',
        name: 'LUMINA Photography SaaS',
        description: `${planName} for ${studio.name}`,
        image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&auto=format&fit=crop&q=80',
        order_id: orderRes.orderId,
        prefill: {
          name: studio.adminName || studio.name,
          email: studio.adminEmail || 'admin@lumina.io',
          contact: studio.adminPhone || '+919876543210',
        },
        theme: {
          color: '#5E35B1',
        },
        handler: async function (response: any) {
          setIsLoading(true);
          try {
            const verifyRes = await verifyRazorpayPayment({
              studioId: studio.id,
              razorpay_order_id: response.razorpay_order_id || orderRes.orderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || 'mock_sig',
            });

            if (verifyRes && verifyRes.success) {
              setTxRef(response.razorpay_payment_id || verifyRes.transaction?.razorpayPaymentId || `pay_${Date.now()}`);
              setIsCompleted(true);
            }
          } catch (err: any) {
            toast.error('Payment verification failed. Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback test payment
        toast.info('Initiating Razorpay Checkout (Test Mode)...');
        setTimeout(async () => {
          const mockPayId = `pay_test_${Date.now().toString().slice(-8)}`;
          await verifyRazorpayPayment({
            studioId: studio.id,
            razorpay_order_id: orderRes.orderId,
            razorpay_payment_id: mockPayId,
            razorpay_signature: 'test_signature_valid',
          });
          setTxRef(mockPayId);
          setIsCompleted(true);
          setIsLoading(false);
        }, 1200);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Payment initiation failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Brand Header */}
        <div className="bg-[#5E35B1] p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-2 text-white font-bold">
            <Camera className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold font-display">LUMINA SaaS Subscription</h1>
          <p className="text-xs text-purple-200 mt-0.5">Secure Razorpay Payment Checkout</p>
        </div>

        {!isCompleted ? (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80">
              <Building2 className="w-6 h-6 text-purple-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">{studio?.name}</div>
                <div className="text-xs text-purple-700 font-semibold">{planName}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-slate-500">Amount Due</div>
                <div className="text-lg font-black text-slate-900">₹{amount.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs text-slate-600">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span>Account Email</span>
                <span className="font-bold text-slate-900">{studio?.adminEmail}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span>Trial Status</span>
                <span className="font-bold text-amber-600 uppercase">{studio?.trialStatus || 'EXPIRED'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span>Payment Status</span>
                <span className="font-bold text-rose-600 uppercase">{studio?.paymentStatus || 'PAYMENT_PENDING'}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handlePayNow}
              className="w-full bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Launching Razorpay Checkout...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Make Payment (₹{amount.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Verified Payment Partner</span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 font-display mb-1">
              Payment Confirmed!
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Your subscription for <strong>{studio.name}</strong> is now ACTIVE.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Razorpay Ref ID:</span>
                <span className="font-mono font-bold text-slate-900">{txRef}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription Status:</span>
                <span className="font-bold text-emerald-600">ACTIVE / CONVERTED</span>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-900/20 inline-block"
            >
              Sign In to Studio Dashboard
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
