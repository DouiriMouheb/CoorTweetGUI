const express = require("express");
const {
  saveNetwork,
  getNetworks,
  getNetworkNames,
  getNetwork,
  deleteNetwork,
} = require("../controllers/networkController");
const router = express.Router();

router.post("/save-network", saveNetwork);

router.post("/get-networks", getNetworks);
router.post("/get-network", getNetwork);
// get networks names for each user
router.post("/get-networks-names", getNetworkNames);
router.post("/delete-network", deleteNetwork);
module.exports = router;
