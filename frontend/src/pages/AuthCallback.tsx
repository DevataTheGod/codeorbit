import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const finishOAuth = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const oauthError = url.searchParams.get("error");
      const oauthErrorDescription = url.searchParams.get("error_description");

      if (oauthError) {
        const details = oauthErrorDescription || oauthError;
        navigate(`/auth?oauth_error=${encodeURIComponent(details)}`, { replace: true });
        return;
      }

      if (code) {
        // PKCE flow: exchange auth code for session.
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          navigate(`/auth?oauth_error=${encodeURIComponent(error.message)}`, { replace: true });
          return;
        }
      } else if (url.hash) {
        // Implicit flow: parse access/refresh tokens from hash.
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }

      // Give auth listener a short window to persist session.
      let session = (await supabase.auth.getSession()).data.session;
      for (let i = 0; i < 6 && !session; i++) {
        await new Promise((r) => setTimeout(r, 250));
        session = (await supabase.auth.getSession()).data.session;
      }

      if (!mounted) return;

      if (session) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/auth?oauth_error=no_session_from_oauth", { replace: true });
      }
    };

    finishOAuth();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Completing sign in...</span>
      </div>
    </div>
  );
};

export default AuthCallback;
