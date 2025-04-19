const Network = require("../models/network");

// Save network data
const saveNetwork = async (req, res) => {
  const { data, networkName } = req.body;
  const userId = req.user._id; // Get userId from authenticated user

  try {
    const network = await Network.create({ userId, data, networkName });
    res.status(201).json(network);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get networks data by user
const getNetworks = async (req, res) => {
  const userId = req.user._id; // Get userId from authenticated user

  try {
    const network = await Network.find({ userId });
    if (!network || network.length === 0) {
      return res.status(404).json({ error: "Networks not found" });
    }
    res.status(200).json(network);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get network by id
const getNetwork = async (req, res) => {
  const { networkId } = req.body;
  const userId = req.user._id; // Get userId from authenticated user

  try {
    const network = await Network.findOne({ _id: networkId, userId }); // Only return if belongs to user
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
  const userId = req.user._id; // Get userId from authenticated user

  try {
    const networks = await Network.find({ userId });

    if (!networks || networks.length === 0) {
      return res.status(404).json({ error: "Networks not found" });
    }

    // Create an array of objects with both name and id
    const networkData = networks.map((network) => ({
      id: network._id,
      name: network.networkName,
    }));

    res.status(200).json(networkData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete network data
const deleteNetwork = async (req, res) => {
  const { networkId } = req.body; // Changed from networkID to networkId for consistency
  const userId = req.user._id; // Get userId from authenticated user

  try {
    // Only delete if belongs to user
    const network = await Network.findOneAndDelete({ _id: networkId, userId });
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
