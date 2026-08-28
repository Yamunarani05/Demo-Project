import React from 'react';
import { motion } from 'framer-motion';
import { IMAGES } from '../data/images';

export const ShowcaseSection: React.FC = () => {
  const items = [
    {
      category: 'EVENTS',
      title: 'The Grand Gala',
      image: IMAGES.showcaseGala,
      span: 'col-span-12 md:col-span-8',
      aspect: 'aspect-[16/9]',
    },
    {
      category: 'FASHION',
      title: 'Avant-Garde',
      image: IMAGES.showcaseFashion,
      span: 'col-span-12 md:col-span-4',
      aspect: 'aspect-[4/5] md:aspect-auto',
    },
    {
      category: 'WEDDING',
      title: 'Eternal Vows',
      image: IMAGES.showcaseWedding,
      span: 'col-span-12 md:col-span-4',
      aspect: 'aspect-[4/3]',
    },
    {
      category: 'PRODUCT',
      title: 'Precision',
      image: IMAGES.showcaseWatch,
      span: 'col-span-12 md:col-span-4',
      aspect: 'aspect-[4/3]',
    },
    {
      category: 'COMMERCIAL',
      title: 'Urban Motion',
      image: IMAGES.showcaseCity,
      span: 'col-span-12 md:col-span-4',
      aspect: 'aspect-[4/3]',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Showcase Mosaic Grid */}
        <div className="grid grid-cols-12 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${item.span} relative group overflow-hidden rounded-3xl bg-slate-900 shadow-xl`}
            >
              <div className={`w-full h-full min-h-[260px] overflow-hidden relative ${item.aspect}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                
                {/* Vignette Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent pointer-events-none" />

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-6 left-6 z-10">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-purple-300 block mb-1">
                    {item.category}
                  </span>
                  <h4 className="text-xl sm:text-2xl font-bold text-white font-display">
                    {item.title}
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
