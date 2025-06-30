import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Skeleton } from "./ui/skeleton";

export const Layout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Skeleton className="h-14 w-full" />
        <div className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Avoid rendering children while redirecting
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="p-4">
        {/* "Made with Dyad" removed */}
      </footer>
    </div>
  );
};