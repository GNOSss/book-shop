const conn = require("../db");
const { StatusCodes } = require("http-status-codes");

const allCategory = (req, res) => {
  // 카테고리 전체 목록 리스트
  let sql = `SELECT * FROM category`;
  conn.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ error: "데이터베이스 오류입니다." });
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

module.exports = { allCategory };
