import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import EnforcementSection from "@/components/EnforcementSection";
import CaseStudySection from "@/components/CaseStudySection";
import PricingSection from "@/components/PricingSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import SectionSwapper from "@/components/SectionSwapper";

export type SectionId = "home" | "how-it-works" | "enforcement" | "case-study" | "pricing" | "contact";

export const NAV_SECTIONS: { id: SectionId; label: string }[] = [
  { id: "home",         label: "Home" },
  { id: "how-it-works", label: "How It Works" },
  { id: "enforcement",  label: "Enforcement" },
  { id: "case-study",   label: "Case Study" },
  { id: "pricing",      label: "Pricing" },
  { id: "contact",      label: "Contact" },
];

const META: Record<SectionId, { title: string; description: string }> = {
  "home": {
    title: "CodeOrbit | Learn to Code with AI",
    description:
      "Stay in orbit. Master the code. CodeOrbit is a guided co-building platform powered by Orbit AI where you write every line and gain real skills.",
  },
  "how-it-works": {
    title: "How It Works | CodeOrbit",
    description:
      "A ruthless, no-compromise journey from project idea to fully-owned, interview-ready build. 6 steps. No shortcuts.",
  },
  "enforcement": {
    title: "Enforcement | CodeOrbit",
    description:
      "Zero tolerance for shortcuts. CodeOrbit's cheat detection system monitors typing patterns, commit forensics, and AI over-reliance.",
  },
  "case-study": {
    title: "Case Study | CodeOrbit",
    description:
      "Follow Rohit's 6-week journey — from zero backend knowledge to a fully working Attendance Management App built entirely by him.",
  },
  "pricing": {
    title: "Pricing | CodeOrbit",
    description:
      "Pay for learning, not shortcuts. Free tier, Builder Plan (₹2,999/project), and Pro Builder (₹5,999/project).",
  },
  "contact": {
    title: "Contact Us | CodeOrbit",
    description:
      "Get in touch with the CodeOrbit team. Questions about the platform, mentorship, billing, partnerships, or technical support.",
  },
};

const Index = () => {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const prevIndexRef = useRef<number>(0);

  // Sync from URL hash on initial load
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as SectionId;
    if (NAV_SECTIONS.find((s) => s.id === hash)) {
      prevIndexRef.current = NAV_SECTIONS.findIndex((s) => s.id === hash);
      setActiveSection(hash);
    }
  }, []);

  const handleNavigate = (id: SectionId) => {
    prevIndexRef.current = NAV_SECTIONS.findIndex((s) => s.id === activeSection);
    setActiveSection(id);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeIndex = NAV_SECTIONS.findIndex((s) => s.id === activeSection);
  const direction: "forward" | "backward" =
    activeIndex >= prevIndexRef.current ? "forward" : "backward";

  const meta = META[activeSection];

  /** Map section id → component (HeroSection gets onNavigate prop) */
  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HeroSection onNavigate={handleNavigate} />;
      case "how-it-works":
        return <HowItWorksSection onNavigate={handleNavigate} />;
      case "enforcement":
        return <EnforcementSection />;
      case "case-study":
        return <CaseStudySection />;
      case "pricing":
        return <PricingSection />;
      case "contact":
        return <ContactSection />;
    }
  };

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta
          name="keywords"
          content="coding platform, project-based learning, skill transfer, AI mentor, orbit, learn to code, college projects"
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header
          activeSection={activeSection}
          sections={NAV_SECTIONS}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 pt-16">
          <SectionSwapper activeSection={activeSection} direction={direction}>
            {renderSection()}
          </SectionSwapper>
        </main>

        <FooterSection onNavigate={handleNavigate} />
      </div>
    </>
  );
};

export default Index;
