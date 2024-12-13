const conn = require("../db");
const { StatusCodes } = require("http-status-codes");

// (카테고리별 , 신간 여부) 전체 도서 목록 조회
const allBooks = (req, res) => {
  let { category_id, newBook, limit, currentPage } = req.query;

  // limit : page당 보여줄 갯 수
  // currentPage : 현재 페이지(숫자)
  // offset : (current-1)*limit

  let offset = limit * (currentPage - 1);

  let sql = `SELECT * FROM books `;
  let values = [];

  if (category_id && newBook) {
    // category별 신간
    sql += ` WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 month) AND NOW()`;
    values = [category_id];
  } else if (category_id) {
    // category별
    sql += ` WHERE category_id = ? `;
    values = [category_id];
  } else if (newBook) {
    // 신간
    sql +=
      " WHERE pub_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 month) AND NOW()";
  }

  sql += ` LIMIT ? OFFSET ?`;
  values.push(parseInt(limit), offset);

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ error: "데이터베이스 오류입니다." });
    }
    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

const bookDetail = (req, res) => {
  // req.params은 JSON형태이기 비구조화로 id에 할당이 가능하다.
  // 만약 아래 코드에서 parseInt를 적용하면 숫자타입이되고 .. 그럼 비구조화로 변수 할당 불가
  let { id } = req.params;

  let sql = `SELECT *
      FROM 
        books b
      JOIN 
        category c
      ON 
        b.category_id = c.id
      WHERE b.id = ?;
      `;

  conn.query(sql, id, (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ error: "데이터베이스 오류입니다." });
    }
    if (results && results.length) {
      // 만약 .json(result)으로 반환하면  [{값}] 이 될 것이고
      // .json(result[0])으로 반환하면 {값} 이 될 것이다. (어짜피 개별 도서 조회니깐)
      return res.status(StatusCodes.OK).json(results[0]);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

module.exports = { allBooks, bookDetail };
