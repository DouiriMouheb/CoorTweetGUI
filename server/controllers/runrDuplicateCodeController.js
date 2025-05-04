const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const cleanupFile = require("../helpers/cleanupFile");

// Define the path to your R script
const scriptPath = path.resolve(__dirname, "../scriptR", "scriptCoorTweet.R");
// Define the directory where uploads are stored
const uploadsDir = path.resolve(__dirname, "../uploads");

const runrDuplicateCode = async (req, res) => {
  // Extract parameters from the request body or FormData
  const min_participation =
    req.body.min_participation || req.body.minParticipation;
  const time_window = req.body.time_window || req.body.timeWindow;
  const subgraph = req.body.subgraph || 1; // Default to 1 if not provided
  const edge_weight = req.body.edge_weight || req.body.edgeWeight;
  const userId = req.body.userId;
  const projectName = req.body.projectName;
  const dataSetName = req.body.dataSetName || req.body.filename; // Accept either name

  try {
    // No need to check for req.file since we're using an existing file
    if (!dataSetName) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: "No dataSetName provided",
        },
      });
    }

    // Validate userId and projectName
    if (!userId || !projectName) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: "userId and projectName are required",
        },
      });
    }

    // Construct the full file path
    const filePath = path.join(uploadsDir, dataSetName);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: `File ${dataSetName} not found in uploads directory`,
        },
      });
    }

    // Validate inputs
    if (!min_participation || !time_window || !subgraph || !edge_weight) {
      return res.status(400).json({
        status: "error",
        error: {
          stage: "input_validation",
          message: "Missing required parameters",
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
      filePath, // Pass the full file path to the R script
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
        resultJson.filename = dataSetName; // Use dataSetName as the filename in the response
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
    console.error("Error in runrDuplicateCode:", error);

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
  runrDuplicateCode,
};
