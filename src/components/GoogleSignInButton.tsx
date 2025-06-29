import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { supabase } from "@/integrations/supabase/client";

export const GoogleSignInButton = ({ isSignUp }: { isSignUp: boolean }) => {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <Button onClick={handleLogin} variant="outline" className="w-full">
      <GoogleIcon className="mr-2 h-5 w-5" />
      Sign {isSignUp ? "up" : "in"} with Google
    </Button>
  );
};