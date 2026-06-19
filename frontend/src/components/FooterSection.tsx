import { Terminal, Github, Twitter, Linkedin, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { SectionId } from "@/pages/Index";

interface FooterSectionProps {
  onNavigate: (id: SectionId) => void;
}

const FooterSection = ({ onNavigate }: FooterSectionProps) => {
  return (
    <footer className="py-16 border-t border-border bg-card/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-3 mb-4 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <span className="font-bold text-lg font-heading block">CodeOrbit</span>
                <span className="text-xs text-muted-foreground font-mono">
                  stay in orbit. master the code.
                </span>
              </div>
            </button>
            <p className="text-muted-foreground mb-6 max-w-md">
              A guided co-building platform that keeps you on track while you build real projects.
              No shortcuts, no outsourcing — just real skills and Orbit AI by your side.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Github, href: "https://github.com/DevataTheGod", label: "GitHub" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Mail, href: "mailto:2k24.cs1l.2410719@gmail.com", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform nav links */}
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(
                [
                  { id: "how-it-works", label: "How It Works" },
                  { id: "enforcement", label: "Enforcement" },
                  { id: "case-study", label: "Case Study" },
                  { id: "pricing", label: "Pricing" },
                  { id: "contact", label: "Contact Us" },
                ] as { id: SectionId; label: string }[]
              ).map(({ id, label }) => (
                <li key={id}>
                  <button
                    onClick={() => onNavigate(id)}
                    className="hover:text-foreground transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/ide" className="hover:text-foreground transition-colors">
                  The IDE
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Documentation", "FAQ", "Mentor Guidelines", "Anti-Cheat Policy", "Refund Policy"].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* CTA banner */}
        <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-lg">Ready to stop outsourcing and start building?</h4>
              <p className="text-muted-foreground">Submit your project idea today. We reject 60% of applicants.</p>
            </div>
            <Button variant="hero" className="group" asChild>
              <Link to="/submit-project">
                Submit Project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border text-sm text-muted-foreground">
          <p>© 2025 CodeOrbit. Stay in orbit. Master the code.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
              <a key={item} href="#" className="hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
