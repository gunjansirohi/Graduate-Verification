import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiSettings,
  FiMenu,
  FiX,
  FiUserPlus,
  FiSun,
  FiMoon,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const authURL = import.meta.env.VITE_ADMIN_ROUTE;
const authurl = import.meta.env.VITE_AUTH_ROUTE;
const baseURL = import.meta.env.VITE_BACKEND_URL;

const RegistrarLayout = ({ children }) => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  // Sidebar navigation items
  const navItems = [
    {
      path: "/registrar",
      icon: <FiHome className="w-5 h-5" />,
      label: "Dashboard",
    },
    {
      path: "/registrar/studentRecords",
      icon: <FiUsers className="w-5 h-5" />,
      label: "Graduates",
    },
    {
      path: "/registrar/viewallcertificates",
      icon: <FiFileText className="w-5 h-5" />,
      label: "View Certificates",
    },
    {
      path: "/registrar/addgraduate",
      icon: <FiUserPlus className="w-5 h-5" />,
      label: "Add Graduate",
    },
    {
      path: "/registrar/settings",
      icon: <FiSettings className="w-5 h-5" />,
      label: "Settings",
    },
  ];

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("darkMode") === "true" ||
      (!("darkMode" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && !event.target.closest("#sidebar")) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${authurl}/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("registrarToken")}`,
          },
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
        navigate("/registrar/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  useEffect(() => {
    console.log("Current User:", currentUser); // Add this
    if (currentUser) {
      setPreview(currentUser.photo || "");
      console.log("Photo URL:", currentUser.photo); // Add this
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await axios.get(`${authURL}/logout`, {
        withCredentials: true,
      });
      localStorage.removeItem("registrarToken");
      setCurrentUser(null); // Clear current user state
      S;
      Swal.fire("Success", "🎉 Logout Successful!", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      navigate("/registrar/login");
    } catch (error) {
      Swal.fire("Error", "❌ Logout Failed", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "registrar") {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col justify-center items-center flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              You are not authorized to access this page.
            </h1>
            <Link
              to="/registrar/login"
              className="text-blue-600 hover:underline mt-4"
            >
              Please log in to continue.
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? "dark" : ""}`}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <Link to="/registrar">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  R
                </div>
                <h1 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">
                  Registrar Portal
                </h1>
              </div>
            </Link>
          </div>

          {/* User controls */}
          <div className="flex items-center space-x-4">
            {/* User profile */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
                    {preview ? (
                      <img
                        src={
                          preview.startsWith("blob:") ||
                          preview.startsWith("http")
                            ? preview
                            : `${baseURL}${preview}`
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 dark:text-white font-bold text-lg">
                        {currentUser.firstName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Registrar
                    </p>
                  </div>
                </div>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/registrar/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiSettings className="mr-2" size={16} />
                      Update Profile
                    </Link>
                    <Link
                      to="/registrar/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiSettings className="mr-2" size={16} />
                      Account Settings
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiLogOut className="mr-2" size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </header>





      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside
          id="sidebar"
          className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <div className="h-full flex flex-col">
            {/* Logo/School Name */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Academic Registry
              </h2>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                      ${
                        activePath === item.path
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User Profile */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="relative w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img
                      src={
                        preview.startsWith("blob:") ||
                        preview.startsWith("http")
                          ? preview
                          : `${baseURL}${preview}`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 dark:text-blue-300 font-medium">
                      {currentUser?.firstName?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Registrar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          {/* Page content */}
          <div className="max-w-7xl mx-auto">
            {/* Page header */}

            {/* Content area - passed as children */}
            <div
              className={`pt-16 md:ml-64 transition-all duration-300 ${
                sidebarOpen ? "blur-sm" : ""
              }`}
            >
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 z-100">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} University Registrar System. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RegistrarLayout;
