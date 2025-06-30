import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MountainSnow } from "lucide-react";
import { showError } from "@/utils/toast";

const ACCESS_CODE = "123456";

const LoginPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (sessionStorage.getItem("isAuthenticated")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = () => {
    setIsSubmitting(true);
    if (code === ACCESS_CODE) {
      sessionStorage.setItem("isAuthenticated", "true");
      navigate("/dashboard");
    } else {
      showError("Invalid access code. Please try again.");
      setIsSubmitting(false);
    }
  };

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
              Please enter the access code to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="access-code">Access Code</Label>
              <Input
                id="access-code"
                type="password"
                placeholder="******"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Enter"}
            </Button>
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