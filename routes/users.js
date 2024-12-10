const express = require("express");
const router = express.Router();
router.use(express.json());

// register
router.post("/join", [], (req, res) => {
  res.json("회원가입");
});

// login
router.post("/login", [], (req, res) => {
  res.json("로그인");
});

// request reset password
router.post("/reset", [], (req, res) => {
  res.json("비번 초기화 요청");
});

// reset password
router.put("/reset", [], (req, res) => {
  res.json("비번 초기화");
});

module.exports = router;
