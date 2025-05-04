const express = require("express");
const router = express.Router();
const {
  getAllCsvFiles,
  deleteCsvFile,
  getCsvFile,
} = require("../controllers/storedCsvController"); // New file controller

// New endpoints for file management
router.post("/csv-files", getAllCsvFiles);
router.get("/csv-files/:filename", getCsvFile);
router.delete("/csv-files/:filename", deleteCsvFile);

module.exports = router;
