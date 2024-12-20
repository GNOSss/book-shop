const conn = require('../db');
const { StatusCodes } = require('http-status-codes');

// 장바구니 담기
const addToCart = (req, res) => {
  const { book_id, quantity, user_id } = req.body;

  let sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?,?,?);`;

  let values = [book_id, quantity, user_id];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

// 장바구니 아이템 목록 조회
const getCartItems = (req, res) => {
  const { user_id, selected } = req.body;

  let sql = `
    SELECT c.id, c.book_id, b.title, b.summary, c.quantity, b.price
    FROM cartItems c JOIN books b 
    ON c.book_id = b.id WHERE c.user_id = ? AND c.id IN (?)
    `;

  //   // 내가 만든 방식 : conn.query()에 values를 할당해야 됨
  //     let sql = `
  //       SELECT c.id, c.book_id, b.title, b.summary, c.quantity, b.price
  //       FROM cartItems c JOIN books b
  //       ON c.book_id = b.id WHERE c.user_id = ?
  //       `;

  //     let values = [user_id];

  //     // selected가 배열인지 확인하고 IN 절에 동적으로 값을 넣음
  //     if (Array.isArray(selected) && selected.length > 0) {
  //       const placeholders = selected.map(() => "?").join(", "); // ?, ?, ? 형태로 변환
  //       sql += ` AND c.id IN (${placeholders})`;
  //       values = [user_id, ...selected]; // user_id와 selected 배열의 값을 결합
  //     }

  conn.query(sql, [user_id, selected], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

// 장바구니 도서 삭제
const removeCartItem = (req, res) => {
  // id : 파라미터 변수명, DB에서는 book_id
  const { id } = req.params;

  let sql = `DELETE FROM cartItems WHERE id = ?`;

  conn.query(sql, id, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

module.exports = { addToCart, getCartItems, removeCartItem };
