import { motion, AnimatePresence } from "framer-motion";
import { DocumentDuplicateIcon } from "@heroicons/react/24/solid";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";

export default function DuplicateModal({
  isOpen,
  onClose,
  onConfirm,
  projectData,
  title = "Duplicate Project",
  confirmText = "Duplicate",
  confirmColor = "blue",
  disabled = false,
  children,
}) {
  // Create validation schema
  const validationSchema = Yup.object({
    projectName: Yup.string().required("Project name is required"),
    minParticipation: Yup.number()
      .required("Minimum participation is required")
      .min(1, "Must be at least 1"),
    timeWindow: Yup.number()
      .required("Time window is required")
      .min(1, "Must be at least 1"),
    edgeWeight: Yup.number()
      .required("Edge weight is required")
      .min(0, "Must be at least 0"),
  });

  // Setup formik with initial values from projectData
  const formik = useFormik({
    initialValues: {
      projectName: projectData?.projectName
        ? `${projectData.projectName} (Copy)`
        : "",
      minParticipation: projectData?.minParticipation || 2,
      timeWindow: projectData?.timeWindow || 60,
      edgeWeight: projectData?.edgeWeight || 0.5,
    },
    validationSchema,
    onSubmit: (values) => {
      onConfirm(values);
    },
  });

  // Add effect to reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl"
          >
            <div className="flex items-start mb-4">
              <DocumentDuplicateIcon className="w-6 h-6 text-blue-500 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Please customize the settings for your duplicated project:
                </p>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Project Name Field */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <label
                  htmlFor="projectName"
                  className="text-sm font-medium md:col-span-1 md:text-right"
                >
                  Project Name:
                </label>
                <div className="md:col-span-2">
                  <input
                    id="projectName"
                    type="text"
                    name="projectName"
                    value={formik.values.projectName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`p-2 border ${
                      formik.touched.projectName && formik.errors.projectName
                        ? "border-red-500"
                        : "border-gray-300"
                    } shadow-sm rounded-md w-full`}
                  />
                  {formik.touched.projectName && formik.errors.projectName && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.projectName}
                    </p>
                  )}
                </div>
              </div>

              {/* Min Participation Field */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <label
                  htmlFor="minParticipation"
                  className="text-sm font-medium md:col-span-1 md:text-right"
                >
                  Minimum Participation:
                </label>
                <div className="md:col-span-2">
                  <input
                    id="minParticipation"
                    type="number"
                    name="minParticipation"
                    value={formik.values.minParticipation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`p-2 border ${
                      formik.touched.minParticipation &&
                      formik.errors.minParticipation
                        ? "border-red-500"
                        : "border-gray-300"
                    } shadow-sm rounded-md w-full`}
                  />
                  {formik.touched.minParticipation &&
                    formik.errors.minParticipation && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.minParticipation}
                      </p>
                    )}
                </div>
              </div>

              {/* Time Window Field */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <label
                  htmlFor="timeWindow"
                  className="text-sm font-medium md:col-span-1 md:text-right"
                >
                  Time Window (seconds):
                </label>
                <div className="md:col-span-2">
                  <input
                    id="timeWindow"
                    type="number"
                    name="timeWindow"
                    value={formik.values.timeWindow}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`p-2 border ${
                      formik.touched.timeWindow && formik.errors.timeWindow
                        ? "border-red-500"
                        : "border-gray-300"
                    } shadow-sm rounded-md w-full`}
                  />
                  {formik.touched.timeWindow && formik.errors.timeWindow && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.timeWindow}
                    </p>
                  )}
                </div>
              </div>

              {/* Edge Weight Field */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <label
                  htmlFor="edgeWeight"
                  className="text-sm font-medium md:col-span-1 md:text-right"
                >
                  Edge Weight:
                </label>
                <div className="md:col-span-2">
                  <input
                    id="edgeWeight"
                    type="number"
                    name="edgeWeight"
                    value={formik.values.edgeWeight}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`p-2 border ${
                      formik.touched.edgeWeight && formik.errors.edgeWeight
                        ? "border-red-500"
                        : "border-gray-300"
                    } shadow-sm rounded-md w-full`}
                  />
                  {formik.touched.edgeWeight && formik.errors.edgeWeight && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.edgeWeight}
                    </p>
                  )}
                </div>
              </div>

              {children}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disabled}
                  className={`px-4 py-2 flex items-center justify-center ${
                    confirmColor === "red"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : confirmColor === "blue"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  } rounded-lg transition-colors w-24`}
                >
                  {disabled ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
