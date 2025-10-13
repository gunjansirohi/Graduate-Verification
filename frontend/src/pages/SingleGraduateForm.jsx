import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const collegeDepartmentData = {
  "Engineering and Technology": [
    "Computer Science",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
  ],
  "Business and Economics": [
    "Accounting and Finance",
    "Banking and Finance",
    "Economics",
    "Marketing Management",
    "Management",
    "Public Administration",
    "Hotel and Tourism Management",
  ],
  "Health Science": ["Nursing", "Pharmacy", "Public Health", "Midwifery"],
  "Social Science": [
    "English Language and Literature",
    "History and Heritage management",
    "Geography and Environmental studies",
    "Curriculum and Instruction",
    "Psychology",
    "Special Needs and Inclusive Education",
    "Law",
    "Sociology",
    "Civics and Ethical Studies",
    "Political Science and International Relations",
  ],
  "Natural and Computational Science": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Statistics",
    "Geology",
    "Sports Science",
  ],
  "Agriculture and Natural Resource": [
    "Animal Science",
    "Agro economics",
    "Natural Resource Management",
    "soil and water conservation",
    "Horticulture",
    "Plant Science",
    "Forestry",
    "Veterinary Medicine",
    "Coffee Science and Technology",
  ],
};

const initialStudentState = {
  certificateID: "",
  firstName: "",
  middleName: "",
  lastName: "",
  cgpa: "",
  gender: "",
  department: "",
  college: "",
  program: "",
  programType: "",
  gstatus: "",
  startDate: "",
  endDate: "",
};

