import { Button } from "@/components/ui/button";
import { MountainSnow, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  const navigate = useNavigate();

  const handleLogOff = () => {
    sessionStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/dashboard" className="mr-6 flex items-center space-x-2">
          <MountainSnow className="h-6 w-6" />
          <span className="font-bold">Trailstack</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" onClick={handleLogOff}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Off
          </Button>
        </div>
      </div>
    </header>
  );