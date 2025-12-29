import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 max-w-7xl w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
