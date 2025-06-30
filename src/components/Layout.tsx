import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { MadeWithDyad } from "./made-with-dyad";
import { useEffect } from "react";

export const Layout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

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