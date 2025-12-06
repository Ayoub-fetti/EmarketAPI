import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import {
  MdDashboard,
  MdInventory,
  MdShoppingCart,
  MdLocalOffer,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { FaBox } from "react-icons/fa";

const navLinks = [
  {
    to: "/seller/overview",
    label: "Tableau de Bord",
    icon: MdDashboard,
  },
  {
    to: "/seller/products",
    label: "Mes Produits",
    icon: MdInventory,
  },
  {
    to: "/seller/orders",
    label: "Commandes",
    icon: MdShoppingCart,
  },
  {
    to: "/seller/coupons",
    label: "Coupons",
    icon: MdLocalOffer,
  },
];


export default function Sidebar() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Flottant */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-110"
        style={{ backgroundColor: "rgb(212, 54, 1)" }}
      >
        {isSidebarOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
      </button>

      {/* Overlay - pour fermer le sidebar en cliquant à l'extérieur */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-opacity-10 z-40" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo section */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center"
              style={{ backgroundColor: "rgb(212, 54, 1)" }}
            >
              <FaBox className="text-white text-lg" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 mt-10">E-Market</span>
              <p className="text-xs text-gray-500">Gestion des Products & Commandes</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-4 gap-2 flex-1">
          {/* GENERAL Section */}
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
              GENERAL
            </p>
            <div className="space-y-1">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      [
                        "rounded-md px-4 py-3 text-sm font-medium transition-all flex items-center gap-3",
                        isActive ? "text-white shadow-sm" : "text-gray-700 hover:bg-gray-100",
                      ].join(" ")
                    }
                    style={({ isActive }) =>
                      isActive ? { backgroundColor: "rgb(212, 54, 1)" } : {}
                    }
                    onClick={closeSidebar}
                  >
                    <IconComponent className="text-xl" />
                    {link.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Compte Section */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
              Compte
            </p>
            <div className="space-y-1">
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-all"
              >
                <MdLogout className="text-xl" />
                Déconnexion
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
