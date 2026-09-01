import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  ClipboardList,
  Camera,
  Aperture,
  CloudUpload,
  Wand2,
  Send,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { IMAGES } from '../data/images';

interface WorkflowStep {
  step: string;
  title: string;
  icon: React.ElementType;
  points: string[];
  image: string;
  imageAlt: string;
  isLeft: boolean;
}

export const WorkflowSection: React.FC = () => {
  const steps: WorkflowStep[] = [
    {
      step: '01',
      title: 'Receive Order & Understand',
      icon: MessageSquare,
      points: [
        'Receive client inquiry & details',
        'Understand the type of shoot, purpose & expectations',
        'Discuss ideas, references & requirements',
      ],
      image: IMAGES.workflow01,
      imageAlt: 'Photographer receiving client inquiry',
      isLeft: true,
    },
    {
      step: '02',
      title: 'Plan The Shoot',
      icon: ClipboardList,
      points: [
        'Select the best location',
        'Plan the concept, mood & style',
        'Create shoot schedule & shot list',
        'Get client approval',
      ],
      image: IMAGES.workflow02,
      imageAlt: 'Planning photoshoot concept and moodboards',
      isLeft: false,
    },
    {
      step: '03',
      title: 'Prepare Gear & Setup',
      icon: Camera,
      points: [
        'Choose the right camera & lenses',
        'Select lighting, accessories & props',
        'Check & prepare all equipment',
      ],
      image: IMAGES.workflow03,
      imageAlt: 'Preparing professional camera gear and lighting',
      isLeft: true,
    },
    {
      step: '04',
      title: 'The Photoshoot',
      icon: Aperture,
      points: [
        'Arrive on location & setup',
        'Test lighting, angles & settings',
        'Capture moments as per plan',
        'Ensure quality in every shot',
      ],
      image: IMAGES.workflow04,
      imageAlt: 'On location commercial photoshoot session',
      isLeft: false,
    },
    {
      step: '05',
      title: 'Backup & Secure Files',
      icon: CloudUpload,
      points: [
        'Backup all photos on-site',
        'Review and ensure all important shots are captured',
        'Secure files for safe keeping',
      ],
      image: IMAGES.workflow05,
      imageAlt: 'Backing up RAW photo files in studio',
      isLeft: true,
    },
    {
      step: '06',
      title: 'Editing & Enhancement',
      icon: Wand2,
      points: [
        'Select the best shots',
        'Edit for color, light, and detail',
        'Retouch and enhance to perfection',
      ],
      image: IMAGES.workflow06,
      imageAlt: 'Photo retouching and color grading',
      isLeft: false,
    },
    {
      step: '07',
      title: 'Deliver To Client',
      icon: Send,
      points: [
        'Share final high-resolution images',
        'Deliver through preferred platform',
        'Ensure client satisfaction',
      ],
      image: IMAGES.workflow07,
      imageAlt: 'Delivering final branded photo gallery to client',
      isLeft: true,
    },
    {
      step: '08',
      title: 'Follow Up & Build Relationship',
      icon: HeartHandshake,
      points: [
        'Get client feedback',
        'Make necessary revisions if any',
        'Stay connected for future shoots & referrals',
      ],
      image: IMAGES.workflow08,
      imageAlt: 'Client relationship building and future referrals',
      isLeft: false,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-20 text-left">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight font-display"
          >
            Road map <br />
            for your view.
          </motion.h2>
        </div>

        {/* Workflow Roadmap Container with Background Connecting Dashed Path */}
        <div className="relative">

          {/* Desktop SVG Connecting Dashed Curve */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 1000 2800"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Main Animated Purple Dashed Path winding across the 8 steps */}
              <path
                d="
                  M 260, 180
                  C 260, 360 740, 360 740, 520
                  C 740, 700 260, 700 260, 860
                  C 260, 1040 740, 1040 740, 1200
                  C 740, 1380 260, 1380 260, 1540
                  C 260, 1720 740, 1720 740, 1880
                  C 740, 2060 260, 2060 260, 2220
                  C 260, 2400 740, 2400 740, 2560
                "
                stroke="#8B5CF6"
                strokeWidth="3.5"
                strokeDasharray="9 9"
                strokeLinecap="round"
                className="animated-dashed-path opacity-80"
              />

              {/* Glowing Milestones / Circles at each connector apex */}
              {[180, 520, 860, 1200, 1540, 1880, 2220, 2560].map((y, i) => {
                const x = i % 2 === 0 ? 260 : 740;
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill="#7C3AED"
                      className="animate-pulse"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#FFFFFF"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Workflow Steps List */}
          <div className="space-y-16 md:space-y-24 relative z-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;

              const cardContent = (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6 }}
                  className="bg-brand-50/90 hover:bg-brand-50 border border-purple-200/80 rounded-3xl p-6 sm:p-10 shadow-soft group transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-purple-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-nav group-hover:text-white transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-purple-100/70 px-3 py-1 rounded-full">
                        Step {item.step}
                      </span>
                    </div>
                    <span className="text-2xl font-extrabold text-purple-300 font-display">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 font-display">
                    {item.title}
                  </h3>

                  <ul className="space-y-2.5">
                    {item.points.map((pt, pIdx) => (
                      <li
                        key={pIdx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed"
                      >
                        <span className="text-brand-600 font-bold text-base leading-none mt-0.5">
                          •
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );

              const imageContent = (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6 }}
                  className="rounded-3xl overflow-hidden shadow-xl border border-slate-100 group bg-slate-900 aspect-[16/10]"
                >
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </motion.div>
              );

              return (
                <div
                  key={item.step}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center"
                >
                  {item.isLeft ? (
                    <>
                      <div>{cardContent}</div>
                      <div>{imageContent}</div>
                    </>
                  ) : (
                    <>
                      <div className="order-2 lg:order-1">{imageContent}</div>
                      <div className="order-1 lg:order-2">{cardContent}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
