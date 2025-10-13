import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiDownload,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../pages/LoadingSpinner";


const api = import.meta.env.VITE_ADMIN_ROUTE; // Ensure this is set to your backend API route
const StudentsPage = () => {
  // Sample certificate data matching your schema
  // const [certificates, setCertificates] = useState([
  //   {
  //     certificateID: "RU2023001",
  //     firstName: "Abel",
  //     middleName: "T",
  //     lastName: "Tesfaye",
  //     college: "Engineering and Technology",
  //     department: "Computer Science",
  //     program: "BSc Computer Science",
  //     gstatus: "Verified",
  //     cgpa: 3.75,
  //     gender: "Male",
  //     photo: "https://randomuser.me/api/portraits/men/1.jpg",
  //     startDate: "2020-09-15",
  //     endDate: "2024-06-15",
  //   },
  //   {
  //     certificateID: "RU2023002",
  //     firstName: "Meron",
  //     middleName: "G",
  //     lastName: "Girma",
  //     college: "Business and Economics",
  //     department: "Business Administration",
  //     program: "MBA",
  //     gstatus: "Verified",
  //     cgpa: 3.92,
  //     gender: "Female",
  //     photo: "https://randomuser.me/api/portraits/women/2.jpg",
  //     startDate: "2019-09-10",
  //     endDate: "2023-06-10",
  //   },
  //   // Add more sample data as needed
  // ]);

 

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCollege, setSelectedCollege] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const certificatesPerPage = 5;
  const navigate = useNavigate();

  const [editFormData, setEditFormData] = useState({
    certificateID: '',
    firstName: '',
    middleName: '',
    lastName: '',
    college: '',
    department: '',
    gender: '',
    gstatus: '',
    cgpa: '',
    program: '',
    startDate: '',
    endDate: '',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [certificates, setCertificates] = useState([]);

  
    useEffect(() => {
      const fetchCertificates = async () => {
        try {
          const token = localStorage.getItem("registrarToken");
          const response = await axios.get(`${api}/certificates`,
            {
              headers: {
                Authorization: `Bearer ${token}`, // Ensure the token is sent
              },
            }
          ); // Replace with your backend endpoint
          console.log(response.data); // Log the response data for debugging
          setCertificates(response.data); // Assuming the backend returns an array of certificates
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching certificates:", err);
          setError("Failed to fetch certificates. Please try again later.");
          setIsLoading(false);
        }
      };
  
      fetchCertificates();
    }, []);
  // college options
  const colleges = [
    "Engineering and Technology",
    "Business and Economics",
    "Health Science",
    "Social Science",
    "Agriculture and Natural Resource",
    "Natural and Computational Science",
  ];

  const departmentsByCollege = {
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
    // Add other colleges and departments
  };

  const handleEditClick = (certificateID) => {
    navigate(`/registrar/edit-graduate/${certificateID}`);

  };

  // Handle form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === "cgpa" ? parseFloat(value) : value, // Convert cgpa to a number
    });
  };

  // Handle form submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    // Validate CGPA
    if (editFormData.cgpa < 2.0 || editFormData.cgpa > 4.0) {
      alert("CGPA must be between 2.0 and 4.0");
      return;
    }
    

    const updatedCertificates = certificates.map((cert) =>
      cert.certificateID === selectedCertificate.certificateID
        ? { ...cert, ...editFormData }
        : cert
    );
    setCertificates(updatedCertificates);
    setIsEditModalOpen(false);
  };




  // Get full name
  const getFullName = (certificate) => {
    return `${certificate.firstName} ${certificate.middleName} ${certificate.lastName}`;
  };

  // Get unique departments based on selected college
  const getFilteredDepartments = () => {
    if (selectedCollege === "All") {
      const allDepartments = new Set();
      certificates.forEach((cert) => allDepartments.add(cert.department));
      return Array.from(allDepartments);
    }
    return Array.from(
      new Set(
        certificates
          .filter((cert) => cert.college === selectedCollege)
          .map((cert) => cert.department)
      )
    );
  };

  // Filter certificates based on search and filters
  const filteredCertificates = certificates.filter((cert) => {
    const fullName = getFullName(cert).toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      cert.certificateID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || cert.gstatus === selectedStatus;
    const matchesCollege =
      selectedCollege === "All" || cert.college === selectedCollege;
    const matchesDepartment =
      selectedDepartment === "All" || cert.department === selectedDepartment;
    const isValidCGPA = cert.cgpa >= 2.0 && cert.cgpa <= 4.0;
    return (
      isValidCGPA &&
      matchesSearch &&
      matchesStatus &&
      matchesCollege &&
      matchesDepartment
    );
  });

  // Pagination logic
  const indexOfLastCertificate = currentPage * certificatesPerPage;
  const indexOfFirstCertificate = indexOfLastCertificate - certificatesPerPage;
  const currentCertificates = filteredCertificates.slice(
    indexOfFirstCertificate,
    indexOfLastCertificate
  );
  const totalPages = Math.ceil(
    filteredCertificates.length / certificatesPerPage
  );

  // Handle certificate deletion
  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this certificate record?")
    ) {
      setCertificates(certificates.filter((cert) => cert.certificateID !== id));
    }
  };

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle college change - reset department filter
  const handleCollegeChange = (e) => {
    setSelectedCollege(e.target.value);
    setSelectedDepartment("All");
  };

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 p-6 rounded-xl shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Certificate Records Management
          </h2>
          <p className="text-blue-100 dark:text-blue-200">
            Comprehensive view and management of all certificate records
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white dark:bg-blue-600 text-blue-600 dark:text-white rounded-lg transition-all hover:bg-opacity-90 hover:shadow-md transform hover:-translate-y-0.5">
            <FiDownload className="mr-2" />
            <span>Export Data</span>
          </button>
          <button className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all hover:shadow-md transform hover:-translate-y-0.5">
            <FiPlus className="mr-2" />
            <span>Add New Certificate</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="pl-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-11 transition-all duration-200 focus:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              className="pl-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-11 transition-all duration-200 focus:shadow-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* College Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              className="pl-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-11 transition-all duration-200 focus:shadow-md"
              value={selectedCollege}
              onChange={handleCollegeChange}
            >
              <option value="All">All Colleges</option>
              <option value="Engineering and Technology">Engineering</option>
              <option value="Business and Economics">Business</option>
              <option value="Health Science">Health Science</option>
              <option value="Social Science">Social Science</option>
              <option value="Agriculture and Natural Resource">
                Agriculture
              </option>
              <option value="Natural and Computational Science">
                Natural Science
              </option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              className="pl-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-11 transition-all duration-200 focus:shadow-md"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              disabled={
                selectedCollege === "All" && selectedDepartment === "All"
              }
            >
              <option value="All">
                {selectedCollege === "All"
                  ? "Select College First"
                  : "All Departments"}
              </option>
              {getFilteredDepartments().map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CGPA
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Study Period
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentCertificates.length > 0 ? (
                currentCertificates?.map((cert) => (
                  <tr
                    key={cert.certificateID}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={cert.photo}
                            alt={getFullName(cert)}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getFullName(cert)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {cert.certificateID}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {cert.program}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {cert.college}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {cert.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${Math.min(
                                Math.max((cert.cgpa / 4) * 100, 0),
                                100
                              )}%`,
                            }} // Ensure width is between 0% and 100%
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {cert?.cgpa >= 1.75 && cert?.cgpa <= 4.0
                            ? cert.cgpa.toFixed(2)
                            : "Invalid CGPA"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cert.gstatus === "verified"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : cert.gstatus === "pending"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {cert.gstatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(cert.startDate).toLocaleDateString()} -{" "}
                        {new Date(cert.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          title="View Details"
                          onClick={() => {
                            setSelectedCertificate(cert);
                            setIsModalOpen(true);
                          }}
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                        {/* Update your edit button in the table to use handleEditClick */}
                        <button
                          className="p-2 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors"
                          title="Edit"
                          onClick={() => handleEditClick(cert.certificateID)}
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                          onClick={() => handleDelete(cert.certificateID)}
                          title="Delete"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FiSearch className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        No certificates found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {searchTerm
                          ? "Try adjusting your search query"
                          : "No certificates match your current filters"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCertificates.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium">
                    {indexOfFirstCertificate + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      indexOfLastCertificate,
                      filteredCertificates.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredCertificates.length}
                  </span>{" "}
                  certificates
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md border flex items-center ${
                    currentPage === 1
                      ? "border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <FiChevronLeft className="h-4 w-4 mr-1" />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === number
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      {number}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md border flex items-center ${
                    currentPage === totalPages
                      ? "border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <span>Next</span>
                  <FiChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
{isModalOpen && selectedCertificate && (
  <div className="fixed inset-0 z-10 flex items-center justify-center p-4  bg-opacity-50 backdrop-blur-sm">
    <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl dark:bg-gray-800 border-4 border-gold-500">
      {/* Certificate Header */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600 rounded-t-lg"></div>
      
      {/* Certificate Seal (top right) */}
      <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-red-100 border-4 border-red-300 flex items-center justify-center text-red-600 font-bold text-xs text-center">
        OFFICIAL SEAL
      </div>
      
      {/* Certificate Ribbon (left side) */}
      <div className="absolute left-0 top-1/4 h-1/2 w-4 bg-blue-600"></div>

      {/* Modal Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-1">ACADEMIC CERTIFICATE</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Issued by {selectedCertificate.college}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Photo and Basic Info */}
          <div className="col-span-1 flex flex-col items-center">
            <div className="relative mb-6">
              <img
                className="h-40 w-32 object-cover border-4 border-gray-300 rounded"
                src={selectedCertificate.photo}
                alt={getFullName(selectedCertificate)}
              />
              <div className="absolute -bottom-3 left-0 right-0 text-center">
                <span className="inline-block px-2 py-1 text-xs font-bold bg-blue-600 text-white rounded">
                  STUDENT PHOTO
                </span>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Certificate ID</p>
                <p className="font-mono text-lg font-bold">{selectedCertificate.certificateID}</p>
              </div>
              
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Gender</p>
                <p className="text-lg">{selectedCertificate.gender}</p>
              </div>
              
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">CGPA</p>
                <p className="text-lg font-bold text-blue-800">{selectedCertificate.cgpa.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Middle Column: Academic Details */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {getFullName(selectedCertificate)}
              </h3>
              <div className="h-1 w-20 bg-blue-600 mb-4"></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Program</p>
                  <p className="text-lg">{selectedCertificate.program}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Department</p>
                  <p className="text-lg">{selectedCertificate.department}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">College</p>
                  <p className="text-lg">{selectedCertificate.college}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Study Period</p>
                  <p className="text-lg">
                    {new Date(selectedCertificate.startDate).toLocaleDateString()} - {" "}
                    {new Date(selectedCertificate.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase">Graduation Status</p>
                  <p className={`text-lg font-bold ${
                    selectedCertificate.gstatus === "verified" ? "text-green-600 dark:text-green-300" :
                    selectedCertificate.gstatus === "pending" ? "text-blue-600 dark:text-blue-300" :
                    "text-red-600 dark:text-red-300"
                  }`}>
                    {selectedCertificate.gstatus.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase">Date Issued</p>
                  <p className="text-lg">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {/* Signature Area */}
            <div className="mt-8 flex justify-between items-end">
              <div className="text-center">
                <div className="h-16 w-48 border-t-2 border-gray-400 mb-2"></div>
                <p className="text-sm font-semibold">Registrar's Signature</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-48 border-t-2 border-gray-400 mb-2"></div>
                <p className="text-sm font-semibold">Dean's Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Footer */}
      <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This document is officially issued by {selectedCertificate.college}
          </p>
          <div className="flex space-x-3">
                            <button
                  onClick={() =>
                    handleEditClick(selectedCertificate.certificateID)
                  }
                  className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <FiEdit2 className="mr-1 inline-block" />
                  Edit
                </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => console.log("Generate Certificate")}
            >
              Download PDF
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Edit Certificate Modal */}
      {isEditModalOpen && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mt-1.5">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Certificate
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Personal Information
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={editFormData.firstName}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={editFormData.middleName}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={editFormData.lastName}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={editFormData.gender}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Academic Information
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        College
                      </label>
                      <select
                        name="college"
                        value={editFormData.college}
                        onChange={(e) => {
                          handleEditFormChange(e);
                          setEditFormData((prev) => ({
                            ...prev,
                            department: "",
                          }));
                        }}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                        required
                      >
                        <option value="">Select College</option>
                        {colleges.map((college) => (
                          <option key={college} value={college}>
                            {college}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department
                      </label>
                      <select
                        name="department"
                        value={editFormData.department}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                        disabled={!editFormData.college}
                        required
                      >
                        <option value="">Select Department</option>
                        {editFormData.college &&
                          departmentsByCollege[editFormData.college]?.map(
                            (dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            )
                          )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Program
                      </label>
                      <input
                        type="text"
                        name="program"
                        value={editFormData.program}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Graduation Status
                      </label>
                      <select
                        name="gstatus"
                        value={editFormData.gstatus}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                        required
                      >
                        <option value="verified">Verified</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        CGPA
                      </label>
                      <input
                        type="number"
                        name="cgpa"
                        value={editFormData.cgpa}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value >= 1.75 && value <= 4.0) {
                            handleEditFormChange(e);
                          } else {
                            alert("CGPA must be between 1.75 and 4.0");
                          }
                        }}
                        min="1.75"
                        max="4.0"
                        step="0.01"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                        required
                      />
                    </div>
                  </div>

                  {/* Dates Section */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={editFormData.startDate}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={editFormData.endDate}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
