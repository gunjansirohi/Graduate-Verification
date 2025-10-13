import axios from 'axios';
import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiChevronUp,
  FiUser,
  FiX,
  FiDownload,
  FiPrinter
} from 'react-icons/fi';
import LoadingSpinner from '../pages/LoadingSpinner';
const certURL = import.meta.env.VITE_CERTIFICATE_ROUTE;
const authURL = import.meta.env.VITE_ADMIN_ROUTE;
const ViewUpdateGraduates = ({ currentUser }) => {
  const [graduates, setGraduates] = useState([]);
  const [filteredGraduates, setFilteredGraduates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    college: '',
    department: '',
    year: '',
    status: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [departmentsByCollege, setDepartmentsByCollege] = useState({});
  const [selectedGraduate, setSelectedGraduate] = useState(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  // Fetch graduates data
  const fetchGraduates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${authURL}/certificates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setGraduates(data);
      setFilteredGraduates(data);
      
      // Create department mapping by college
      const deptMap = {};
      data.forEach(graduate => {
        if (!deptMap[graduate.college]) {
          deptMap[graduate.college] = new Set();
        }
        deptMap[graduate.college].add(graduate.department);
      });
      setDepartmentsByCollege(deptMap);
    } catch (error) {
      setError(error);
      if (error.response?.status === 401) {
        showErrorAlert("Unauthorized", "Please log in to access this page");
        navigate("/admin/login");
      } else {
        showErrorAlert("Error", "Failed to fetch graduates data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraduates();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...graduates];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(graduate => 
        graduate.firstName.toLowerCase().includes(term) ||
        graduate.lastName.toLowerCase().includes(term) ||
        graduate.middleName?.toLowerCase().includes(term) ||
        graduate.certificateID.toLowerCase().includes(term)
      );
    }
    
    // Apply filters
    if (filters.college) {
      result = result.filter(graduate => graduate.college === filters.college);
    }
    if (filters.department) {
      result = result.filter(graduate => graduate.department === filters.department);
    }
    if (filters.year) {
      result = result.filter(graduate => 
        new Date(graduate.endDate).getFullYear().toString() === filters.year
      );
    }
    if (filters.status) {
      result = result.filter(graduate => graduate.gstatus === filters.status);
    }
    
    setFilteredGraduates(result);
  }, [graduates, searchTerm, filters]);

  // Handle college change - reset department filter
  const handleCollegeChange = (e) => {
    const college = e.target.value;
    setFilters({
      ...filters,
      college,
      department: '' // Reset department when college changes
    });
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  useEffect(() => {
    if (sortConfig.key) {
      const sortedData = [...filteredGraduates].sort((a, b) => {
        if (sortConfig.key === 'name') {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return sortConfig.direction === 'asc' 
            ? nameA.localeCompare(nameB) 
            : nameB.localeCompare(nameA);
        } else if (sortConfig.key === 'year') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.endDate) - new Date(b.endDate)
            : new Date(b.endDate) - new Date(a.endDate);
        } else if (sortConfig.key === 'createdAt') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });
      setFilteredGraduates(sortedData);
    }
  }, [sortConfig, filteredGraduates]);

  // Get unique values for filter dropdowns
  const getUniqueValues = (key) => {
    const values = graduates.map(g => {
      if (key === 'year') return new Date(g.endDate).getFullYear();
      return g[key];
    });
    return ['', ...new Set(values)].filter(Boolean);
  };

  // Get departments for selected college
  const getDepartmentsForCollege = () => {
    if (!filters.college) return [];
    return Array.from(departmentsByCollege[filters.college] || []);
  };

  const showErrorAlert = (title, text) => {
    Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "OK",
      background: "#1f2937",
      color: "#fff",
    });
  };

  const showSuccessAlert = (title, text) => {
    Swal.fire({
      title,
      text,
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      background: "#1f2937",
      color: "#fff",
    });
  };

  // Open certificate view
  const openCertificate = (graduate) => {
    setSelectedGraduate(graduate);
    setIsCertificateOpen(true);
  };

  // Print certificate
  const handlePrintCertificate = () => {
    window.print();
  };

  // Download certificate
  const handleDownloadCertificate = () => {
    Swal.fire({
      title: 'Download Certificate',
      text: 'Certificate download functionality will be implemented here',
      icon: 'info',
      background: '#1f2937',
      color: '#fff',
    });
  };

  const handleUpdate = (certificateID) => {
    navigate(`/admin/edit-graduate/${certificateID}`);
  };

  const handleDelete = async (certificateID) => {
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
        showSuccessAlert('Deleted!', 'The graduate has been deleted.');
        setGraduates(prev => prev.filter(g => g.certificateID !== certificateID));
      } catch (error) {
        console.error('Error deleting graduate:', error);
        showErrorAlert('Error!', 'Failed to delete the graduate.');
      }
    }
  };

  const handleAddNew = () => {
    navigate('/admin/add-graduate');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      college: '',
      department: '',
      year: '',
      status: ''
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">Error loading data</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Graduate Records</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors shadow-md"
        >
          <FiPlus className="mr-2" />
          Add New Graduate
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiFilter className="mr-2" />
            Filters
            {showFilters ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* College Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">College</label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={filters.college}
                onChange={handleCollegeChange}
              >
                <option value="">All Colleges</option>
                {getUniqueValues('college').map(college => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
            </div>
            
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                disabled={!filters.college}
              >
                <option value="">{filters.college ? 'All Departments' : 'Select college first'}</option>
                {getDepartmentsForCollege().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Graduation Year</label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: e.target.value})}
              >
                <option value="">All Years</option>
                {getUniqueValues('year').map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {/* Reset Filters Button */}
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredGraduates.length} of {graduates.length} records
      </div>

      {/* Certificate Detail View Modal */}
{isCertificateOpen && selectedGraduate && (
  <div 
    className="fixed inset-0 z-10 flex items-center justify-center p-4  bg-opacity-50 backdrop-blur-sm"
    onClick={() => setIsCertificateOpen(false)}
  >
    <div 
      className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl border-4 border-amber-400"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={() => setIsCertificateOpen(false)}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
      >
        <FiX className="h-5 w-5 text-gray-600" />
      </button>
      
      {/* Certificate Header */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600 rounded-t-lg"></div>
      
      {/* Certificate Seal (top right) */}
      <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-red-100 border-4 border-red-300 flex items-center justify-center text-red-600 font-bold text-xs text-center">
        OFFICIAL SEAL
      </div>
      
      {/* Certificate Ribbon (left side) */}
      <div className="absolute left-0 top-1/4 h-1/2 w-4 bg-blue-600"></div>

      {/* Certificate Content */}
      <div className="p-8 pt-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800 mb-1">ACADEMIC CERTIFICATE</h2>
          <p className="text-sm text-gray-500">Issued by {selectedGraduate.college}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Photo and Basic Info */}
          <div className="col-span-1 flex flex-col items-center">
            <div className="relative mb-6">
              <img
                className="h-40 w-32 object-cover border-4 border-gray-300 rounded-lg"
                src={selectedGraduate.photo.startsWith('http') ? selectedGraduate.photo : `http://localhost:5000${selectedGraduate.photo}`}
                alt={`${selectedGraduate.firstName} ${selectedGraduate.lastName}`}
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
                <p className="font-mono text-lg font-bold">{selectedGraduate.certificateID}</p>
              </div>
              
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Gender</p>
                <p className="text-lg capitalize">{selectedGraduate.gender}</p>
              </div>
              
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">CGPA</p>
                <p className="text-lg font-bold text-blue-800">{selectedGraduate.cgpa.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Middle Column: Academic Details */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedGraduate.firstName} {selectedGraduate.middleName} {selectedGraduate.lastName}
              </h3>
              <div className="h-1 w-20 bg-blue-600 mb-4 mx-auto md:mx-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Program</p>
                  <p className="text-lg">{selectedGraduate.program}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Department</p>
                  <p className="text-lg">{selectedGraduate.department}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">College</p>
                  <p className="text-lg">{selectedGraduate.college}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Study Period</p>
                  <p className="text-lg">
                    {new Date(selectedGraduate.startDate).toLocaleDateString()} - {" "}
                    {new Date(selectedGraduate.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Graduation Status</p>
                  <p className={`text-lg font-bold ${
                    selectedGraduate.gstatus === "verified" ? "text-green-600" :
                    selectedGraduate.gstatus === "pending" ? "text-blue-600" :
                    "text-red-600"
                  }`}>
                    {selectedGraduate.gstatus.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Date Issued</p>
                  <p className="text-lg">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {/* Signature Area */}
            <div className="mt-8 flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="text-center flex-1">
                <div className="relative h-24 w-full">
                  <div className="absolute bottom-0 left-0 right-0 h-16 border-t-2 border-dashed border-gray-400"></div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-white flex items-center justify-center">
                    <span className="text-xs text-gray-500">Registrar's Signature</span>
                  </div>
                </div>
              </div>
              <div className="text-center flex-1">
                <div className="relative h-24 w-full">
                  <div className="absolute bottom-0 left-0 right-0 h-16 border-t-2 border-dashed border-gray-400"></div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-white flex items-center justify-center">
                    <span className="text-xs text-gray-500">Dean's Signature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Footer */}
      <div className="px-8 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">
            This document is officially issued by {selectedGraduate.college}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={handleDownloadCertificate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <FiDownload className="mr-2" />
              Download PDF
            </button>
            <button
              onClick={handlePrintCertificate}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <FiPrinter className="mr-2" />
              Print Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700">
            <tr>
              <TableHeader>Photo</TableHeader>
              <TableHeader>ID</TableHeader>
              <TableHeader sortable onClick={() => requestSort('name')} active={sortConfig.key === 'name'} direction={sortConfig.direction}>
                Name
              </TableHeader>
              <TableHeader>CGPA</TableHeader>
              <TableHeader>Gender</TableHeader>
              <TableHeader>Department</TableHeader>
              <TableHeader>College</TableHeader>
              <TableHeader>Program</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader sortable onClick={() => requestSort('year')} active={sortConfig.key === 'year'} direction={sortConfig.direction}>
                Year
              </TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredGraduates.length > 0 ? (
              filteredGraduates.map((graduate) => (
                <TableRow 
                  key={graduate.certificateID} 
                  graduate={graduate} 
                  onView={() => openCertificate(graduate)}
                  onEdit={() => handleUpdate(graduate.certificateID)}
                  onDelete={() => handleDelete(graduate.certificateID)}
                />
              ))
            ) : (
              <tr>
                <td colSpan="11" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No records found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Enhanced Table Header Component with sorting
const TableHeader = ({ children, sortable, onClick, active, direction }) => (
  <th 
    scope="col" 
    className={`px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-900' : ''}`}
    onClick={sortable ? onClick : undefined}
  >
    <div className="flex items-center">
      {children}
      {sortable && (
        <span className="ml-1">
          {active ? (
            direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
          ) : (
            <FiChevronDown size={14} className="text-blue-200 dark:text-blue-400" />
          )}
        </span>
      )}
    </div>
  </th>
);

// Table Row Component with photo
const TableRow = ({ graduate, onView, onEdit, onDelete }) => {
  const statusColor = {
    verified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }[graduate.gstatus] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <TableCell>
        <div className="flex-shrink-0 h-10 w-10">
          {graduate.photo ? (
            <img
              className="h-10 w-10 rounded-full object-cover cursor-pointer"
              src={graduate.photo.startsWith('http') ? graduate.photo : `http://localhost:5000${graduate.photo}`}
              alt={`${graduate.firstName} ${graduate.lastName}`}
              onClick={onView}
            />
          ) : (
            <div 
              className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center cursor-pointer"
              onClick={onView}
            >
              <FiUser className="text-gray-500 dark:text-gray-300" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium">{graduate.certificateID}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span 
            className="font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={onView}
          >
            {graduate.firstName} {graduate.lastName}
          </span>
          {graduate.middleName && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{graduate.middleName}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full ${graduate.cgpa >= 3.5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
          {graduate.cgpa.toFixed(2)}
        </span>
      </TableCell>
      <TableCell className="capitalize">{graduate.gender}</TableCell>
      <TableCell>{graduate.department}</TableCell>
      <TableCell>{graduate.college}</TableCell>
      <TableCell>{graduate.program}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
          {graduate.gstatus}
        </span>
      </TableCell>
      <TableCell>{new Date(graduate.endDate).getFullYear()}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <ActionButton 
            onClick={onView}
            color="green"
            icon={<FiDownload />}
            label="View"
          />
          <ActionButton 
            onClick={onEdit}
            color="blue"
            icon={<FiEdit2 />}
            label="Edit"
          />
          <ActionButton 
            onClick={onDelete}
            color="red"
            icon={<FiTrash2 />}
            label="Delete"
          />
        </div>
      </TableCell>
    </tr>
  );
};

// Table Cell Component
const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 ${className}`}>
    {children}
  </td>
);

// Action Button Component
const ActionButton = ({ onClick, color, icon, label }) => {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/50',
    red: 'bg-red-600 hover:bg-red-700 shadow-red-500/50',
    green: 'bg-green-600 hover:bg-green-700 shadow-green-500/50',
  }[color] || 'bg-gray-600 hover:bg-gray-700';

  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-1.5 rounded-md text-white text-sm transition-colors shadow-sm ${colorClasses}`}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </button>
  );
};

export default ViewUpdateGraduates;