import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ("admin" | "mentor" | "student")[];
}

export const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user && role && !allowedRoles.includes(role)) {
      toast({
        title: "Access Denied",
        description: `You do not have the required permissions to access this page. Required role: ${allowedRoles.join(" or ")}.`,
        variant: "destructive",
      });
    }
  }, [loading, user, role, allowedRoles, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm font-medium">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    // Redirect to the dispatcher dashboard which will send them to their correct role page
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
