import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import EnforcementSection from "@/components/EnforcementSection";
import CaseStudySection from "@/components/CaseStudySection";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>CodeOrbit | Learn to Code with AI</title>
        <meta 
          name="description" 
          content="Stay in orbit. Master the code. CodeOrbit is a guided co-building platform powered by Orbit AI where you write every line and gain real skills." 
        />
        <meta name="keywords" content="coding platform, project-based learning, skill transfer, AI mentor, orbit, learn to code, college projects" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <HowItWorksSection />
          <EnforcementSection />
          <CaseStudySection />
          <PricingSection />
        </main>
        <FooterSection />
      </div>
    </>
  );
};

export default Index;
