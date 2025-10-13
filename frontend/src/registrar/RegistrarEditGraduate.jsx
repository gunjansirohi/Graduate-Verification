import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const auth_URL = import.meta.env.VITE_ADMIN_ROUTE;
const RegistrarEditGraduate = () => {
  const { certificateID } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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

  const token = localStorage.getItem('registrarToken');

  useEffect(() => {
    const fetchGraduate = async () => {
      try {
        const res = await axios.get(
          `${auth_URL}/certificates/${certificateID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.data;
        setFormData({
          ...data,
          startDate: data.startDate ? data.startDate.slice(0, 10) : '',
          endDate: data.endDate ? data.endDate.slice(0, 10) : '',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error fetching graduate data',
          text: error.response?.data?.message || 'Something went wrong.',
        });
        navigate('/registrar/viewallcertificates');
      }
    };
    fetchGraduate();
  }, [certificateID, token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Field-specific validation
  const nameRegex = /^[A-Za-z\s-]+$/;
 const certificateIDRegex = /^[A-Za-z0-9-]+$/;
  
  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!nameRegex.test(formData.firstName)) return "First name can only contain letters, spaces, or hyphens";
  
    if (!formData.middleName.trim()) return "Middle name is required";
    if (!nameRegex.test(formData.middleName)) return "Middle name can only contain letters, spaces, or hyphens";
  
    if (!formData.lastName.trim()) return "Last name is required";
    if (!nameRegex.test(formData.lastName)) return "Last name can only contain letters, spaces, or hyphens";
  
    if (!formData.certificateID.trim()) return "Certificate ID is required";
    if (!certificateIDRegex.test(formData.certificateID)) return "Certificate ID can only contain letters and numbers";
  
    if (!formData.startDate || !formData.endDate) return "Start and end dates are required";
    if (formData.endDate < formData.startDate) return "End date must be after start date";
    // Add more checks as needed
    return "";
  };

  const errorMessage = validateForm();
  const isFormInvalid = !!errorMessage;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormInvalid) return;
    try {
      await axios.put(
        `${auth_URL}/certificates/${certificateID}/edit`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        icon: 'success',
        title: 'Graduate updated successfully!',
        showConfirmButton: false,
        timer: 1500
      });
      setTimeout(() => navigate('/registrar/viewallcertificates'), 1500);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: error.response?.data?.message || 'Something went wrong.',
      });
    }
  };

  // Floating Input
  const renderInput = (name, type = 'text') => (
    <div className="relative w-full" key={name}>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder=" "
        className="peer w-full pt-5 pb-2 px-3 rounded-lg border border-gray-400 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:border-blue-500 focus:ring-0 focus:outline-none dark:bg-gray-800"
        required
      />
      <label
        htmlFor={name}
        className="absolute left-3 -top-3.5 bg-white dark:bg-gray-800 px-1 text-sm text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
      >
        {name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
      </label>
    </div>
  );

  // Floating Select
  const renderSelect = (name, options) => (
    <div className="relative w-full" key={name}>
      <select
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="peer w-full pt-5 pb-2 px-3 rounded-lg border border-gray-400 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:border-blue-500 focus:ring-0 focus:outline-none dark:bg-gray-800 appearance-none"
        required
      >
        <option value="" disabled hidden></option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <label
        htmlFor={name}
        className="absolute left-3 -top-3.5 bg-white dark:bg-gray-800 px-1 text-sm text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
      >
        {name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Edit Graduate
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Show validation error */}
          {errorMessage && (
            <div className="text-red-500 text-sm mb-2">{errorMessage}</div>
          )}

          {/* Certificate ID */}
          {renderInput('certificateID')}

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['firstName', 'middleName', 'lastName'].map(name => renderInput(name))}
          </div>

          {/* Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSelect('college', ['Engineering and Technology', 'Business and Economics', 'Agriculture and Natural Resource', 'Social Science and Humanities', 'Health Science', 'Natural and Computational Science'])}
            {renderSelect('department',  [ "Computer Science",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering", "Accounting and Finance",
    "Banking and Finance",
    "Economics",
    "Marketing Management",
    "Management",
    "Public Administration",
    "Hotel and Tourism Management", "English Language and Literature",
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
    "Sports Science", "Animal Science",
    "Agro economics",
    "Natural Resource Management",
    "soil and water conservation",
    "Horticulture",
    "Plant Science",
    "Forestry",
    "Veterinary Medicine",
    "Coffee Science and Technology",
  ])}
            {renderSelect('gender', ['Male', 'Female'])}
            {renderSelect('gstatus', ['verified', 'pending', 'suspended'])}
            {renderSelect('program', ['BSc', 'MSc', 'PhD'])}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('startDate', 'date')}
            {renderInput('endDate', 'date')}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={!isFormInvalid ? { scale: 1.05 } : {}}
            whileTap={!isFormInvalid ? { scale: 0.95 } : {}}
            type="submit"
            disabled={isFormInvalid}
            className={`mt-8 ${
              isFormInvalid ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold py-3 rounded-lg shadow-md transition duration-300`}
          >
            Update Graduate
          </motion.button>

          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition duration-300"
          >
            Back
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegistrarEditGraduate;