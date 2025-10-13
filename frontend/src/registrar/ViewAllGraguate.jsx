import axios from 'axios';
import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../pages/LoadingSpinner';

const auth_URL = import.meta.env.VITE_ADMIN_ROUTE;
const ViewAllGraduate = () => {
  const [graduates, setGraduates] = useState([]);
  const token = localStorage.getItem("registrarToken");
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    program: '',
    year: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedGraduate, setSelectedGraduate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const itemsPerPage = 10;

  const departments = [
    "Computer Science",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering", 
    "Accounting and Finance",
    "Banking and Finance",
    "Economics",
    "Marketing Management",
    "Management",
    "Public Administration",
    "Hotel and Tourism Management", 
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
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Statistics",
    "Geology",
    "Sports Science", 
    "Animal Science",
    "Agro economics",
    "Natural Resource Management",
    "soil and water conservation",
    "Horticulture",
    "Plant Science",
    "Forestry",
    "Veterinary Medicine",
    "Coffee Science and Technology",
  ];

  // Filter graduates based on active filters
  const filteredGraduates = graduates.filter(g => {
    return (
      (filters.department === '' || g.department === filters.department) &&
      (filters.program === '' || g.program === filters.program) &&
      (filters.year === '' || new Date(g.endDate).getFullYear().toString() === filters.year) &&
      (filters.status === '' || g.gstatus === filters.status)
    );
  }).slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  useEffect(() => {
    const fetchGraduates = async () => {
      try {
        const response = await axios.get(`${auth_URL}/certificates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.data;
        setGraduates(data);
        setIsLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          Swal.fire({
            title: "Unauthorized",
            text: "Please log in to access this page.",
            icon: "error",
            confirmButtonText: "OK",
            background: "#1f2937",
            color: "#fff",
          });
          navigate("/registrar/login");
        } else {
          console.error("Error fetching graduates:", error);
        }
      }
    };
    fetchGraduates();
  }, []);

  const handleUpdate = (certificateID) => {
    navigate(`/registrar/edit-graduate/${certificateID}`);
  };

  const handleDelete = async (certificateID) => {
    const token = localStorage.getItem('token');
  
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#1f2937',
      color: '#fff',
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/certificates/${certificateID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        Swal.fire({
          title: 'Deleted!',
          text: 'The graduate has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#1f2937',
          color: '#fff',
        });
  
        setGraduates(prev => prev.filter(g => g.certificateID !== certificateID));
      } catch (error) {
        console.error('Error deleting graduate:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the graduate.',
          icon: 'error',
          background: '#1f2937',
          color: '#fff',
        });
      }
    }
  };

  // New function to handle view details
  const handleView = (graduate) => {
    setSelectedGraduate(graduate);
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedGraduate(null);
  };

     if (isLoading) {
        return <LoadingSpinner />
      }

  return (
    <div className=" max-w-7xl mx-auto">
    {/* Modal for viewing graduate details */}
{/* Modal for viewing graduate details */}
{showModal && selectedGraduate && (
  <>
    {/* Background overlay */}
    <div 
      className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={closeModal}
    ></div>
    
    {/* Modal container - centered with higher z-index */}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Modal content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="sticky top-0 bg-blue-600 dark:bg-blue-800 px-4 py-3 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-white">
            Graduate Details - #{selectedGraduate.certificateID}
          </h3>
          <button
            type="button"
            className="text-white hover:text-gray-200 focus:outline-none"
            onClick={closeModal}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal body */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Personal Information
                </h4>
                <div className="mt-2 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedGraduate.firstName} {selectedGraduate.middleName} {selectedGraduate.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedGraduate.gender}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Academic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Academic Information
                </h4>
                <div className="mt-2 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Program</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedGraduate.program}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">CGPA</p>
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedGraduate.cgpa >= 3.5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        selectedGraduate.cgpa >= 2.75 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {selectedGraduate.cgpa}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Graduation Year</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(selectedGraduate.endDate).getFullYear()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Institutional Information */}
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Institutional Information
                </h4>
                <div className="mt-2 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">College</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedGraduate.college}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedGraduate.department}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Status Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Verification Status
                </h4>
                <div className="mt-2 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedGraduate.gstatus === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedGraduate.gstatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedGraduate.gstatus.charAt(0).toUpperCase() + selectedGraduate.gstatus.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Certificate ID</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      #{selectedGraduate.certificateID}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => handleUpdate(selectedGraduate.certificateID)}
          >
            Edit Record
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </>
)}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Graduate Records Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all graduate records in the system
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 dark:text-gray-100 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          <button
            onClick={() => navigate('/registrar/addgraduate')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                className="w-full p-2 border dark:text-gray-200 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program</label>
              <select
                value={filters.program}
                onChange={(e) => setFilters({...filters, program: e.target.value})}
                className="w-full p-2 border dark:text-gray-200 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
              >
                <option value="">All Programs</option>
                <option value="BSc">Bachelor's</option>
                <option value="MSc">Master's</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Graduation Year</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: e.target.value})}
                className="w-full p-2 border dark:text-gray-200 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
              >
                <option value="">All Years</option>
                {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i)
                  .map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-2 border dark:text-gray-200 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
              >
                <option value="">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({department: '', program: '', year: '', status: ''})}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CGPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredGraduates.map((g) => (
                <tr key={g.certificateID} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{g.certificateID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {g.firstName} {g.middleName && `${g.middleName} `}{g.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {g.gender}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{g.program}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{g.college}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      g.cgpa >= 3.5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      g.cgpa >= 2.75 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {g.cgpa}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {g.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      g.gstatus === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      g.gstatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {g.gstatus.charAt(0).toUpperCase() + g.gstatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(g.endDate).getFullYear()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(g)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleUpdate(g.certificateID)}
                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(g.certificateID)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{currentPage * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((currentPage + 1) * itemsPerPage, graduates.length)}
                </span>{' '}
                of <span className="font-medium">{graduates.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({length: Math.ceil(graduates.length / itemsPerPage)}).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === idx 
                        ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(graduates.length / itemsPerPage)) - 1)}
                  disabled={currentPage === Math.ceil(graduates.length / itemsPerPage) - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllGraduate;