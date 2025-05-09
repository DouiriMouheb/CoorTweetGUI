const express = require("express");
const router = express.Router();
//Controllers FUNCTION
const { loginUser, signupUser } = require("../controllers/userController");
const passwordController = require("../controllers/passwordController");

//login route
router.post("/login", loginUser);
// signup route
router.post("/register", signupUser);
router.post("/forgot-password", passwordController.forgotPassword);
router.post("/update-password", passwordController.updatePassword);
//router.post("/reset-password/:token", passwordController.resetPassword);
module.exports = router;
