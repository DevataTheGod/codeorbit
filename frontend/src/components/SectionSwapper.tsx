import { useEffect, useRef, useState, ReactNode } from "react";
import type { SectionId } from "@/pages/Index";

interface SectionSwapperProps {
  activeSection: SectionId;
  direction: "forward" | "backward";
  children: ReactNode;
}

/**
 * SectionSwapper
 *
 * Renders the active landing page section with a horizontal slide transition.
 * - "forward" (left→right order): new section slides in from the RIGHT,
 *   old section exits to the LEFT.
 * - "backward": reverse direction.
 *
 * Uses pure CSS keyframe animations injected via a <style> tag so there's
 * zero dependency on external animation libraries.
 */
const SectionSwapper = ({ activeSection, direction, children }: SectionSwapperProps) => {
  const [displayedSection, setDisplayedSection] = useState<SectionId>(activeSection);
  const [displayedChildren, setDisplayedChildren] = useState<ReactNode>(children);
  const [animating, setAnimating] = useState(false);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeSection === displayedSection) return;

    // Cancel any in-flight animation
    if (timerRef.current) clearTimeout(timerRef.current);

    setAnimating(true);
    setPhase("exit");

    // After exit animation (300ms), swap content and play enter
    timerRef.current = setTimeout(() => {
      setDisplayedSection(activeSection);
      setDisplayedChildren(children);
      setPhase("enter");

      timerRef.current = setTimeout(() => {
        setAnimating(false);
        setPhase("idle");
      }, 350);
    }, 280);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // When the section key changes mid-enter, update children too
  useEffect(() => {
    if (phase === "idle") {
      setDisplayedChildren(children);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const exitClass =
    direction === "forward" ? "section-exit-left" : "section-exit-right";
  const enterClass =
    direction === "forward" ? "section-enter-right" : "section-enter-left";

  return (
    <>
      {/* Inline keyframes — injected once */}
      <style>{`
        @keyframes slideExitLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-60px); }
        }
        @keyframes slideExitRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(60px); }
        }
        @keyframes slideEnterRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideEnterLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .section-exit-left  { animation: slideExitLeft  0.28s cubic-bezier(0.4,0,0.2,1) forwards; }
        .section-exit-right { animation: slideExitRight 0.28s cubic-bezier(0.4,0,0.2,1) forwards; }
        .section-enter-right{ animation: slideEnterRight 0.35s cubic-bezier(0.4,0,0.2,1) forwards; }
        .section-enter-left { animation: slideEnterLeft  0.35s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

      <div
        key={`${displayedSection}-${phase}`}
        className={`will-change-transform ${
          phase === "exit"  ? exitClass  :
          phase === "enter" ? enterClass :
          ""
        }`}
        style={{ minHeight: "calc(100vh - 4rem)" }}
      >
        {displayedChildren}
      </div>
    </>
  );
};

export default SectionSwapper;
