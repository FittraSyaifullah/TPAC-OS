import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MountainSnow } from "lucide-react";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useState } from "react";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <MountainSnow className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isSignUp ? "Create an Account" : "Welcome to Trailstack"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Start planning your next adventure."
              : "Sign in to manage your outdoor adventures."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" className="w-full">
            <GoogleIcon className="mr-2 h-5 w-5" />
            Sign {isSignUp ? "up" : "in"} with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button className="w-full">
            {isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" size="sm" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;