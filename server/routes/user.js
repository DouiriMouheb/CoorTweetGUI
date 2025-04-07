const express = require("express");
const router = express.Router();
//Controllers FUNCTION
const { loginUser, signupUser } = require("../controllers/userController");

//login route
router.post("/login", loginUser);
// signup route
router.post("/register", signupUser);

module.exports = router;
