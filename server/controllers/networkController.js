const Network = require("../models/network");

// Save network data
const saveNetwork = async (req, res) => {
  const {
    userId,
    data,
    networkName,
    minParticipation,
    timeWindow,
    edgeWeight,
  } = req.body;

  try {
    const network = await Network.create({
      userId,
      data,
      networkName,
      minParticipation,
      timeWindow,
      edgeWeight,
    });
    res.status(201).json(network);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get networks data bu user
const getNetworks = async (req, res) => {
  const { userId } = req.body;

  try {
    const network = await Network.find({ userId });
    if (!network) {
      return res.status(404).json({ error: "Network not found" });
    }
    res.status(200).json(network);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// get network by id
const getNetwork = async (req, res) => {
  const { networkId } = req.body;

  try {
    const network = await Network.findById(networkId);
    if (!network) {
      return res.status(404).json({ error: "Network not found" });
    }
    res.status(200).json(network);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// get network names for each user

const getNetworkNames = async (req, res) => {
  const { userId } = req.body;

  try {
    const networks = await Network.find({ userId });

    if (!networks || networks.length === 0) {
      return res.status(200).json({
        message: "No networks found for this user. Try creating a new project.",
      });
    }

    // Create an array of objects with both name and id
    const networkData = networks.map((network) => ({
      id: network._id,
      name: network.networkName,
    }));

    res.status(200).json(networkData);
  } catch (error) {
    console.error("Error retrieving networks:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Delete network data
// lazmni nbadel l ID
const deleteNetwork = async (req, res) => {
  const { networkID } = req.body;

  try {
    const network = await Network.findByIdAndDelete(networkID);
    if (!network) {
      return res.status(404).json({ error: "Network not found" });
    }
    res.status(200).json({ message: "Network deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  saveNetwork,
  getNetworks,
  deleteNetwork,
  getNetworkNames,
  getNetwork,
};
