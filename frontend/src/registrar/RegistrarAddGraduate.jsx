import React, { useState } from "react";
import SingleGraduateForm from "./SingleGraduateForm";
import BulkGraduateUpload from "./BulkGraduateUpload";

const RegistrarAddGraduate = () => {
  const [mode, setMode] = useState("single"); // 'single' or 'file'

  const handleModeChange = (newMode) => {
    setMode(newMode); // Update the mode
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
      {/* Mode Selection Buttons */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => handleModeChange("single")}
          className={`px-4 py-2 rounded ${
            mode === "single"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          Single Upload
        </button>
        <button
          onClick={() => handleModeChange("file")}
          className={`px-4 py-2 rounded ${
            mode === "file"
              ? "bg-green-600 text-white"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          Bulk Upload (Excel)
        </button>
      </div>

      {/* Conditional Rendering of Components */}
      <div>
        {mode === "single" && <SingleGraduateForm />}
        {mode === "file" && <BulkGraduateUpload />}
      </div>
    </div>
  );
};

export default RegistrarAddGraduate;