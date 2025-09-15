import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // For redirecting after logout

  // Get user data to check if admin
  let isAdmin = false;
  try {
    const user = JSON.parse(localStorage.getItem("userData"));
    isAdmin = user && user.isAdmin;
  } catch {}

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("userData"); // Clear user data
    // Remove any token if present
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    // Redirect admin to /, user to /
    navigate("/");
  };

  return (
    <motion.nav
      className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-lg z-50"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Decentralized ID
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              to="/features"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Features
            </Link>
            <Link
              to="/education"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Education
            </Link>
            <a
              href="/demo"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Demo
            </a>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Profile
            </Link>

            {/* Logout Button (show only for admin) */}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden flex flex-col space-y-4 pb-4"
          >
            <Link to="/features" className="text-gray-700 hover:text-blue-600">
              Features
            </Link>
            <Link to="/education" className="text-gray-700 hover:text-blue-600">
              Education
            </Link>
            <a href="/demo" className="text-gray-700 hover:text-blue-600">
              Demo
            </a>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
            <Link to="/profile" className="text-gray-700 hover:text-blue-600">
              Profile
            </Link>

            {/* Mobile Logout (show only for admin) */}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
