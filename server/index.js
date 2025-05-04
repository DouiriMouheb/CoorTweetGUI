const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const { mongoose } = require("mongoose");
const userRoutes = require("./routes/user");
const networkRoutes = require("./routes/network");
const cookieParser = require("cookie-parser");
const runrRoutes = require("./routes/runrCode");
const runrDuplicateRoutes = require("./routes/runrDuplicateCode");
const storedCsvRoutes = require("./routes/storedCsv"); // New route for file management
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
// Middleware

// With just this one configuration:
app.use(
  cors({
    origin: ["http://localhost:5173", "https://douirilabs.studio"], // Note: array syntax and no trailing slash
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/api/user", userRoutes);
app.use("/api/network", networkRoutes);
// Multer setup for file upload

// API Route to execute the R script
app.use("/r", runrRoutes);
app.use("/r-duplicate", runrDuplicateRoutes);
app.use("/stored-csv", storedCsvRoutes); // New route for file management

const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
