import { Button } from "@/components/ui/button";
import { MountainSnow, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";
import { Badge } from "./ui/badge";

export const Header = () => {
  const navigate = useNavigate();
  const { logout, userRole } = useAuth();

  const handleLogOff = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <MountainSnow className="h-6 w-6" />
            <span className="font-bold">Trailstack</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
            <Link to="/gear" className="text-muted-foreground transition-colors hover:text-foreground">Gear</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {userRole && <Badge variant="outline">{userRole}</Badge>}
          <ThemeToggle />
          <Button variant="outline" onClick={handleLogOff}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Off
          </Button>
        </div>
      </div>
    </header>
  );
};