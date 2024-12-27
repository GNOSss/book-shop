const ensureAuthorization = require('../middleware/Auth');
const conn = require('../db');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const likeHandler = (req, res) => {
  const book_id = req.params.id;

  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요.',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  }

  const user_id = authorization.id;
  const values = [user_id, book_id];

  if (req.method === 'POST') {
    // 좋아요 추가
    const insertSql = `INSERT INTO likes (user_id, liked_book_id) VALUES (?,?)`;

    conn.query(insertSql, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
      }

      return res.status(StatusCodes.OK).json(results);
    });
  } else if (req.method === 'DELETE') {
    // 좋아요 삭제
    let deleteSql = `DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?`;

    let values = [authorization.id, book_id];

    conn.query(deleteSql, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
      }

      return res.status(StatusCodes.OK).json(results);
    });
  }
};

module.exports = { likeHandler };
