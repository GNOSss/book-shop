const ensureAuthorization = require('../middleware/Auth');
const conn = require('../db');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

// 장바구니 담기
const addToCart = (req, res) => {
  const { book_id, quantity } = req.body;

  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요.',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  } else {
    let sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?,?,?);`;

    let values = [book_id, quantity, authorization.id];

    conn.query(sql, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
      }

      return res.status(StatusCodes.OK).json(results);
    });
  }
};

// 장바구니 아이템 목록 조회
const getCartItems = (req, res) => {
  const { selected } = req.body;

  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요.',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  } else {
    // '장바구니 보기'
    let sql = `SELECT c.id, c.book_id, b.title, b.summary, c.quantity, b.price
    FROM cartItems c JOIN books b 
    ON c.book_id = b.id WHERE c.user_id = ?`;

    let values = [authorization.id];

    if (selected) {
      // 주문서 작성 시 '선택한 장바구니 목록 조회'
      sql += ` AND c.id IN (?) `;
      values.push(selected); // values = [authorization.id, ...selected] 이 문법은 배열 구조가 옳지 못함
    }

    conn.query(sql, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
      }

      return res.status(StatusCodes.OK).json(results);
    });
  }
};

// 장바구니 도서 삭제
const removeCartItem = (req, res) => {
  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요.',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  } else {
    const cartItemId = req.params.id;

    let sql = `DELETE FROM cartItems WHERE id = ?`;

    conn.query(sql, cartItemId, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
      }

      return res.status(StatusCodes.OK).json(results);
    });
  }
};

module.exports = { addToCart, getCartItems, removeCartItem };
