const express = require("express");
const { runrCode } = require("../controllers/runrCodeController");
const router = express.Router();
const multer = require("multer");

// Configure multer storage
const upload = multer({ dest: "uploads/" });

// Define the route
router.post("/run-r", upload.single("input"), runrCode);

module.exports = router;
