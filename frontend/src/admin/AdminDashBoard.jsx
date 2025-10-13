import axios from "axios";
import { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { FiMoon, FiSun, FiChevronDown, FiChevronUp, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);


const userAuthUrl= import.meta.env.VITE_AUTH_ROUTE
const AdminDashBoard = () => {
  const api = import.meta.env.VITE_ADMIN_ROUTE;
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collegeCount, setCollegeCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [collegeData, setCollegeData] = useState({});
  const [departmentData, setDepartmentData] = useState({});
  const [toggledCard, setToggledCard] = useState(null);
  const [expandedCollege, setExpandedCollege] = useState(null);
  const [expandedDepartment, setExpandedDepartment] = useState(null);

  // Theme state management
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("darkMode") === "true" ||
      (!("darkMode" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  // Toggle theme
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  // Apply theme class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`${api}/certificates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCertificates(response.data);

        if (response.data?.length > 0) {
          const colleges = [
            ...new Set(response.data.map((cert) => cert.college)),
          ];
          setCollegeCount(colleges.length);

          const departments = [
            ...new Set(response.data.map((cert) => cert.department)),
          ];
          setDepartmentCount(departments.length);

          const collegeCounts = response.data.reduce((acc, cert) => {
            acc[cert.college] = (acc[cert.college] || 0) + 1;
            return acc;
          }, {});
          setCollegeData(collegeCounts);

          const departmentCounts = response.data.reduce((acc, cert) => {
            acc[cert.department] = (acc[cert.department] || 0) + 1;
            return acc;
          }, {});
          setDepartmentData(departmentCounts);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching certificates:", err);
        setError("Failed to fetch certificates. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, [api]);

  // Chart data preparation with theme-aware colors
  const getChartColors = () => {
    return darkMode
      ? {
          textColor: "#E5E7EB",
          gridColor: "rgba(255, 255, 255, 0.1)",
          background: "#1F2937",
          cardBg: "#111827",
          borderColor: "#4B5563",
          tooltipBg: "#374151",
          tooltipBorder: "#4B5563",
        }
      : {
          textColor: "#374151",
          gridColor: "rgba(0, 0, 0, 0.05)",
          background: "#FFFFFF",
          cardBg: "#F9FAFB",
          borderColor: "#E5E7EB",
          tooltipBg: "#FFFFFF",
          tooltipBorder: "#E5E7EB",
        };
  };

  const colors = getChartColors();
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: colors.textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.textColor,
        bodyColor: colors.textColor,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        mode: "index",
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: colors.gridColor,
          drawBorder: false,
        },
        ticks: {
          color: colors.textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: colors.gridColor,
          drawBorder: false,
        },
        ticks: {
          color: colors.textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          padding: 10,
        },
        beginAtZero: true,
      },
    },
  };

  const collegeChartData = {
    labels: Object.keys(collegeData),
    datasets: [
      {
        label: "Certificates by College",
        data: Object.values(collegeData),
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)",
          "rgba(220, 38, 38, 0.7)",
          "rgba(5, 150, 105, 0.7)",
          "rgba(234, 88, 12, 0.7)",
          "rgba(217, 70, 239, 0.7)",
          "rgba(6, 182, 212, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(20, 184, 166, 0.7)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(220, 38, 38, 1)",
          "rgba(5, 150, 105, 1)",
          "rgba(234, 88, 12, 1)",
          "rgba(217, 70, 239, 1)",
          "rgba(6, 182, 212, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(20, 184, 166, 1)",
        ],
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: [
          "rgba(99, 102, 241, 0.9)",
          "rgba(220, 38, 38, 0.9)",
          "rgba(5, 150, 105, 0.9)",
          "rgba(234, 88, 12, 0.9)",
          "rgba(217, 70, 239, 0.9)",
          "rgba(6, 182, 212, 0.9)",
          "rgba(139, 92, 246, 0.9)",
          "rgba(20, 184, 166, 0.9)",
        ],
      },
    ],
  };

  const departmentChartData = {
    labels: Object.keys(departmentData),
    datasets: [
      {
        label: "Certificates by Department",
        data: Object.values(departmentData),
        backgroundColor: [
          "rgba(6, 182, 212, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(20, 184, 166, 0.7)",
          "rgba(234, 88, 12, 0.7)",
          "rgba(217, 70, 239, 0.7)",
          "rgba(99, 102, 241, 0.7)",
          "rgba(220, 38, 38, 0.7)",
          "rgba(5, 150, 105, 0.7)",
        ],
        borderColor: [
          "rgba(6, 182, 212, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(20, 184, 166, 1)",
          "rgba(234, 88, 12, 1)",
          "rgba(217, 70, 239, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(220, 38, 38, 1)",
          "rgba(5, 150, 105, 1)",
        ],
        borderWidth: 1,
        hoverOffset: 12,
      },
    ],
  };

  const yearlyData = {
    labels: ["2020", "2021", "2022", "2023", "2024"],
    datasets: [
      {
        label: "Certificates per Year",
        data: [
          certificates.filter(
            (cert) => new Date(cert.endDate).getFullYear() === 2020
          ).length,
          certificates.filter(
            (cert) => new Date(cert.endDate).getFullYear() === 2021
          ).length,
          certificates.filter(
            (cert) => new Date(cert.endDate).getFullYear() === 2022
          ).length,
          certificates.filter(
            (cert) => new Date(cert.endDate).getFullYear() === 2023
          ).length,
          certificates.filter(
            (cert) => new Date(cert.endDate).getFullYear() === 2024
          ).length,
        ],
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointRadius: 4,
        pointHitRadius: 10,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="max-w-md p-6 rounded-lg shadow-lg bg-red-50 dark:bg-red-900/20 text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Data</h2>
          <p className="text-red-500 dark:text-red-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <>
                <FiSun className="w-5 h-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <FiMoon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </header>

        {/* Summary Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Certificates",
              value: certificates.length,
              color: "indigo",
              key: "certificates",
              link: "/admin/view-graduates",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )
            },
            {
              title: "Colleges",
              value: collegeCount,
              color: "red",
              key: "colleges",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )
            },
            {
              title: "Departments",
              value: departmentCount,
              color: "emerald",
              key: "departments",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )
            },
            {
              title: "This Year",
              value: certificates.filter(
                (cert) =>
                  new Date(cert.endDate).getFullYear() ===
                  new Date().getFullYear()
              ).length,
              color: "orange",
              key: "thisYear",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )
            },
          ].map((card) => {
            const colorClasses = {
              indigo: {
                bg: "bg-indigo-50 dark:bg-indigo-900/20",
                text: "text-indigo-600 dark:text-indigo-300",
                hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900/30",
              },
              red: {
                bg: "bg-red-50 dark:bg-red-900/20",
                text: "text-red-600 dark:text-red-300",
                hover: "hover:bg-red-100 dark:hover:bg-red-900/30",
              },
              emerald: {
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                text: "text-emerald-600 dark:text-emerald-300",
                hover: "hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
              },
              orange: {
                bg: "bg-orange-50 dark:bg-orange-900/20",
                text: "text-orange-600 dark:text-orange-300",
                hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30",
              },
            };

            const CardContent = (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
                className={`p-5 rounded-xl shadow-sm transition-all duration-300 cursor-pointer h-full flex flex-col ${
                  colorClasses[card.color].bg
                } ${!card.link ? colorClasses[card.color].hover : ""} ${
                  toggledCard === card.key ? "ring-2 ring-offset-2 " + 
                  (darkMode 
                    ? `ring-${card.color}-400` 
                    : `ring-${card.color}-500`) : ""
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-sm font-medium uppercase tracking-wider ${colorClasses[card.color].text}`}>
                    {card.title}
                  </h3>
                  <div className={`p-2 rounded-lg ${colorClasses[card.color].text}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="mt-auto">
                  <p className={`text-3xl font-bold ${colorClasses[card.color].text}`}>
                    {card.value.toLocaleString()}
                  </p>
                  {card.link && (
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>View all</span>
                      <FiExternalLink className="ml-1 w-4 h-4" />
                    </div>
                  )}
                </div>
              </motion.div>
            );

            if (card.link) {
              return (
                <Link to={card.link} key={card.key} className="h-full">
                  {CardContent}
                </Link>
              );
            }

            return (
              <div
                key={card.key}
                onClick={() =>
                  setToggledCard(toggledCard === card.key ? null : card.key)
                }
                className="h-full"
              >
                {CardContent}
              </div>
            );
          })}
        </section>

        {/* Toggled Lists Section */}
        <AnimatePresence>
          {toggledCard === "colleges" && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-8 rounded-xl shadow-lg overflow-hidden border transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg flex items-center">
                    <span className="inline-block w-2 h-6 bg-red-500 rounded-sm mr-3"></span>
                    Colleges List
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {collegeCount} colleges
                  </span>
                </div>
                
                <div className="space-y-3">
                  {[...new Set(certificates.map((cert) => cert.college))]
                    .sort()
                    .map((college, idx) => {
                      const isCollegeOpen = expandedCollege === college;
                      const departments = [
                        ...new Set(
                          certificates
                            .filter((cert) => cert.college === college)
                            .map((cert) => cert.department)
                        ),
                      ].sort();
                      
                      return (
                        <div 
                          key={college} 
                          className={`rounded-lg overflow-hidden transition-all ${
                            darkMode 
                              ? "bg-gray-700/50" 
                              : "bg-gray-50"
                          }`}
                        >
                          <button
                            className="w-full flex justify-between items-center px-4 py-3 font-medium text-left transition-colors hover:bg-red-50/50 dark:hover:bg-gray-700"
                            onClick={() =>
                              setExpandedCollege(isCollegeOpen ? null : college)
                            }
                          >
                            <div className="flex items-center">
                              <span className={`text-red-500 dark:text-red-400 mr-3 font-semibold`}>
                                {idx + 1}.
                              </span>
                              <span>{college}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">
                                {departments.length} department{departments.length !== 1 ? "s" : ""}
                              </span>
                              {isCollegeOpen ? (
                                <FiChevronUp className="text-gray-500 dark:text-gray-400" />
                              ) : (
                                <FiChevronDown className="text-gray-500 dark:text-gray-400" />
                              )}
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {isCollegeOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`px-4 ${
                                  darkMode 
                                    ? "bg-gray-800/30" 
                                    : "bg-white"
                                }`}
                              >
                                {departments.length === 0 ? (
                                  <div className="py-3 text-center text-gray-500 dark:text-gray-400 italic">
                                    No departments found
                                  </div>
                                ) : (
                                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {departments.map((dept) => {
                                      const isDeptOpen = expandedDepartment === `${college}-${dept}`;
                                      const certs = certificates.filter(
                                        (cert) =>
                                          cert.college === college &&
                                          cert.department === dept
                                      );
                                      
                                      return (
                                        <li key={dept} className="py-3">
                                          <button
                                            className="w-full flex justify-between items-center text-left"
                                            onClick={() =>
                                              setExpandedDepartment(
                                                isDeptOpen ? null : `${college}-${dept}`
                                              )
                                            }
                                          >
                                            <div className="flex items-center">
                                              <span className="text-emerald-500 dark:text-emerald-400 mr-3">•</span>
                                              <span>{dept}</span>
                                            </div>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">
                                                {certs.length} certificate{certs.length !== 1 ? "s" : ""}
                                              </span>
                                              {isDeptOpen ? (
                                                <FiChevronUp className="text-gray-500 dark:text-gray-400" />
                                              ) : (
                                                <FiChevronDown className="text-gray-500 dark:text-gray-400" />
                                              )}
                                            </div>
                                          </button>
                                          
                                          <AnimatePresence>
                                            {isDeptOpen && (
                                              <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="ml-8 mt-2"
                                              >
                                                {certs.length === 0 ? (
                                                  <div className="text-gray-400 italic text-sm py-2">
                                                    No certificates found
                                                  </div>
                                                ) : (
                                                  <ul className="space-y-2">
                                                    {certs.map((cert, i) => (
                                                      <li
                                                        key={cert._id || i}
                                                        className="flex items-center text-sm py-1"
                                                      >
                                                        <span className="mr-2 text-indigo-500">-</span>
                                                        <span>
                                                          {cert.firstName} {cert.middleName} {cert.lastName}{" "}
                                                          <span className="text-xs text-gray-400">
                                                            ({new Date(cert.endDate).toLocaleDateString()})
                                                          </span>
                                                        </span>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                )}
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toggledCard === "departments" && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-8 rounded-xl shadow-lg overflow-hidden border transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg flex items-center">
                    <span className="inline-block w-2 h-6 bg-emerald-500 rounded-sm mr-3"></span>
                    Departments List
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {departmentCount} departments
                  </span>
                </div>
                
                <div className="space-y-3">
                  {[...new Set(certificates.map((cert) => cert.department))]
                    .sort()
                    .map((dept, idx) => {
                      const isDeptOpen = expandedDepartment === dept;
                      const certs = certificates.filter((cert) => cert.department === dept);
                      
                      return (
                        <div 
                          key={dept} 
                          className={`rounded-lg overflow-hidden transition-all ${
                            darkMode 
                              ? "bg-gray-700/50" 
                              : "bg-gray-50"
                          }`}
                        >
                          <button
                            className="w-full flex justify-between items-center px-4 py-3 font-medium text-left transition-colors hover:bg-emerald-50/50 dark:hover:bg-gray-700"
                            onClick={() =>
                              setExpandedDepartment(isDeptOpen ? null : dept)
                            }
                          >
                            <div className="flex items-center">
                              <span className={`text-emerald-500 dark:text-emerald-400 mr-3 font-semibold`}>
                                {idx + 1}.
                              </span>
                              <span>{dept}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">
                                {certs.length} certificate{certs.length !== 1 ? "s" : ""}
                              </span>
                              {isDeptOpen ? (
                                <FiChevronUp className="text-gray-500 dark:text-gray-400" />
                              ) : (
                                <FiChevronDown className="text-gray-500 dark:text-gray-400" />
                              )}
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {isDeptOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`px-4 ${
                                  darkMode 
                                    ? "bg-gray-800/30" 
                                    : "bg-white"
                                }`}
                              >
                                {certs.length === 0 ? (
                                  <div className="py-3 text-center text-gray-500 dark:text-gray-400 italic">
                                    No certificates found
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                      <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Name
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            College
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            End Date
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Created At
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {certs.map((cert, i) => (
                                          <tr
                                            key={cert._id || i}
                                            className={`${
                                              i % 2 === 0
                                                ? darkMode
                                                  ? "bg-gray-800/20"
                                                  : "bg-gray-50"
                                                : ""
                                            } hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                                          >
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                              {cert.firstName} {cert.middleName} {cert.lastName}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                              {cert.college}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                              {new Date(cert.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                              {new Date(cert.createdAt).toLocaleDateString()}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toggledCard === "thisYear" && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-8 rounded-xl shadow-lg overflow-hidden border transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg flex items-center">
                    <span className="inline-block w-2 h-6 bg-orange-500 rounded-sm mr-3"></span>
                    Certificates Issued This Year ({new Date().getFullYear()})
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {certificates.filter(
                      (cert) =>
                        new Date(cert.endDate).getFullYear() ===
                        new Date().getFullYear()
                    ).length} certificates
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          College
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Department
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          End Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {certificates
                        .filter(
                          (cert) =>
                            new Date(cert.endDate).getFullYear() ===
                            new Date().getFullYear()
                        )
                        .map((cert, idx) => (
                          <tr
                            key={idx}
                            className={`${
                              idx % 2 === 0
                                ? darkMode
                                  ? "bg-gray-800/20"
                                  : "bg-gray-50"
                                : ""
                            } hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              {cert.firstName} {cert.middleName} {cert.lastName}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {cert.college}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {cert.department}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(cert.endDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* College Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl shadow-md transition-colors duration-300 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Certificates by College
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(collegeData).length} colleges
              </span>
            </div>
            <div className="h-80">
              <Bar data={collegeChartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Department Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl shadow-md transition-colors duration-300 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Certificates by Department
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(departmentData).length} departments
              </span>
            </div>
            <div className="h-80">
              <Pie data={departmentChartData} options={chartOptions} />
            </div>
          </motion.div>
        </section>

        {/* Yearly Trend Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-xl shadow-md mb-8 transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Yearly Certificate Trend
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              5 year overview
            </span>
          </div>
          <div className="h-96">
            <Line data={yearlyData} options={chartOptions} />
          </div>
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-xl shadow-md transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Recent Certificates
            </h3>
            <Link 
              to="/admin/view-graduates" 
              className="text-sm flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all <FiExternalLink className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {certificates
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((cert, index) => (
                    <tr 
                      key={index}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        index % 2 === 0
                          ? darkMode
                            ? "bg-gray-800/20"
                            : "bg-gray-50"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {cert.firstName} {cert.middleName} {cert.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {cert.college}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {cert.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(cert.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AdminDashBoard;