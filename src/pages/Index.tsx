import { Button } from "@/components/ui/button";
import { Mountain } from "lucide-react";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <div className="inline-block p-6 bg-primary/10 rounded-full">
            <Mountain className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Plan. Pack. Conquer.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Your ultimate adventure companion. Organize itineraries, manage
            gear, and collaborate with your team seamlessly.
          </p>
          <Button asChild size="lg">
            <Link to="/dashboard">Get Started</Link>
          </Button>
        </div>
      </main>
      <footer className="p-4">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;