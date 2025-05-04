const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const cleanupFile = require("../helpers/cleanupFile");

// Define the path to your R script
const scriptPath = path.resolve(__dirname, "../scriptR", "scriptCoorTweet.R");
// Define the directory where you want to store the files
const uploadDir = path.resolve(__dirname, "../uploads");

const runrCode = async (req, res) => {
  const {
    min_participation,
    time_window,
    subgraph,
    edge_weight,
    userId,
    projectName, // Parameter for project name
  } = req.body; // Assuming you have user authentication set up

  let filePath;
  let fullFilename;

  try {
    // Check if file exists in the request
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: "No file uploaded",
        },
      });
    }

    // Validate userId and projectName
    if (!userId || !projectName) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: "userId and projectName are required for file upload",
        },
      });
    }

    // Process the uploaded file
    const tempFilePath = path.resolve(req.file.path);

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create filename with userId-projectName format
    fullFilename = `${userId}-${projectName}.csv`;
    const permanentFilePath = path.join(uploadDir, fullFilename);

    // Save file to permanent location
    fs.copyFileSync(tempFilePath, permanentFilePath);

    // Clean up the temp file
    await cleanupFile(tempFilePath);

    filePath = permanentFilePath;

    // Validate inputs
    if (
      !min_participation ||
      !time_window ||
      !subgraph ||
      !edge_weight ||
      !filePath
    ) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: "Missing required parameters or dataset not found",
        },
      });
    }

    // Execute R script with parameters
    const rProcess = spawn("Rscript", [
      scriptPath,
      min_participation,
      time_window,
      subgraph,
      edge_weight,
      filePath,
    ]);

    console.log(
      `Executing: Rscript ${scriptPath} ${min_participation} ${time_window} ${subgraph} ${edge_weight} ${filePath}`
    );

    let stdoutData = "";
    let stderrData = "";

    // Collect stdout data
    rProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    // Collect stderr data
    rProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    rProcess.on("close", async (code) => {
      try {
        const resultJson = JSON.parse(stdoutData);
        resultJson.filename = fullFilename;
        return res.json(resultJson);
      } catch (stdoutError) {
        console.error("Failed to parse R stdout as JSON:", stdoutError);

        if (stderrData) {
          console.error("R stderr output:", stderrData);
          return res.status(500).json({
            status: "error",
            error: {
              stage: "r_execution",
              message:
                stderrData.trim() ||
                "R script execution failed with an unknown error",
            },
          });
        }

        return res.status(500).json({
          status: "error",
          error: {
            stage: "unknown",
            message: "Failed to process R script output",
          },
        });
      }
    });

    // Handle any errors spawning the R process
    rProcess.on("error", async (error) => {
      console.error("Failed to start R process:", error);

      return res.status(500).json({
        status: "error",
        error: {
          stage: "process_execution",
          message: `Failed to execute R script: ${error.message}`,
        },
      });
    });
  } catch (error) {
    console.error("Error in runrCode:", error);

    // Clean up temp file if it exists
    if (req.file) {
      await cleanupFile(req.file.path);
    }

    return res.status(500).json({
      status: "error",
      error: {
        stage: error.message.includes("Dataset not found")
          ? "dataset_retrieval"
          : "file_processing",
        message: error.message,
      },
    });
  }
};

module.exports = {
  runrCode,
};
