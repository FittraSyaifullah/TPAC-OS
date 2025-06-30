import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MountainSnow, KeyRound } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError } from "@/utils/toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [accessCode, setAccessCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = login(accessCode);
    if (success) {
      navigate("/dashboard");
    } else {
      showError("Invalid access code. Please try again.");
      setAccessCode("");
    }
    setIsSubmitting(false);
  };

  if (loading || isAuthenticated) {
    return null; // Or a loading spinner
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
              Enter your access code to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="access-code"
                    type="password"
                    placeholder="******"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                    className="pl-8"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Enter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LoginPage;