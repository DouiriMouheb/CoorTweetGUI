const express = require("express");
const {
  runrDuplicateCode,
} = require("../controllers/runrDuplicateCodeController");
const router = express.Router();

// Define the route
router.post("/run-r-duplicate", runrDuplicateCode);

module.exports = router;
