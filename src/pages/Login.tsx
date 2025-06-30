import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MountainSnow } from "lucide-react";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      navigate("/dashboard");
    }
  }, [session, loading, navigate]);

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="absolute top-0 left-0 right-0 p-4">
        <Button asChild variant="outline">
          <Link to="/">
            &larr; Back to Home
          </Link>
        </Button>
      </header>
      <main className="flex-grow flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <MountainSnow className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Welcome to Trailstack
            </CardTitle>
            <CardDescription>
              Sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
              theme="light"
            />
          </CardContent>
        </Card>
      </main>
      <footer className="p-4 bg-muted/40">
        {/* "Made with Dyad" removed */}
      </footer>
    </div>
  );
};

export default LoginPage;