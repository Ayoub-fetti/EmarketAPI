import { NavLink } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaBox,
  FaTags,
  FaShoppingCart,
  FaTicketAlt,
  FaStar,
} from "react-icons/fa";

const navLinks = [
  { to: "/admin/stats", label: "Statistics", icon: FaChartBar },
  { to: "/admin/users", label: "Users", icon: FaUsers },
  { to: "/admin/products", label: "Products", icon: FaBox },
  { to: "/admin/categories", label: "Categories", icon: FaTags },
  { to: "/admin/orders", label: "Orders", icon: FaShoppingCart },
  { to: "/admin/coupons", label: "Coupons", icon: FaTicketAlt },
  { to: "/admin/reviews", label: "Reviews", icon: FaStar },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <span className="text-lg font-bold text-gray-900">Navigation</span>
      </div>
      <nav className="flex flex-col p-4 gap-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

