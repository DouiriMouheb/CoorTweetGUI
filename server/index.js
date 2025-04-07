const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const { mongoose } = require("mongoose");
const userRoutes = require("./routes/user");
const networkRoutes = require("./routes/network");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
//
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log("Database not connected", err);
  });
// middleware
// Middleware

// With just this one configuration:
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//app.use("/", require("./routes/authRoutes"));
app.use("/api/user", userRoutes);
app.use("/api/network", networkRoutes);
// Multer setup for file upload
const upload = multer({ dest: "uploads/" });
const scriptPath = path.resolve(__dirname, "scriptR", "scriptCoorTweet.R");

// API Route to execute the R script
app.post("/run-r", upload.single("input"), (req, res) => {
  const { min_participation, time_window, subgraph, edge_weight } = req.body;
  const filePath = req.file ? path.resolve(req.file.path) : "";

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

  let result = "";
  let errorOutput = "";
  rProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  rProcess.stderr.on("data", (data) => {
    console.error(`R Error: ${data}`);
  });
  rProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error(`R Error: ${data.toString()}`); // Log R errors more clearly
  });

  rProcess.on("close", (code) => {
    console.log(`R script finished with exit code: ${code}`);
    if (code === 0) {
      try {
        res.json(JSON.parse(result));
      } catch (error) {
        res.status(500).json({ error: "Invalid JSON from R script" });
      }
    } else {
      console.error(`R script failed with exit code: ${code}`);
      console.error("Error Output: ", errorOutput); // Log the detailed error output
      res
        .status(500)
        .json({ error: "R script execution failed", details: errorOutput });
    }
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
