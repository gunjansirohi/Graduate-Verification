import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSun, FiMoon, FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaMapMarkerAlt,
  FaQuoteLeft,
} from "react-icons/fa";
import FAQSection from "../user/FAQSection";

const LandingPage = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Auto-scrolling testimonials
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonials = [
    {
      id: 1,
      company: "Ethio Telecom",
      logo: "/ethio-telecom-logo.png",
      quote:
        "GLA University's verification system saved us 60% time in employee credential checks.",
    },
    {
      id: 2,
      company: "Commercial Bank of Ethiopia",
      logo: "/cbe-logo.png",
      quote:
        "Highly reliable for document authentication. A game-changer for HR processes.",
    },
    {
      id: 3,
      company: "Awash Bank",
      logo: "/awash-bank-logo.png",
      quote:
        "Integrating this system streamlined our graduate recruitment verification.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm py-3 px-4 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
            aria-label="GLA University Home"
          >
            <img
              src="/bonga-university-logo.png"
              alt="GLA University Logo"
              className="h-12 w-auto"
              width={48}
              height={48}
            />
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              <span className="block text-sm font-medium text-blue-600 dark:text-blue-400">
                GLA University
              </span>
              <span>Graduate Verification</span>
            </span>
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link
              to="/"
              className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors relative group"
            >
              Home
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-4/5 transition-all duration-300"></span>
            </Link>
            <Link
              to="/login"
              className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors relative group"
            >
              Verify
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-4/5 transition-all duration-300"></span>
            </Link>
            <Link
              to="/"
              className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors relative group"
            >
              About
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-4/5 transition-all duration-300"></span>
            </Link>
            <Link
              to="/login"
              className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors relative group"
            >
              Live Chat
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-4/5 transition-all duration-300"></span>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <div className="relative group">
              <button
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
                aria-haspopup="true"
                aria-expanded={mobileMenuOpen ? "true" : "false"}
              >
                <span>Login As</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-100 dark:border-gray-700 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-right transform scale-95 group-hover:scale-100">
                <div className="py-1">
                  <Link
                    to="/login"
                    className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>External User</span>
                    </div>
                  </Link>
                  <Link
                    to="/registrar/login"
                    className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span>Registrar</span>
                    </div>
                  </Link>
                  <Link
                    to="/admin/login"
                    className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Admin</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden bg-white dark:bg-gray-900 shadow-lg ${
            mobileMenuOpen ? "block" : "hidden"
          } transition-all duration-300 ease-in-out`}
        >
          <div className="px-4 pt-2 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-700">
            <Link
              to="/"
              className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/login"
              className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Verify
            </Link>
            <Link
              to="/about"
              className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Login Options
              </h3>
              <Link
                to="/login"
                className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                External User
              </Link>
              <Link
                to="/registrar/login"
                className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Registrar
              </Link>
              <Link
                to="/admin/login"
                className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">{children}</main>

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70 z-10"></div>
        <img
          // src="/graduation-ceremony.jpg"
          // src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          src="https://tse4.mm.bing.net/th/id/OIP.aLswZmEX0loOGgNOkAyCNAHaEJ?cb=thfc1&pid=ImgDet&w=208&h=116&c=7&dpr=1.5&o=7&rm=3"
          alt="Graduation Ceremony"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 px-4 text-white max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Verify Graduate Credentials Instantly
          </h1>
          <p className="text-xl mb-8">
            GLA University's secure digital platform for authenticating
            academic documents. Trusted by employers nationwide.
          </p>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center"
          >
            Verify Now <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* System Description */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            How Our System Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 - Login/Signup */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Login/Signup
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create an account or login to access the verification system.
              </p>
              <div className="mt-4 flex justify-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 px-4 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            {/* Step 2 - Submit Document */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Submit Document
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enter the graduate's details to initiate verification.
              </p>
            </div>

            {/* Step 3 - Instant Verification */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Instant Verification
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our system cross-checks with GLA University's secure database.
              </p>
            </div>

            {/* Step 4 - Get Results */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Get Results
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive a digitally signed report within seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-gray-700">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Who's Happy With Our System
          </h2>
          <div className="relative h-64 overflow-hidden">
            <div
              className="flex transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="min-w-full px-4">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                    <FaQuoteLeft className="text-blue-600 text-3xl mb-4" />
                    <p className="text-gray-700 dark:text-gray-300 text-lg italic">
                      {testimonial.quote}
                    </p>
                    <div className="flex items-center mt-6">
                      <img
                        src={testimonial.logo}
                        alt={testimonial.company}
                        className="h-12 mr-4"
                      />
                      <span className="font-bold dark:text-white">
                        {testimonial.company}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <FAQSection />
      {/* Footer */}
<footer className="bg-gray-800 dark:bg-gray-950 text-white py-8 px-6">
  <div className="max-w-7xl mx-auto">
    {/* Map Section - Now at the top */}
    <div className="w-full h-64 md:h-80 lg:h-96 mb-8 rounded-xl overflow-hidden shadow-lg">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.467074564943!2d36.2287733736355!3d7.301304592706398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17aea2c28ab0b28d%3A0xb37eb860542e5c8a!2sGLA%20University!5e0!3m2!1sen!2set!4v1750451066930!5m2!1sen!2set"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="GLA University Location"
        className="w-full h-full"
      ></iframe>
    </div>

    {/* Content Sections Below Map */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-xl font-bold mb-4">GLA University</h3>
        <p className="mb-2">P.O. Box: 334, GLA, Ethiopia</p>
        <p className="mb-2">Email: info@GLAu.edu.et</p>
        <p>Phone: +251 XX XXX XXXX</p>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
        <ul className="space-y-2">
          <li>
            <Link to="/" className="hover:text-blue-400">
              Home
            </Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-blue-400">
              Verify Documents
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-blue-400">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-blue-400">
              Contact
            </Link>
          </li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
        <div className="flex space-x-4 justify-start">
          <a
            href="https://facebook.com/GLAu"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="https://twitter.com/GLAu"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://linkedin.com/school/GLA-university"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>
    </div>

    {/* Copyright Section */}
    <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-gray-700 text-center">
      <p>
        &copy; {new Date().getFullYear()} GLA University. All rights reserved.
      </p>
    </div>
  </div>
</footer>
    </div>
  );
};

export default LandingPage;