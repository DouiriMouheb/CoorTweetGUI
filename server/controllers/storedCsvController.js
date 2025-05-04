const path = require("path");
const fs = require("fs");

// Define the directory where CSV files are stored
const uploadDir = path.resolve(__dirname, "../uploads");

/**
 * Get all CSV files from the uploads directory, optionally filtered by userId
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getAllCsvFiles = async (req, res) => {
  try {
    // Get userId from query parameters
    const { userId } = req.query;

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      return res.json({
        status: "success",
        files: [],
      });
    }

    // Read all files in the uploads directory
    const files = fs.readdirSync(uploadDir);

    // Filter only CSV files
    let csvFiles = files.filter((file) => file.endsWith(".csv"));

    // If userId is provided, filter files that contain the userId
    if (userId) {
      csvFiles = csvFiles.filter((file) => file.includes(userId));
    }

    // Return the list of CSV files
    return res.json({
      status: "success",
      files: csvFiles,
    });
  } catch (error) {
    console.error("Error fetching CSV files:", error);
    return res.status(500).json({
      status: "error",
      error: {
        stage: "file_listing",
        message: `Failed to list CSV files: ${error.message}`,
      },
    });
  }
};

/**
 * Delete a specific CSV file by name
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const deleteCsvFile = async (req, res) => {
  const { filename } = req.params;

  try {
    // Check if filename is provided
    if (!filename) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: "Filename is required",
        },
      });
    }

    // Sanitize the filename to prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(uploadDir, sanitizedFilename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "error",
        error: {
          stage: "file_not_found",
          message: `File '${sanitizedFilename}' not found`,
        },
      });
    }

    // Verify that the file is a CSV
    if (!sanitizedFilename.endsWith(".csv")) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: "Only CSV files can be deleted through this endpoint",
        },
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    return res.json({
      status: "success",
      message: `File '${sanitizedFilename}' has been deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting CSV file:", error);
    return res.status(500).json({
      status: "error",
      error: {
        stage: "file_deletion",
        message: `Failed to delete file: ${error.message}`,
      },
    });
  }
};

/**
 * Get a specific CSV file by name
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getCsvFile = async (req, res) => {
  const { filename } = req.params;

  try {
    // Check if filename is provided
    if (!filename) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: "Filename is required",
        },
      });
    }

    // Sanitize the filename to prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(uploadDir, sanitizedFilename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "error",
        error: {
          stage: "file_not_found",
          message: `File '${sanitizedFilename}' not found`,
        },
      });
    }

    // Verify that the file is a CSV
    if (!sanitizedFilename.endsWith(".csv")) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: "Only CSV files can be accessed through this endpoint",
        },
      });
    }

    // Set appropriate headers for file download
    res.setHeader(
      "Content-disposition",
      `attachment; filename=${sanitizedFilename}`
    );
    res.setHeader("Content-type", "text/csv");

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving CSV file:", error);
    return res.status(500).json({
      status: "error",
      error: {
        stage: "file_retrieval",
        message: `Failed to retrieve file: ${error.message}`,
      },
    });
  }
};

module.exports = {
  getAllCsvFiles,
  deleteCsvFile,
  getCsvFile,
};
