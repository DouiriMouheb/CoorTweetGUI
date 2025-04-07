const User = require("../models/user");
const jwt = require("jsonwebtoken");

const creatToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    // create token
    const token = creatToken(user._id);
    const username = user.username;
    const userId = user._id;
    res.status(200).json({ email, username, userId, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup user
const signupUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.signup(username, email, password);
    // create token
    const token = creatToken(user._id);
    const userId = user._id;
    res.status(200).json({ email, username, userId, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  loginUser,
  signupUser,
};
