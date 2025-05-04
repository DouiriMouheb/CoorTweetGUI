const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");

// user schema////
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Add these fields for password reset
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  lastPasswordResetRequest: Date,
});

// statics method to signup user
userSchema.statics.signup = async function (username, email, password) {
  //validation
  if (!email || !password) {
    throw Error("Email and password are required");
  }
  if (!validator.isEmail(email)) {
    throw Error("Invalid email");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("email already exists");
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({
    username,
    email,
    password: hash,
  });
  return user;
};

// statics method to login user
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields are required");
  }
  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Invalid email");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Invalid password");
  }
  return user;
};

// Add method to create password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and store it in the database
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiry (1 hour from now)
  this.resetPasswordExpiry = Date.now() + 3600000;

  // Return the unhashed token to send via email
  return resetToken;
};

// Add method to reset password
userSchema.statics.resetPassword = async function (token, newPassword) {
  if (!newPassword) {
    throw Error("Password is required");
  }
  if (!validator.isStrongPassword(newPassword)) {
    throw Error("Password is not strong enough");
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid token
  const user = await this.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw Error("Token is invalid or has expired");
  }

  // Update password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Clear reset token fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  return user;
};

module.exports = mongoose.model("User", userSchema);
