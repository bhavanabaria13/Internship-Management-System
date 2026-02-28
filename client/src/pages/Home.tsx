import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import RequirementsSection from "@/components/RequirementsSection";
import ApplicationForm from "@/components/ApplicationForm";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [formOpen, setFormOpen] = useState(false);

  const handleApplyClick = () => setFormOpen(true);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-blue-900/10 pointer-events-none" />
      <Header 
        onAdminClick={() => setLocation('/admin/login')}
        onInternClick={() => setLocation('/intern/login')}
        onApplyClick={() => setFormOpen(true)}
        onCareerClick={() => setLocation('/career')}
        onContactClick={() => setLocation('/contact')}
      />
      <div className="fixed top-4 right-20 z-50">
        <ThemeToggle />
      </div>
      <main>
        <HeroSection onApplyClick={handleApplyClick} />
        <BenefitsSection />
        <RequirementsSection />
      </main>
      <Footer 
        onCareerClick={() => setLocation('/career')}
        onContactClick={() => setLocation('/contact')}
      />
      <ApplicationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => console.log("Application submitted")}
      />
    </div>
  );
}