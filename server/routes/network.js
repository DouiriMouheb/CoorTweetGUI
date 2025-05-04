const express = require("express");
const {
  saveNetwork,
  getNetworks,
  getNetworkNames,
  getNetwork,
  deleteNetwork,
} = require("../controllers/networkController");
const requireAuth = require("../middleware/requireAuth"); // Import middleware
const router = express.Router();

// Apply authentication middleware to all network routes
router.use(requireAuth);

router.post("/save-network", saveNetwork);
router.post("/get-networks", getNetworks);
router.post("/get-network", getNetwork);
router.post("/get-networks-names", getNetworkNames);
router.post("/delete-network", deleteNetwork);

module.exports = router;
