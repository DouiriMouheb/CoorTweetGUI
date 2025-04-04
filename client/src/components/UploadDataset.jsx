import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import Papa from "papaparse";

const UploadDataset = ({ nextStep, formData, setFormData }) => {
  const [columns, setColumns] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFormData((prev) => ({ ...prev, csvFile: file }));

        const reader = new FileReader();
        reader.onload = ({ target }) => {
          const csvText = target.result;
          Papa.parse(csvText, {
            complete: (result) => {
              if (result.data.length > 0) {
                const headers = result.data[0];
                setColumns(headers);
                setFormData((prev) => ({ ...prev, csvHeaders: headers }));
              }
            },
            skipEmptyLines: true,
          });
        };
        reader.readAsText(file);
      }
    },
    [setFormData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".csv",
    maxSize: 15 * 1024 * 1024, // 15MB
  });

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, csvFile: null, csvHeaders: [] }));
    setColumns([]);
  };

  return (
    <>
      <h1 className="text-xl font-semibold text-center">
        Coordinated Sharing Behaviour Detection
      </h1>
      <h2 className="text-lg font-bold mb-4">Phase 1: Upload Dataset</h2>

      {!formData.csvFile ? (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 p-10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition"
        >
          <input {...getInputProps()} />
          <Upload className="text-blue-500 w-12 h-12" />
          {isDragActive ? (
            <p className="text-gray-700 mt-2">Drop the file here...</p>
          ) : (
            <p className="text-gray-700 mt-2">
              Drop your file here or click to upload
            </p>
          )}
          <p className="text-gray-500 text-sm">Max file size: 15MB</p>
        </div>
      ) : (
        <div className="relative flex items-center justify-center h-40 bg-gray-100 rounded-lg shadow-inner">
          <button
            onClick={removeFile}
            className=" p-2 text-red-500 hover:text-red-700"
            aria-label="Remove file"
          >
            <X className="w-8 h-8" />
          </button>
          <span className="text-center text-lg font-medium text-gray-800">
            {formData.csvFile.name}
          </span>
        </div>
      )}

      <button
        className={`mt-4 px-4 py-2 rounded text-white transition 
    ${
      formData.csvFile
        ? "bg-blue-500 hover:bg-blue-600"
        : "bg-gray-400 cursor-not-allowed"
    }`}
        onClick={nextStep}
        disabled={!formData.csvFile}
      >
        Next
      </button>
    </>
  );
};

export default UploadDataset;