const authURL = import.meta.env.VITE_ADMIN_ROUTE
const national_ID_URL = import.meta.env.VITE_NATIONAL_ID_ROUTE;
const AddStudentCredentials = () => {
  const [student, setStudent] = useState(initialStudentState);
  const [currentError, setCurrentError] = useState("All fields marked with * are required");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const certificateIdRef = useRef(null);
  const navigate = useNavigate();

  // Auto-focus first input on mount
  useEffect(() => {
    certificateIdRef.current?.focus();
  }, []);

  const handleFieldFocus = (fieldName) => {
    setCurrentField(fieldName);
    setCurrentError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "college") {
      setStudent(prev => ({ ...prev, college: value, department: "" }));
    } else if (["firstName", "middleName", "lastName"].includes(name)) {
      // Only allow alphabets and spaces for names
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setStudent(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === "cgpa") {
      // Strict CGPA validation
      const cgpaValue = value.trim();
      if (cgpaValue === "" || (parseFloat(cgpaValue) >= 2.0 && parseFloat(cgpaValue) <= 4.00)) {
        setStudent(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setStudent(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateField = (fieldName, value) => {
    switch(fieldName) {
      case "certificateID":
        if (!value.trim()) return "Certificate ID is required";
        if (!/^[A-Za-z]{2}\d{4}$/.test(value)) return "Format: 2 letters + 4 numbers (e.g. AB1234)";
        break;
      case "firstName":
      case "middleName":
      case "lastName":
        if (!value.trim()) return "This field is required";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Only alphabets allowed";
        break;
      case "cgpa":
        if (!value.trim()) return "CGPA is required";
        const cgpaNum = parseFloat(value);
        if (isNaN(cgpaNum)) return "Must be a number";
        if (cgpaNum < 2.0 || cgpaNum > 4.0) return "Must be between 1.75 and 4.00";
        break;
      case "college":
        if (!value) return "College is required";
        break;
      case "department":
        if (!value) return "Department is required";
        break;
      case "gender":
        if (!value) return "Gender is required";
        break;
      case "program":
        if (!value) return "Program is required";
        break;
      case "programType":
        if (!value) return "Program type is required";
        break;
      case "gstatus":
        if (!value) return "Status is required";
        break;
      case "startDate":
        if (!value) return "Start date is required";
        break;
      case "endDate":
        if (!value) return "End date is required";
        if (student.startDate && new Date(value) < new Date(student.startDate)) {
          return "End date must be after start date";
        }
        break;
      default:
        break;
    }
    return "";
  };

  const validateForm = () => {
    if (!currentField) {
      setCurrentError("Please fill in the required fields");
      return false;
    }

    const error = validateField(currentField, student[currentField]);
    if (error) {
      setCurrentError(error);
      return false;
    }
    return true;
  };

  const isFormComplete = () => {
    return Object.keys(initialStudentState).every(field => {
      const value = student[field];
      return value && !validateField(field, value);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
  
    // Validate the form
    if (!validateForm()) {
      return;
    }
  
    if (!isFormComplete()) {
      setCurrentError("Please complete all required fields");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "You are not authenticated. Please log in.",
          confirmButtonColor: "#3b82f6",
        });
        navigate("/admin/login");
        return;
      }
  
      // First API call: Add student credentials
      const response = await axios.post(`${authURL}/addStudents`, student, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 201) {
        try {
          // Second API call: Create national ID
          await axios.post(`${national_ID_URL}`, student, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          Swal.fire({
            title: "Success!",
            text: "Student credentials and national ID added successfully",
            icon: "success",
            confirmButtonColor: "#3b82f6",
            timer: 2000,
          });
        } catch (error) {
          console.error("Error creating national ID:", error.message);
  
          Swal.fire({
            icon: "error",
            title: "Partial Success",
            text: "Student credentials added, but failed to create national ID",
            confirmButtonColor: "#3b82f6",
          });
        }
      }
    } catch (error) {
      console.error("Error adding student credentials:", error.message);
  
      let errorMessage = "Failed to add student credentials";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Validation failed";
        } else if (error.response.status === 401) {
          errorMessage = "Authentication required. Please login.";
        } else if (error.response.status === 409) {
          errorMessage = `Certificate ID ${student.certificateID} already exists`;
        }
      } else if (error.request) {
        errorMessage = "No response from the server. Please try again later.";
      } else {
        errorMessage = "An unexpected error occurred. Please try again.";
      }
  
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsSubmitting(false);
      // Reset form only if both API calls succeed
      setStudent(initialStudentState);
      setCurrentError("All fields marked with * are required");
      setCurrentField("");
      if (certificateIdRef.current) {
        certificateIdRef.current.focus();
      }
    }
  };

  const departmentOptions = student.college 
    ? collegeDepartmentData[student.college] || []
    : [];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
            <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <span className="animate-bounce">🎓</span>
              Add Graduate Credentials
            </h2>
    
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            {/* Single error display area */}
            <div className={`mb-4 p-3 rounded-lg ${currentError ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "hidden"}`}>
              {currentError}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-red-500 mt-2">All fields marked with * are required</p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Certificate ID */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificate ID *
                  </label>
                  <input
                    ref={certificateIdRef}
                    name="certificateID"
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "certificateID" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.certificateID}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("certificateID")}
                    onBlur={() => validateField("certificateID", student.certificateID)}
                    placeholder="AB1234"
                    maxLength="6"
                  />
                </div>

                {/* Name Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "firstName" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.firstName}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("firstName")}
                    onBlur={() => validateField("firstName", student.firstName)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Middle Name *
                  </label>
                  <input
                    name="middleName"
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "middleName" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.middleName}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("middleName")}
                    onBlur={() => validateField("middleName", student.middleName)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "lastName" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.lastName}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("lastName")}
                    onBlur={() => validateField("lastName", student.lastName)}
                  />
                </div>

                {/* Academic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CGPA * <span className="text-xs text-gray-500 dark:text-gray-400">(1.75-4.00)</span>
                  </label>
                  <input
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="2.0"
                    max="4.00"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "cgpa" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.cgpa}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("cgpa")}
                    onBlur={() => validateField("cgpa", student.cgpa)}
                  />
                </div>

                {/* College and Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    College *
                  </label>
                  <select
                    name="college"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "college" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.college}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("college")}
                    onBlur={() => validateField("college", student.college)}
                  >
                    <option value="">Select College</option>
                    {Object.keys(collegeDepartmentData).map(college => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "department" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
                    value={student.department}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("department")}
                    onBlur={() => validateField("department", student.department)}
                    disabled={!student.college}
                  >
                    <option value="">
                      {student.college ? "Select Department" : "Select College First"}
                    </option>
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Program and Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Program *
                  </label>
                  <select
                    name="program"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "program" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.program}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("program")}
                    onBlur={() => validateField("program", student.program)}
                  >
                    <option value="">Select Program</option>
                    <option value="BSc">BSc</option>
                    <option value="MSc">MSc</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                {/* Program type */}
                                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Program Type*
                  </label>
                  <select
                    name="programType"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "programType" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.programType}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("programType")}
                    onBlur={() => validateField("programType", student.programType)}
                  >
                  <option value="">Select program Type</option>
                  <option value="regular">Regular</option>
                  <option value="weekend">Weekend</option>
                  <option value="summer">Summer</option>
                  <option value="distance">Distance</option>
                  <option value="night">Night</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Graduate Status *
                  </label>
                  <select
                    name="gstatus"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "gstatus" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.gstatus}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("gstatus")}
                    onBlur={() => validateField("gstatus", student.gstatus)}
                  >
                    <option value="">Select Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "startDate" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.startDate}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("startDate")}
                    onBlur={() => validateField("startDate", student.startDate)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "endDate" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.endDate}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("endDate")}
                    onBlur={() => validateField("endDate", student.endDate)}
                    min={student.startDate}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      currentField === "gender" && currentError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={student.gender}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("gender")}
                    onBlur={() => validateField("gender", student.gender)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isFormComplete() || isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition-colors duration-200 ${
                    isFormComplete()
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Add Student Credentials"
                  )}
                </button>
                {!isFormComplete() && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                    Please complete all required fields to enable submission
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentCredentials;