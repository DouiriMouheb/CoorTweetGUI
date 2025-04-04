import React from "react";
import { useState, useEffect } from "react";
const PrepareDataset = ({ nextStep, prevStep, formData, setFormData }) => {
  console.log(formData);
  const [columns, setColumns] = useState([]);
  const [updatedHeaders, setUpdatedHeaders] = useState([]);
  useEffect(() => {
    if (formData.csvHeaders && formData.csvHeaders.length > 0) {
      setColumns(
        formData.csvHeaders.map((header, index) => ({
          name: header,
          newName: header, // Default new name is the same as the original
          checked: false, // Default state is unchecked
          index: index, // Save index
        }))
      );
    }
  }, [formData.csvHeaders]);

  // Function to update the updatedHeaders state
  const updateSelectedColumns = (updatedColumns) => {
    const selected = updatedColumns
      .filter((col) => col.checked) // Get only checked items
      .map((col) => ({ index: col.index, newName: col.newName })); // Store index and new name

    setUpdatedHeaders(selected);
  };
  // Handle checkbox toggle
  const handleCheckboxChange = (index) => {
    const updatedColumns = columns.map((col, i) =>
      i === index ? { ...col, checked: !col.checked } : col
    );

    setColumns(updatedColumns);
    updateSelectedColumns(updatedColumns);
  };

  // Handle text input change
  const handleInputChange = (index, value) => {
    const updatedColumns = columns.map((col, i) =>
      i === index ? { ...col, newName: value } : col
    );

    setColumns(updatedColumns);
    updateSelectedColumns(updatedColumns);
  };
  return (
    <>
      <h1 className="text-xl font-semibold text-center">
        Coordinated Sharing Behaviour Detection
      </h1>
      <h2 className="text-lg font-bold mb-4">Phase 2: Prepare Dataset</h2>
      <p className="text-gray-600 mb-4">
        Map your columns to the required fields below:
      </p>
      <h1>{formData.csvHeaders}</h1>
      <div>
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="border px-4 py-2">✔</th>
              <th className="border px-4 py-2">Column name</th>
              <th className="border px-4 py-2">New column name</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col, index) => (
              <tr key={index}>
                {/* Checkbox */}
                <td className="border px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={col.checked}
                    onChange={() => handleCheckboxChange(index)}
                  />
                </td>
                {/* Column Name (Static) */}
                <td className="border px-4 py-2">{col.name}</td>
                {/* Editable Input */}
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={col.newName}
                    disabled={!col.checked} // Disable when checkbox is unchecked
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className={`w-full px-2 py-1 border ${
                      col.checked ? "bg-white" : "bg-gray-200 text-gray-500"
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Display updatedHeaders for debugging */}
        <pre className="mt-4 p-2 bg-gray-100 border">
          {JSON.stringify(updatedHeaders, null, 2)}
        </pre>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={prevStep}
        >
          Back
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              updatedHeaders: updatedHeaders,
            }));
            nextStep();
          }}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default PrepareDataset;
