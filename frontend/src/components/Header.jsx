import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Menu, X } from "lucide-react";
import Button from "./Button";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setShowSearch(false);
      setSearchValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative bg-white text-black px-4 py-3 shadow-md">
      <nav className="flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 text-xl font-bold">
          FastShop
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: "#D43601" }}
          ></span>
        </Link>

        {/* Center Search Input */}
        {showSearch && (
          <form onSubmit={handleSearch} className="absolute left-1/2 transform -translate-x-1/2 w-1/2 max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
              autoFocus
            />
          </form>
        )}

        <div className="flex items-center gap-4 relative" ref={menuRef}>
          {/* Search icon */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:text-[#D43601] transition"
          >
            <Search size={22} />
          </button>

          {/* Cart icon */}
          <button
           className="p-2 hover:text-[#D43601] transition"
          >
            <i class="fa-solid fa-cart-shopping"></i>
          </button>

          {/* Burger icon */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:text-[#D43601] transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Dropdown panel */}
          {menuOpen && (
            <div className="absolute top-12 right-0 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-4 flex flex-col items-start space-y-2 z-50 animate-fadeIn">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                Products
              </Link>
              {isAuthenticated() ? (
                <>
                  <span className="px-4 text-sm text-gray-600">
                    Welcome, {user.fullname}
                  </span>
                  <div className="px-4">
                    <Button variant="danger" size="sm" onClick={handleLogout}>
                      <i class="fa-solid fa-right-from-bracket mr-1"></i>
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2 w-full text-left hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2 w-full text-left hover:bg-gray-100"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
