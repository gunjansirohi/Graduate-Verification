import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const RegistrarLogin = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'nationalId'
  const [formData, setFormData] = useState({
    email: "",
    nationalIdNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const authurl = import.meta.env.VITE_AUTH_ROUTE;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    if (
      (loginMethod === "email" && !formData.email) ||
      (loginMethod === "nationalId" && !formData.nationalIdNumber) ||
      !formData.password
    ) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        password: formData.password,
      };

      // Use the correct property name based on login method
      if (loginMethod === "email") {
        payload.email = formData.email;
      } else {
        payload.nationalIdNumber = formData.nationalIdNumber;
      }
      const { data } = await axios.post(`${authurl}/login`, payload);
      localStorage.setItem("registrarToken", data.token);

      console.log(data);

      if (data.success) {
        navigate("/registrar");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Registrar Login Page
        </h2>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}
        <>
          {/* Login Method Toggle */}
          <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-2 font-medium ${
                loginMethod === "email"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setLoginMethod("email")}
            >
              Email
            </button>
            <button
              className={`flex-1 py-2 font-medium ${
                loginMethod === "nationalId"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setLoginMethod("nationalId")}
            >
              National ID
            </button>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            {loginMethod === "email" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  National ID Number
                </label>
                <input
                  type="text"
                  name="nationalIdNumber"
                  placeholder="Enter 16-digit National ID"
                  value={formData.nationalIdNumber}
                  onChange={handleInputChange}
                  maxLength={16}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </>
        )}
      </div>
    </div>
  );
};

export default RegistrarLogin;
