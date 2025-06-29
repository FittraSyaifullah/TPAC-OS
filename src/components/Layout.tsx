import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { MadeWithDyad } from "./made-with-dyad";

export const Layout = () => {
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