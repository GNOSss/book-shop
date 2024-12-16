const conn = require("../db");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // 비밀번호 암호화 모듈 (복호화 불가능한 방식)
const dotenv = require("dotenv");
dotenv.config();

// 좋아요 추가
const addLike = (req, res) => {
  // id : 파라미터 변수명, DB에서는 liked_book_id 컬럼
  const { id } = req.params;
  const { user_id } = req.body;

  let sql = `INSERT INTO likes (user_id, liked_book_id) VALUES (?,?)`;

  let values = [user_id, id];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ error: "데이터베이스 오류입니다." });
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

const removeLike = (req, res) => {
  // id : 파라미터 변수명, DB에서는 liked_book_id 컬럼
  const { id } = req.params;
  const { user_id } = req.body;

  let sql = `DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?`;

  let values = [user_id, id];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ error: "데이터베이스 오류입니다." });
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

module.exports = { addLike, removeLike };
