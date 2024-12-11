const express = require("express");
const router = express.Router();
const { StatusCodes } = require("http-status-codes");
const {
  joinUser,
  login,
  passwordResetRequest,
  passwordReset,
} = require("../controller/UserController");

router.use(express.json());

router.post("/join", joinUser);

router.post("/login", login);

router.post("/reset", passwordResetRequest);

router.put("/reset", passwordReset);

module.exports = router;
