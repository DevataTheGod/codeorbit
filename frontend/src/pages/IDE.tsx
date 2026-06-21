import IDEWorkspace from "@/components/ide/IDEWorkspace";
import { Helmet } from "react-helmet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Monitor, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const IDE = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <>
        <Helmet>
          <title>CodeOrbit IDE | Desktop Only</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Monitor className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Desktop Required</h1>
            <p className="text-muted-foreground mb-6">
              The CodeOrbit IDE is optimized for desktop browsers. Please open this page on a computer with a larger screen.
            </p>
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>CodeOrbit IDE | Build Your Project</title>
        <meta
          name="description"
          content="The CodeOrbit IDE workspace — write real code with Orbit AI guidance. No shortcuts, just skill transfer."
        />
      </Helmet>
      <IDEWorkspace />
    </>
  );
};

export default IDE;
