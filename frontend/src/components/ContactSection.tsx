import { useState } from "react";
import {
  Mail,
  MessageSquare,
  Send,
  Github,
  Twitter,
  Linkedin,
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
  User,
  AtSign,
  FileText,
  ChevronDown,
  ChevronUp,
  Terminal,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

/* ─── Static data ────────────────────────────────────────────── */

const CONTACT_CARDS = [
  {
    icon: Mail,
    label: "Email Us",
    value: "hello@codeorbit.dev",
    sub: "We reply within 24 hours",
    href: "mailto:hello@codeorbit.dev",
    color: "primary",
  },
  {
    icon: MessageSquare,
    label: "Live Chat",
    value: "Open in the IDE",
    sub: "Available inside the platform",
    href: "/ide",
    color: "accent",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "Remote · India",
    sub: "Serving students globally",
    href: null,
    color: "success",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Mon – Fri, 9 AM – 7 PM IST",
    sub: "Emergency queries: 24 / 7 email",
    href: null,
    color: "warning",
  },
];

const SOCIAL_LINKS = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const SUBJECTS = [
  "General Enquiry",
  "Student Support",
  "Mentor / Instructor Application",
  "Billing & Refunds",
  "Technical Issue",
  "Partnership",
  "Press & Media",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does it take to get a response?",
    a: "All emails receive an initial response within 24 business hours. Technical & billing queries are usually resolved within 48 hours.",
  },
  {
    q: "I want to become a mentor. Who do I contact?",
    a: "Select 'Mentor / Instructor Application' in the subject dropdown. Attach your GitHub profile or portfolio link in the message. We review applications weekly.",
  },
  {
    q: "Can I get a refund if I'm rejected during intake?",
    a: "Yes — if your project submission is rejected during our intake assessment, you receive a full refund minus a ₹299 assessment fee.",
  },
  {
    q: "I'm a college or institution. Do you offer bulk plans?",
    a: "Yes, we have institutional partnerships. Choose 'Partnership' as the subject and describe your institution size and requirements.",
  },
];

/* ─── Sub-components ─────────────────────────────────────────── */

const colorMap: Record<string, string> = {
  primary: "bg-primary/10 border-primary/20 text-primary",
  accent:  "bg-accent/10  border-accent/20  text-accent",
  success: "bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]",
  warning: "bg-[hsl(var(--warning)/0.1)] border-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]",
};

function ContactCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
  color,
}: (typeof CONTACT_CARDS)[number]) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      {...(href ? { href, target: href.startsWith("http") ? "_blank" : undefined } : {})}
      className={`group flex items-start gap-4 p-5 rounded-xl border bg-card/50 transition-all duration-300 hover:bg-card hover:scale-[1.02] hover:shadow-lg ${href ? "cursor-pointer" : ""}`}
    >
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${colorMap[color]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-mono text-muted-foreground mb-0.5">{label}</p>
        <p className="font-semibold text-sm">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </Wrapper>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-card/60 transition-colors"
      >
        <span className="font-medium text-sm">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-primary flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground border-t border-border bg-card/30 pt-3 animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

type FormState = "idle" | "loading" | "success";

const ContactSection = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({
        title: "Missing fields",
        description: "Please fill in your name, email, and message.",
        variant: "destructive",
      });
      return;
    }

    setFormState("loading");

    // Simulate network delay (replace with real API call when ready)
    await new Promise((res) => setTimeout(res, 1800));

    setFormState("success");
    toast({
      title: "Message sent! 🚀",
      description: "We'll get back to you within 24 hours.",
    });
  };

  const handleReset = () => {
    setFormState("idle");
    setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* ── Section Header ── */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-sm font-mono text-primary mb-4">
            <Terminal className="w-4 h-4" />
            CONTACT
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Questions about the platform, mentorship, billing, or a partnership?
            We read every message.
          </p>
        </div>

        {/* ── Contact Info Cards ── */}
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {CONTACT_CARDS.map((card) => (
            <ContactCard key={card.label} {...card} />
          ))}
        </div>

        {/* ── Two-column: Form + FAQ ── */}
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10">
          {/* ── Contact Form ── */}
          <div className="rounded-2xl border border-border bg-card/50 p-8 relative overflow-hidden">
            {/* Glow accent in top-left */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-1">Send a Message</h2>
              <p className="text-sm text-muted-foreground mb-6">
                All fields marked <span className="text-primary">*</span> are required.
              </p>

              {formState === "success" ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.3)] flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[hsl(var(--success))]" />
                  </div>
                  <h3 className="text-xl font-bold">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Thanks for reaching out, <strong>{form.name}</strong>. We'll reply to{" "}
                    <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <Button variant="outline" onClick={handleReset} className="mt-2">
                    Send Another
                  </Button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Full Name <span className="text-primary">*</span>
                    </label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder="Rohit Sharma"
                      value={form.name}
                      onChange={handleChange}
                      disabled={formState === "loading"}
                      className="bg-secondary/50 border-border focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5" /> Email Address <span className="text-primary">*</span>
                    </label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="rohit@example.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={formState === "loading"}
                      className="bg-secondary/50 border-border focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Subject
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      disabled={formState === "loading"}
                      className="w-full h-10 px-3 rounded-md border border-border bg-secondary/50 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Message <span className="text-primary">*</span>
                    </label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      placeholder="Tell us what's on your mind..."
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      disabled={formState === "loading"}
                      className="bg-secondary/50 border-border focus:border-primary/50 transition-colors resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {form.message.length} / 1000
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full group"
                    disabled={formState === "loading"}
                  >
                    {formState === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* ── Right Column: Social + FAQ ── */}
          <div className="flex flex-col gap-8">
            {/* Social links */}
            <div className="rounded-2xl border border-border bg-card/50 p-6">
              <h3 className="font-bold mb-1">Follow the Orbit</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Stay updated with platform news, learning tips, and new mentor slots.
              </p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Direct email CTA */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1">Prefer direct email?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For urgent queries or official communications, write directly to our inbox.
                </p>
                <a
                  href="mailto:hello@codeorbit.dev"
                  className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  hello@codeorbit.dev
                </a>
              </div>
            </div>

            {/* FAQ accordion */}
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="text-xs font-mono text-primary border border-primary/30 bg-primary/5 px-2 py-0.5 rounded">
                  FAQ
                </span>
                Common Questions
              </h3>
              <div className="space-y-2">
                {FAQS.map((faq) => (
                  <FaqItem key={faq.q} {...faq} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
