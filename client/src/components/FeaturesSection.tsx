import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Camera, Sliders, CheckSquare, Sparkles } from 'lucide-react';
import { IMAGES } from '../data/images';

interface FeatureItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
  imageAlt: string;
  isCardLeft: boolean;
}

export const FeaturesSection: React.FC = () => {
  const features: FeatureItem[] = [
    {
      id: 'sales',
      badge: '01',
      title: 'Sales',
      description:
        'Automated lead tracking, dynamic proposals, and integrated invoicing with smart follow-ups.',
      icon: TrendingUp,
      image: IMAGES.featureSales,
      imageAlt: 'Photographer and client reviewing portfolio proposals',
      isCardLeft: true,
    },
    {
      id: 'pre-production',
      badge: '02',
      title: 'Pre-Production',
      description:
        'Moodboards, dynamic shot lists, location scouting databasing, and crew scheduling.',
      icon: Calendar,
      image: IMAGES.featurePreProd,
      imageAlt: 'Creative team organizing moodboards and photoshoot shot list',
      isCardLeft: false,
    },
    {
      id: 'production',
      badge: '03',
      title: 'Production',
      description:
        'Real-time expense tracking, digital release forms, and on-set timeline management.',
      icon: Camera,
      image: IMAGES.featureProd,
      imageAlt: 'On set photography production and digital paperwork management',
      isCardLeft: true,
    },
    {
      id: 'post-production',
      badge: '04',
      title: 'Post-Production',
      description:
        'AI-assisted culling integrated with Lightroom, version control, and retouching task delegation.',
      icon: Sliders,
      image: IMAGES.featurePostProd,
      imageAlt: 'Photo editor retoucher working on calibrated screen with graphics tablet',
      isCardLeft: false,
    },
    {
      id: 'client-review',
      badge: '05',
      title: 'Client Review',
      description:
        'Beautiful, brandable proofing galleries with precise feedback tools and selection approvals.',
      icon: CheckSquare,
      image: IMAGES.featureClientReview,
      imageAlt: 'Clients approving final photo selects in proofing gallery',
      isCardLeft: true,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-display">
              Everything Your <br />
              Photography Business <br />
              Needs.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              A comprehensive suite of tools meticulously crafted to handle the
              business of photography, end-to-end.
            </p>
          </motion.div>
        </div>

        {/* Alternating Feature Cards & Images */}
        <div className="space-y-16 md:space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            const cardElement = (
              <motion.div
                initial={{ opacity: 0, x: feature.isCardLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="bg-brand-50/80 hover:bg-brand-50 border border-purple-100 rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-soft group transition-all duration-300 min-h-[280px]"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-purple-100/80 flex items-center justify-center text-brand-600 group-hover:scale-105 group-hover:bg-brand-nav group-hover:text-white transition-all duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-3xl font-extrabold text-purple-200 font-display">
                    {feature.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 font-display">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );

            const imageElement = (
              <motion.div
                initial={{ opacity: 0, x: feature.isCardLeft ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="rounded-3xl overflow-hidden shadow-xl border border-slate-100 group min-h-[280px] bg-slate-900"
              >
                <div className="aspect-[16/10] w-full h-full overflow-hidden relative">
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            );

            return (
              <div
                key={feature.id}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
              >
                {feature.isCardLeft ? (
                  <>
                    {cardElement}
                    {imageElement}
                  </>
                ) : (
                  <>
                    {/* Mobile: card first, then image, or preserve alternating order */}
                    <div className="order-2 lg:order-1">{imageElement}</div>
                    <div className="order-1 lg:order-2">{cardElement}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
