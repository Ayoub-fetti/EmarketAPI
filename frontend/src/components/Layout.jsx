import { Outlet } from "react-router-dom";
import Header from "./tools/Header";
import Footer from "./tools/Footer";

export default function Layout() {
  return (
    <div className="min-h-screen fex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
