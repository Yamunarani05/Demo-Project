import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface PricingProps {
  onSelectPlan: (plan: string) => void;
}

export const PricingSection: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      name: 'Starter',
      subtitle: 'For independent photographers',
      price: '$29',
      period: '/month',
      isPopular: false,
      isDark: false,
      features: [
        'Project management',
        'Client management',
        'Basic workflow',
        'Client review',
      ],
      buttonText: 'Get Started',
      buttonVariant: 'outline',
    },
    {
      name: 'Studio',
      subtitle: 'For growing photography teams',
      price: '$79',
      period: '/month',
      isPopular: true,
      isDark: true,
      features: [
        'Everything in Starter',
        'Production management',
        'AI assistance',
        'Team collaboration',
        'Advanced analytics',
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'solid',
    },
    {
      name: 'Enterprise',
      subtitle: 'For large creative businesses',
      price: 'Custom',
      period: '',
      isPopular: false,
      isDark: false,
      features: [
        'Everything in Studio',
        'Advanced automation',
        'Custom workflows',
        'Multiple teams',
        'Priority support',
      ],
      buttonText: 'Talk to Us',
      buttonVariant: 'outline',
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-brand-50 border border-purple-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-4"
          >
            OUR PACKAGES
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-display mb-4"
          >
            Plans That Grow With <br />
            You.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600"
          >
            Choose the perfect plan for your creative journey, from solo shoots to global agencies.
          </motion.p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                plan.isDark
                  ? 'bg-[#1E192B] text-white shadow-2xl scale-105 z-10 border border-purple-500/30'
                  : 'bg-white text-slate-900 shadow-soft border border-slate-200/80 hover:border-brand-200'
              }`}
            >
              {/* Most Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 right-6 bg-brand-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-200" />
                  MOST POPULAR
                </div>
              )}

              <div>
                {/* Plan Title & Subtitle */}
                <div className="mb-6">
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display mb-1">
                    {plan.name}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm ${
                      plan.isDark ? 'text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    {plan.subtitle}
                  </p>
                </div>

                {/* Price Display */}
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight font-display">
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.isDark ? 'text-purple-300' : 'text-slate-500'
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.isDark
                            ? 'bg-purple-500/20 text-brand-300'
                            : 'bg-purple-100 text-brand-600'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          plan.isDark ? 'text-purple-100' : 'text-slate-700'
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectPlan(plan.name)}
                className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  plan.isDark
                    ? 'bg-brand-nav hover:bg-brand-600 text-white shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95'
                    : 'border border-slate-300 text-slate-800 hover:bg-brand-50 hover:border-brand-300 hover:scale-105 active:scale-95'
                }`}
              >
                <span>{plan.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
