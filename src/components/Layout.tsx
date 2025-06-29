import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { MadeWithDyad } from "./made-with-dyad";
import { useAuth } from "./AuthProvider";
import { useEffect } from "react";

export const Layout = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth");
    }
  }, [session, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="p-4">
        <MadeWithDyad />
      </footer>
    </div>
  );
};