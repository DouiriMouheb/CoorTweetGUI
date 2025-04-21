const { spawn } = require("child_process");
const path = require("path");
const cleanupFile = require("../helpers/cleanupFile");

// Define the path to your R script - adjust this to match your project structure
const scriptPath = path.resolve(__dirname, "../scriptR", "scriptCoorTweet.R");

const runrCode = async (req, res) => {
  const { min_participation, time_window, subgraph, edge_weight } = req.body;
  const filePath = req.file ? path.resolve(req.file.path) : "";

  // Validate inputs first
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
        message: "Missing required parameters or file",
      },
    });
  }

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
      await cleanupFile(filePath);
      return res.json(resultJson);
    } catch (stdoutError) {
      console.error("Failed to parse R stdout as JSON:", stdoutError);

      await cleanupFile(filePath);

      // Existing error handling...
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
    await cleanupFile(filePath);

    return res.status(500).json({
      status: "error",
      error: {
        stage: "process_execution",
        message: `Failed to execute R script: ${error.message}`,
      },
    });
  });
};

module.exports = {
  runrCode,
};
