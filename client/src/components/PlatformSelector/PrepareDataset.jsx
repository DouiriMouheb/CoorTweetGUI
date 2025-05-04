import React, { useState, useEffect } from "react";

const PrepareDataset = ({ nextStep, prevStep, formData, setFormData }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Reset selected columns when headers change
    setSelectedColumns([]);
  }, [formData.csvHeaders]);

  // Standard fields for CSV
  const standardFields = [
    { id: "account_id", name: "Account ID", required: true },
    { id: "content_id", name: "Content ID", required: true },
    { id: "object_id", name: "Object ID", required: true },
    { id: "timestamp_share", name: "Timestamp", required: true },
  ];

  // Validate if all required fields are mapped
  useEffect(() => {
    const mappedFields = selectedColumns.map((col) => col.fieldId);
    const missingRequired = standardFields
      .filter((field) => field.required)
      .filter((field) => !mappedFields.includes(field.id));

    setIsFormValid(missingRequired.length === 0);
  }, [selectedColumns]);

  // When mapping changes
  const handleMappingChange = (fieldId, columnIndex) => {
    // Update the selected columns
    const newSelectedColumns = [...selectedColumns];

    // Remove any existing mapping for this field
    const existingIndex = newSelectedColumns.findIndex(
      (mapping) => mapping.fieldId === fieldId
    );

    if (existingIndex >= 0) {
      newSelectedColumns.splice(existingIndex, 1);
    }

    // Only add the new mapping if a valid column was selected (not the empty default option)
    if (columnIndex !== "" && !isNaN(columnIndex)) {
      newSelectedColumns.push({
        fieldId,
        columnIndex,
        columnName: formData.csvHeaders[columnIndex],
      });
    }

    setSelectedColumns(newSelectedColumns);

    // CRITICAL: Update formData immediately
    const updatedHeaders = newSelectedColumns.map((mapping) => ({
      index: mapping.columnIndex,
      newName: mapping.fieldId,
    }));

    setFormData((prev) => ({
      ...prev,
      updatedHeaders,
    }));
  };

  // Validate before moving to next step
  const handleNext = () => {
    // Check required fields
    const mappedFields = selectedColumns.map((col) => col.fieldId);
    const missingRequired = standardFields
      .filter((field) => field.required)
      .filter((field) => !mappedFields.includes(field.id));

    if (missingRequired.length > 0) {
      alert(
        `Please map the required fields: ${missingRequired
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    nextStep();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">Map Your CSV Columns</h1>

      <div className="bg-blue-50 p-3 rounded-md">
        <p>
          Select which columns from your CSV correspond to each required field.
        </p>
      </div>

      {standardFields.map((field) => (
        <div key={field.id} className="p-4 border rounded-md">
          <div className="flex justify-between items-center">
            <label className="font-medium">
              {field.name}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            <select
              value={
                selectedColumns.find((col) => col.fieldId === field.id)
                  ?.columnIndex ?? ""
              }
              onChange={(e) =>
                handleMappingChange(field.id, parseInt(e.target.value))
              }
              className="border p-2 rounded w-64"
            >
              <option value="">-- Select a column --</option>
              {formData.csvHeaders.map((header, index) => {
                // Check if this column is already selected in another dropdown
                const isUsedElsewhere = selectedColumns.some(
                  (col) => col.columnIndex === index && col.fieldId !== field.id
                );

                // Only show this option if it's not used elsewhere or is currently selected for this field
                const isCurrentSelection =
                  selectedColumns.find((col) => col.fieldId === field.id)
                    ?.columnIndex === index;

                if (!isUsedElsewhere || isCurrentSelection) {
                  return (
                    <option key={index} value={index}>
                      {header} {isUsedElsewhere ? "(already mapped)" : ""}
                    </option>
                  );
                } else {
                  // Display used options as disabled
                  return (
                    <option
                      key={index}
                      value={index}
                      disabled
                      style={{ color: "gray" }}
                    >
                      {header}
                    </option>
                  );
                }
              })}
            </select>
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={prevStep}
        >
          Back
        </button>
        <button
          className={`px-4 py-2 ${
            isFormValid ? "bg-blue-500" : "bg-blue-300 cursor-not-allowed"
          } text-white rounded`}
          onClick={handleNext}
          disabled={!isFormValid}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PrepareDataset;
