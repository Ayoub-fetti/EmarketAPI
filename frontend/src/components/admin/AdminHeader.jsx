import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaBars, FaSignOutAlt } from "react-icons/fa";

export default function AdminHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
        >
          <FaBars className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            Admin Dashboard
          </h1>
          <p className="hidden sm:block text-xs sm:text-sm text-gray-500">
            Manage users, products, orders, and stats from one place.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
            {user?.fullname || "Admin"}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
