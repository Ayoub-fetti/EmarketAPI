import { NavLink } from "react-router-dom";

const navLinks = [
  { to: "/admin/stats", label: "Statistics" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-900">Navigation</span>
      </div>
      <nav className="flex flex-col p-4 gap-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              [
                "rounded-md px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100",
              ].join(" ")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

