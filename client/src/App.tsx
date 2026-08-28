import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AISection } from './components/AISection';
import { FeaturesSection } from './components/FeaturesSection';
import { WorkflowSection } from './components/WorkflowSection';
import { PricingSection } from './components/PricingSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { StatsSection } from './components/StatsSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { DemoModal } from './components/DemoModal';
import { ContactModal } from './components/ContactModal';
import { Toast, ToastMessage } from './components/Toast';

export function App() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Studio');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error', title: string, description?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenDemoWithPlan = (plan: string) => {
    setSelectedPlan(plan);
    setIsDemoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Navigation Bar */}
      <Navbar
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
      />

      {/* Main Landing Page Flow */}
      <main className="flex-grow">
        {/* 1. Hero Section */}
        <Hero
          onOpenDemo={() => setIsDemoModalOpen(true)}
          onOpenContact={() => setIsContactModalOpen(true)}
        />

        {/* 2. AI Section: More Than Management */}
        <AISection />

        {/* 3. Features Section: Everything Your Photography Business Needs */}
        <FeaturesSection />

        {/* 4. Photography Workflow with Curved Dashed Purple Path: Road map for your view */}
        <WorkflowSection />

        {/* 5. Pricing Section: Plans That Grow With You */}
        <PricingSection onSelectPlan={handleOpenDemoWithPlan} />

        {/* 6. Testimonials Carousel / Cards */}
        <TestimonialsSection />

        {/* 7. Showcase Mosaic Portfolio */}
        <ShowcaseSection />

        {/* 8. Trusted by Creative Businesses & Stats */}
        <StatsSection />

        {/* 9. Pre-Footer Call to Action */}
        <CTASection onOpenDemo={() => setIsDemoModalOpen(true)} />
      </main>

      {/* Footer */}
      <Footer
        onOpenContact={() => setIsContactModalOpen(true)}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onSuccess={(msg) => showToast('success', 'Success', msg)}
        onError={(err) => showToast('error', 'Notice', err)}
      />

      {/* Modals */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        initialPlan={selectedPlan}
        onSuccess={(msg) => showToast('success', 'Demo Request Received', msg)}
        onError={(err) => showToast('error', 'Submission Failed', err)}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSuccess={(msg) => showToast('success', 'Message Dispatched', msg)}
        onError={(err) => showToast('error', 'Message Failed', err)}
      />
    </div>
  );
}

export default App;
