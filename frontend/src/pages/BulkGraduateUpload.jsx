import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFileExcel, FaUpload, FaDownload } from "react-icons/fa";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const baseUrl = import.meta.env.VITE_BACKEND_URL;
const national_ID_URL = import.meta.env.VITE_NATIONAL_ID_ROUTE;

const BulkGraduateUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(100);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage("");
    setUploadStatus("");
    setValidationErrors([]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/i)) {
      setFile(droppedFile);
      // Sync with file input for form submission
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const downloadSampleFile = () => {
    // Create sample data
    const sampleData = [
      {
        certificateID: "CERT-001",
        firstName: "John",
        middleName: "A.",
        lastName: "Doe",
        department: "Computer Science",
        gender: "Male",
        cgpa: 3.75,
        program: "BSc",
        gstatus: "Graduated",
        college: "Engineering",
        startDate: "2020-09-01",
        endDate: "2024-06-30"
      },
      {
        certificateID: "CERT-002",
        firstName: "Jane",
        lastName: "Smith",
        department: "Electrical Engineering",
        gender: "Female",
        cgpa: 3.9,
        program: "BSc",
        gstatus: "Graduated",
        college: "Engineering",
        startDate: "2020-09-01",
        endDate: "2024-06-30"
      }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, "Graduates");

    // Generate and download
    XLSX.writeFile(wb, "graduate_template.xlsx");
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMessage("");
    setUploadStatus("");
    setValidationErrors([]);

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      setIsUploading(false);
      return;
    }

    // File validation
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setErrorMessage("Invalid file type. Please upload an Excel file.");
      setIsUploading(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await axios.post(
        `${baseUrl}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      if (response.status === 201) {
        // upload this file nationalID api's too
        const nationalIdResponse = await axios.post(
          `${national_ID_URL}/upload-excel`,
          formData,
          { headers:{
            "Content-Type": "multipart/form-data",
          },
        })
        if(nationalIdResponse.status === 201) {
          Swal.fire({
            title: "Success!",
            text: `File processed successfully. ${response.data.recordsProcessed} records added.`,
            icon: "success",
            confirmButtonColor: "#10b981",
            timer: 3000,
            timerProgressBar: true,
          });
        }

        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setUploadStatus(`Successfully processed ${response.data.recordsProcessed} records`);
      }
    } catch (error) {
      handleUploadError(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUnauthorized = () => {
    setErrorMessage("Session expired. Redirecting to login...");
    setShowProgress(true);
    
    let progressValue = 100;
    const interval = setInterval(() => {
      progressValue -= 2;
      setProgress(progressValue);

      if (progressValue <= 0) {
        clearInterval(interval);
        navigate("/admin/login");
      }
    }, 50);
  };

  const handleUploadError = (error) => {
    console.log('Full error object:', error); // For debugging
    
    // Default error message
    let errorMessage = "Something went wrong. Please try again.";
    let showValidationErrors = false;
    let validationErrors = [];
  
    if (error.response) {
      const { data } = error.response;
      
      // Handle 400 Bad Request errors
      if (error.response.status === 400) {
        if (data.type === 'validation') {
          if (data.errors) {
            validationErrors = data.errors;
            showValidationErrors = true;
            errorMessage = "There were validation errors in your file:";
          } else {
            errorMessage = data.message || "Validation error occurred";
          }
        } 
        else if (data.type === 'duplicate') {
          errorMessage = `Duplicate certificate IDs found: ${data.duplicateIds?.join(', ') || 'Unknown IDs'}`;
          if (data.recordsProcessed > 0) {
            setUploadStatus(`Successfully processed ${data.recordsProcessed} records (duplicates skipped)`);
          }
        }
      }
      // Handle 401 Unauthorized
      else if (error.response.status === 401) {
        handleUnauthorized();
        return;
      }
      // Handle 403 Forbidden
      else if (error.response.status === 403) {
        errorMessage = "You don't have permission to upload files";
      }
      // Handle 500 Server Error
      else if (error.response.status === 500) {
        if (data.type === 'duplicate') {
          errorMessage = `Duplicate certificate ID detected: ${data.duplicateIds?.join(', ') || 'Unknown ID'}`;
        } else {
          errorMessage = data.message || "Server error occurred. Please try again later.";
        }
      }
    } 
    // Handle network errors
    else if (error.code === 'ERR_NETWORK') {
      errorMessage = "Network error. Please check your internet connection.";
    } 
    // Handle request cancellation
    else if (error.code === 'ECONNABORTED') {
      errorMessage = "Request timeout. Please try again.";
    }
  
    // Set the state
    setErrorMessage(errorMessage);
    if (showValidationErrors) {
      setValidationErrors(validationErrors);
    }
  
    // For debugging
    console.error('Upload error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-3">
              <FaFileExcel className="text-xl sm:text-2xl" />
              Bulk Graduate Upload
            </h2>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleFileUpload} className="space-y-6">
              {/* File Upload Area */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Excel File (.xlsx, .xls)
                </label>
                <div 
                  className="flex items-center justify-center w-full"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer 
                    border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 transition-colors duration-200
                    bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUpload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Excel files only (MAX: 5MB)
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
                {file && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                      <FaFileExcel />
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <button
                type="submit"
                disabled={!file || isUploading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2
                ${!file || isUploading 
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 hover:scale-[1.02]'
                }`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload /> Upload File
                  </>
                )}
              </button>

              {/* Download Sample Button */}
              <button
                type="button"
                onClick={downloadSampleFile}
                className="w-full py-2 px-4 border border-green-600 text-green-600 dark:text-green-400 dark:border-green-400 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaDownload /> Download Sample Template
              </button>

              {/* Status Messages */}
              {errorMessage && (
                <div className="animate-shake p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
                  ⚠️ {errorMessage}
                </div>
              )}

              {uploadStatus && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400 text-sm font-medium">
                  ✓ {uploadStatus}
                </div>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                    Validation Errors:
                  </h4>
                  <ul className="text-sm text-yellow-600 dark:text-yellow-300 space-y-1 max-h-60 overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progress Bar (for redirect) */}
              {showProgress && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${progress}%`, transition: "width 0.05s linear" }}
                    ></div>
                  </div>
                  <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    Redirecting to login... {progress}%
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            📋 Upload Instructions
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
            <li>Only Excel files (.xlsx, .xls) are accepted</li>
            <li>Maximum file size: 5MB</li>
            <li>Download and use our template to ensure proper formatting</li>
            <li>Required fields: CertificateID, First Name, Last Name, Department, Gender, CGPA, Program, ProgramType,  Graduate Status, College, Departments, Start Date, End Date</li>
            <li>CertificateIDs must be unique across the system</li>
            <li>Dates should be in YYYY-MM-DD format</li>
            <li>CGPA must be between 2 and 4</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BulkGraduateUpload;