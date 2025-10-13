import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaPlus, FaCloudUploadAlt } from 'react-icons/fa';
import AdminDashBoard from '../admin/AdminDashBoard';



const AdminDashboard = () => {
  return (
    <div className="w-full px-4 py-6 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome, Admin 🎓</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-8">
        Manage graduate records effortlessly. Use the quick actions below or navigate using the sidebar.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* View Graduates */}
        <Link
          to="/admin/view-graduates"
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <FaGraduationCap className="text-4xl text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-xl font-semibold">View Graduates</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse and update student records.
              </p>
            </div>
          </div>
        </Link>

        {/* Add Graduate */}
        <Link
          to="/admin/add-graduate"
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <FaPlus className="text-4xl text-green-600 dark:text-green-400" />
            <div>
              <h2 className="text-xl font-semibold">Add Graduate</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new graduate manually.
              </p>
            </div>
          </div>
        </Link>

        {/* Upload Excel */}
        <Link
          to="/admin/add-graduate/file"
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <FaCloudUploadAlt className="text-4xl text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold">Upload Excel</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bulk upload graduate data.
              </p>
            </div>
          </div>
        </Link>
      </div>
      <AdminDashBoard />
    </div>
  );
};

export default AdminDashboard;
