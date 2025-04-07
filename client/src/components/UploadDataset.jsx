import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import Papa from "papaparse";

const UploadDataset = ({ nextStep, formData, setFormData, onCancel }) => {
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
    maxSize: 15 * 1024 * 1024, // 15MB
  });

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      csvFile: null,
    }));
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Coordinated Sharing Behavior Detection
        </h1>
        <div className="flex items-center mt-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            1
          </div>
          <div className="ml-3 text-xl font-medium text-blue-500">
            Dataset Upload
          </div>
        </div>
        <div className="w-full h-1 bg-gray-200 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: formData.csvFile ? "30%" : "5%" }}
          ></div>
        </div>
      </div>

      {!formData.csvFile ? (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-blue-50 hover:bg-blue-100 transition duration-300 cursor-pointer"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center">
            <Upload className="text-blue-500 w-16 h-16 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium text-xl">
                Drop your CSV file here...
              </p>
            ) : (
              <>
                <p className="text-blue-600 font-medium text-xl mb-2">
                  Drop your CSV dataset or click to browse
                </p>
                <p className="text-gray-500">
                  Upload a CSV file to detect coordinated sharing patterns
                </p>
                <p className="text-gray-400 text-sm mt-4">
                  Supported format: .csv (max 15MB)
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File information */}
          <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <FileText className="text-blue-500 w-10 h-10 mr-4" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-gray-800">
                  {formData.csvFile.name}
                </h3>
                <button
                  onClick={removeFile}
                  className="p-1 rounded-full bg-white text-red-500 hover:bg-red-100 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center mt-1 text-sm text-gray-500 space-x-4"></div>
            </div>
          </div>
        </div>
      )}

      {/* Next and Cancel buttons */}
      <div className="mt-8 flex justify-between">
        {/* Cancel button */}
        <button
          className="px-6 py-3 rounded-lg flex items-center bg-red-200 hover:bg-red-300 text-black-700 transition-all"
          onClick={onCancel}
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          <span>Cancel </span>
        </button>

        {/* Next button */}
        <button
          className={`px-6 py-3 rounded-lg flex items-center transition-all ${
            formData.csvFile
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={nextStep}
          disabled={!formData.csvFile}
        >
          <span>Continue to Configuration</span>
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </>
  );
};

export default UploadDataset;
