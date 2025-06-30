import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MountainSnow,
  Map,
  Package,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Map className="h-8 w-8 text-primary" />,
    title: "Dynamic Itineraries",
    description: "Plan your trip day-by-day with an interactive itinerary builder.",
  },
  {
    icon: <Package className="h-8 w-8 text-primary" />,
    title: "Gear Checklists",
    description: "Create and manage comprehensive gear lists to ensure you never forget a thing.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Participant Management",
    description: "Keep track of all trip participants in one organized place.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Emergency Contacts",
    description: "Store crucial emergency contact information for peace of mind.",
  },
];

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <MountainSnow className="h-6 w-6" />
            <span className="font-bold text-lg">Trailstack</span>
          </Link>
          <Button asChild>
            <Link to="/login">
              Enter App <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              Plan Your Perfect Adventure
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
              Trailstack is the all-in-one platform to organize every detail of
              your outdoor trips, from gear checklists to daily itineraries.
            </p>
            <Button size="lg" asChild>
              <Link to="/login">
                Start Planning
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/40">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Everything You Need to Plan</h2>
              <p className="text-muted-foreground">
                All the tools for a successful adventure.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mb-2">{feature.title}</CardTitle>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-4">
        {/* "Made with Dyad" removed */}
      </footer>
    </div>
  );
};

export default Index;