import { Button } from "@/components/ui/button";
import { MountainSnow } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/dashboard" className="mr-6 flex items-center space-x-2">
          <MountainSnow className="h-6 w-6" />
          <span className="font-bold">Trailstack</span>
        </Link>
      </div>
    </header>
  );
};