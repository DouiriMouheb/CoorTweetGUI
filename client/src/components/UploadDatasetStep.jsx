import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { ProgressBar } from "./ProgressBar";

import { useNavigate } from "react-router-dom";

const UploadDatasetStep = ({ nextStep, formData, setFormData }) => {
  const navigate = useNavigate(); // Add this for navigation

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFormData((prev) => ({ ...prev, csvFile: file }));

        const reader = new FileReader();
        reader.onload = ({ target }) => {
          const csvText = target.result;
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (result) => {
              if (result.data.length > 0) {
                const headers = Object.keys(result.data[0]);
                setFormData((prev) => ({ ...prev, csvHeaders: headers }));
              }
            },
            error: (error) => {
              console.error("Error parsing CSV:", error);
            },
          });
        };
        reader.readAsText(file);
      }
    },
    [setFormData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      csvFile: null,
    }));
  };

  const handleCancel = useCallback(() => {
    navigate("/");
  }, [navigate]);
  return (
    <div className="w-full h-[100vh] mx-auto p-4 flex flex-col bg-gray-100 overflow-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto  space-y-4 w-full"
      >
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold bg-gradient-to-r bg-[#00926c] bg-clip-text text-transparent"
          >
            Coordinated Sharing Behavior Detection
          </motion.h1>

          <div className="flex items-center justify-center gap-4">
            <div className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-medium flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2">
                1
              </span>
              Dataset Upload
            </div>
          </div>
        </div>

        {/* Action Buttons */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-lg font-medium text-black-600 hover:bg-blue-200 transition-colors flex items-center"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Cancel
          </button>

          {/* Progress Bar in the middle */}
          <div className="mx-4 flex-grow max-w-xs">
            <ProgressBar currentStep={1} totalSteps={3} />
          </div>
          <button
            onClick={nextStep}
            disabled={!formData.csvFile}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center ${
              formData.csvFile
                ? "bg-gradient-to-r bg-[#00926c] text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next Step
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </motion.div>

        {/* Dropzone Area */}
        {!formData.csvFile ? (
          <motion.div
            {...getRootProps()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all
      ${
        isDragActive
          ? "border-blue-500 bg-gradient-to-br bg-[#00926c]"
          : "border-gray-200 bg-white hover:border-blue-400"
      }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <motion.div
                animate={{ y: isDragActive ? [-2, 2, -2] : 0 }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <Upload className="w-12 h-12 text-blue-500" />
              </motion.div>

              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-gray-800">
                  {isDragActive ? "Drop to upload" : "Select CSV file"}
                </p>
                <p className="text-sm text-gray-500">
                  Drag & drop your dataset or{" "}
                  <span className="text-blue-600 font-medium">
                    browse files
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supported format: .csv (max 50MB)
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-[#00926c]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {formData.csvFile.name}
                  </h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-gray-500">
                      {(formData.csvFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="text-[#00926c] bg-blue-100 px-2 py-1 rounded-full text-xs font-medium">
                      Ready for analysis
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 hover:bg-red-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-red-500 hover:text-red-600" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UploadDatasetStep;
