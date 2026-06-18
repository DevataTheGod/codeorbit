import { Terminal, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { SectionId } from "@/pages/Index";

interface Section {
  id: SectionId;
  label: string;
}

interface HeaderProps {
  activeSection: SectionId;
  sections: Section[];
  onNavigate: (id: SectionId) => void;
}

const Header = ({ activeSection, sections, onNavigate }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (id: SectionId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo — clicking goes home */}
        <button
          onClick={() => handleNav("home")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-lg tracking-tight font-heading">CodeOrbit</span>
            <span className="text-xs text-muted-foreground font-mono">stay in orbit.</span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleNav(section.id)}
                className={`relative px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                }`}
              >
                {section.label}
                {/* Active underline glow indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/submit-project">Start Building</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-1 animate-fade-in">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleNav(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "text-primary font-semibold bg-primary/10 border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {section.label}
              </button>
            );
          })}
          <div className="pt-4 border-t border-border space-y-2">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            </Button>
            <Button variant="hero" size="sm" className="w-full" asChild>
              <Link to="/submit-project" onClick={() => setMobileMenuOpen(false)}>
                Start Building
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
