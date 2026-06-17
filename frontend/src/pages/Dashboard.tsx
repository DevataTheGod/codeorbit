import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checkingRole, setCheckingRole] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If still loading auth state, wait
    if (authLoading) {
      return;
    }

    // If not loading and no user, redirect to auth
    if (!user) {
      navigate("/auth");
      return;
    }

    // If user exists and not already checking role, check their role
    if (user && checkingRole) {
      checkUserRole();
    }
  }, [user, authLoading, navigate, checkingRole]);

  const checkUserRole = async () => {
    if (!user) return;

    try {
      console.log("Checking role for user:", user.id);
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Supabase error fetching role:", error);
        throw error;
      }

      console.log("User roles data:", data);

      // Check user's role and redirect accordingly
      const isAdmin = data?.some((r) => r.role === "admin");
      const isMentor = data?.some((r) => r.role === "mentor");

      if (isAdmin) {
        console.log("User is admin, redirecting to /admin");
        navigate("/admin", { replace: true });
      } else if (isMentor) {
        console.log("User is mentor, redirecting to /mentor");
        navigate("/mentor", { replace: true });
      } else {
        // Default to student - either user has student role or no role
        console.log("User is student (or no role), redirecting to /student");
        navigate("/student", { replace: true });
      }
    } catch (err) {
      console.error("Error checking role:", err);
      setError(err instanceof Error ? err.message : "Failed to check user role");
      // Default to student dashboard on error
      navigate("/student", { replace: true });
    } finally {
      setCheckingRole(false);
    }
  };

  // Show loading while checking auth or role
  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state (though we redirect, this is a fallback)
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/student", { replace: true })}>
            Go to Student Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
