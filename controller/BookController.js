const conn = require('../db');
const { StatusCodes } = require('http-status-codes');
const ensureAuthorization = require('../middleware/Auth');
const jwt = require('jsonwebtoken');

// (카테고리별 , 신간 여부) 전체 도서 목록 조회
const allBooks = (req, res) => {
  let allBooksResponse = {};

  let { category_id, newBook, limit, currentPage } = req.query;

  // limit : page당 보여줄 갯 수
  // currentPage : 현재 페이지(숫자)
  // offset : (current-1)*limit

  let offset = limit * (currentPage - 1);

  let sql = `SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS 'likes' FROM books `;
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
    sql += ' WHERE pub_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 month) AND NOW()';
  }

  sql += ` LIMIT ? OFFSET ?`;
  values.push(parseInt(limit), offset);

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
    }
    if (results.length) {
      results.map((results) => {
        results.pubDate = results.pub_date;
        delete results.pub_date;
      });
      allBooksResponse.books = results;
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });

  sql = ` SELECT FOUND_ROWS() `;

  conn.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
    }

    console.log(results);

    let pagination = {};
    pagination.currentPage = parseInt(currentPage); // req.query로 받은 값
    pagination.totalCount = results[0]['FOUND_ROWS()']; // FOUND_ROWS() 함수로 가져온 값

    allBooksResponse.pagination = pagination;

    return res.status(StatusCodes.OK).json(allBooksResponse);
  });
};

const bookDetail = (req, res) => {
  // 로그인 상태가 아니면 SQL쿼리문에 AS liked 빼고 요청
  // 로그인 상태이면 SQL쿼리문에 AS liked 추가하고 요청
  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요.',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  } else if (authorization instanceof ReferenceError) {
    // 비 로그인 상태일때
    let book_id = req.params.id;

    let values = [book_id];

    let sql = `SELECT * , 
            (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS 'likes'
              FROM books 
              JOIN 
                  category
                ON 
                  books.category_id = category.category_id
              WHERE books.id =?
      `;

    executeQuery(res, sql, values);
  } else {
    // 로그인 상태일때
    let book_id = req.params.id;

    let values = [authorization.id, book_id, book_id];

    let sql = `SELECT * , 
            (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS 'likes',
            (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?)) AS liked
              FROM books 
              JOIN 
                  category
                ON 
                  books.category_id = category.category_id
              WHERE books.id = ?
      `;

    executeQuery(res, sql, values);
  }
};

function executeQuery(res, sql, values) {
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_GATEWAY).json({ error: '데이터베이스 오류입니다.' });
    }
    if (results && results.length) {
      // 만약 .json(result)으로 반환하면  [{값}] 이 될 것이고
      // .json(result[0])으로 반환하면 {값} 이 될 것이다. (어짜피 개별 도서 조회니깐)
      return res.status(StatusCodes.OK).json(results[0]);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
}

module.exports = { allBooks, bookDetail };
