const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/login/otp/send", authController.sendLoginOtp);
router.post("/login/otp/verify", authController.verifyLoginOtp);

module.exports = router;
