import { ArrowRight, GitBranch, Shield, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-mono text-primary">No shortcuts. No outsourcing. Only building.</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Stop <span className="text-gradient">Outsourcing</span> Projects.
            <br />
            <span className="text-muted-foreground">Start</span> Building Them.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A co-building platform where you write every line of code — with enforced guidance, 
            real mentorship, and zero tolerance for shortcuts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/submit-project">
                Submit Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Code2 className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">100%</span>
              </div>
              <p className="text-sm text-muted-foreground">Your Code</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GitBranch className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">0</span>
              </div>
              <p className="text-sm text-muted-foreground">Copy-Paste Allowed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">Real</span>
              </div>
              <p className="text-sm text-muted-foreground">Skills Gained</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
