import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { Upload } from "lucide-react";

const FileUpload = () => {
  const onDrop = useCallback((acceptedFiles) => {
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".csv, .xlsx, .json",
    maxSize: 15 * 1024 * 1024, // 15MB
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-xl font-semibold text-center"></h1>

      <div className="mt-6 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-lg font-bold mb-4">Phase 1: Upload Dataset</h2>

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

        <div className="mt-4 flex justify-center">next</div>
      </div>
    </div>
  );
};

export default FileUpload;
